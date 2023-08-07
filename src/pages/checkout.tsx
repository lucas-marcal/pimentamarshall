import axios from "axios";
import { useFormik } from "formik";
import Head from "next/head";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { CartState } from "redux/cart.slice";
import { useAppSelector } from "redux/hooks";
import Loading from "~/components/Loading";
import { api } from "~/utils/api";
import * as Yup from "yup";
import Link from "next/link";
import marshallIcon from "../../public/img/marshall-icn-preto.png";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, setHours, setMinutes } from "date-fns";
import helmetIcon from "../../public/img/helmet-icon.png";
import ptBR from "date-fns/locale/pt-BR";
import Router from "next/router";

interface itemFormattedForAPI {
  name: string;
  value: number;
  amount: number;
}

interface CreateOrderResponse {
  ok: number;
  qrcode: string;
  imagemQrcode: string;
  txid: string;
}

interface CreateOneStepLinkResponse {
  ok: number;
  payment_url: string;
  charge_id: string;
}

const Checkout = () => {
  const [cart, setCart] = useState<CartState>([]);
  const [orderStatus, setOrderStatus] = useState("pre-order");
  const [qrCode, setQrCode] = useState("");
  const [qrCodeImg, setQrCodeImg] = useState("");
  const [paymentURL, setPaymentURL] = useState("");
  const [copyToClipboard, setCopyToClipboard] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [startDate, setStartDate] = useState(addDays(new Date(), 1));
  const [hasLobby, setHasLobby] = useState(false);
  const [paymentState, setPaymentState] = useState("Pendente");
  const [currentOrderID, setCurrentOrderID] = useState("");
  const [telNum, setTelNum] = useState("");
  const [telError, setTelError] = useState(false);

  const currentCart = useAppSelector((state) => state.cart);
  const address = useAppSelector((state) => state.address);
  const shipping = useAppSelector((state) => state.shipping);

  const createOrder = api.order.createOrder.useMutation();
  const createOrderItem = api.order.createOrderItem.useMutation();
  const addTxid = api.order.addTxid.useMutation();

  const currentOrder = api.order.getOneOrder.useQuery(currentOrderID, {
    enabled: currentOrderID !== "",
  });

  useEffect(() => {
    if (currentOrder.data?.status === "PROCESSING") {
      setPaymentState("Pago");
    }
  }, [currentOrderID, paymentState]);

  useEffect(() => {
    const redirectToHome = async () => {
      await Router.push("/");
    };

    if (shipping.id === "") {
      redirectToHome().catch(console.error);
    }
  }, []);

  registerLocale("pt-BR", ptBR);

  const form = useFormik({
    initialValues: {
      nome: "",
      sobrenome: "",
      email: "",
      endereco: address.logradouro,
      numero: "",
      complemento: "",
      bairro: address.bairro,
      cidade: address.localidade,
      estado: address.uf,
      cep: address.cep,
    },
    onSubmit: async (values) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setOrderStatus("ordering");

      const deliveryTime = startDate;

      const order = {
        ...values,
        items: cart,
        shipping: {
          type: shipping.type,
          price: Number(shipping.price) * 100,
          id: shipping.id,
        },
        orderTotal: Number(getTotalPriceWithShipping().toFixed(2)),
        deliveryTime: deliveryTime,
        paymentMethod: paymentMethod,
        hasLobby: hasLobby,
        telefone: telNum,
      };

      console.log("order => ", order);

      const newOrder = await createOrder.mutateAsync(order);
      console.log("newOrder => ", newOrder);
      cart.forEach((cartItem) => {
        createOrderItem.mutate({ ...cartItem, orderId: newOrder.id });
      });
      setCurrentOrderID(newOrder.id);

      if (paymentMethod === "pix") {
        try {
          const { data: result } = await axios.post<CreateOrderResponse>(
            "https://api-pagamentos.pimentamarshall.com.br/create-order",
            order
          );

          const toUpdateTxid = {
            id: newOrder.id,
            txid: result.txid,
          };

          addTxid.mutate(toUpdateTxid);

          setQrCode(result.qrcode);
          setQrCodeImg(result.imagemQrcode);
          setOrderStatus("order-received-pix");
        } catch (error) {
          console.log(error);
          setOrderStatus("error");
        }
      }

      if (paymentMethod === "cardOrBillet") {
        const itemsFormattedForAPI: itemFormattedForAPI[] = [];
        order.items.forEach((item) => {
          itemsFormattedForAPI.push({
            name: item.name,
            value: Number(item.price) * 100,
            amount: item.quantity,
          });
        });

        const cardOrBilletOrder = {
          ...order,
          id: newOrder.id,
          items: itemsFormattedForAPI,
        };

        try {
          const { data: result } = await axios.post<CreateOneStepLinkResponse>(
            "https://api-pagamentos.pimentamarshall.com.br/create-one-step-link",
            cardOrBilletOrder
          );

          setPaymentURL(result.payment_url);
          console.log(paymentURL);
          console.log(result);

          setOrderStatus("order-received-cardOrBillet");
        } catch (error) {
          console.log(error);
          setOrderStatus("error");
        }
      }
    },
    validationSchema: Yup.object({
      nome: Yup.string().required("Campo obrigatório!"),
      sobrenome: Yup.string().required("Campo obrigatório!"),
      email: Yup.string()
        .email("Insira um endereço de email válido!")
        .required("Campo obrigatório!"),
      endereco: Yup.string().required("Campo obrigatório!"),
      numero: Yup.string().required("Campo obrigatório!"),
      cidade: Yup.string().required("Campo obrigatório!"),
      estado: Yup.string().required("Campo obrigatório!"),
      cep: Yup.string().required("Campo obrigatório!"),
    }),
  });

  useEffect(() => {
    setCart(currentCart);
  }, [currentCart]);

  const getTotalPriceWithShipping = () => {
    const itemsTotal = cart.reduce(
      (accumulator, item) => accumulator + item.quantity * item.price,
      0
    );
    return itemsTotal + shipping.price;
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopyToClipboard(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRefreshOrder = async () => {
    try {
      await currentOrder.refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeTel = (e: string) => {
    setTelError(false);
    if (isNaN(Number(e))) {
      setTelError(true);
      return null;
    }
    setTelNum(e);
  };

  return (
    <>
      <Head>
        <title>Checkout | Pimenta Marshall</title>
        <meta
          name="description"
          content="Preencha os dados e finalize a sua compra."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {orderStatus === "pre-order" && (
        <nav className="sticky top-0 z-10 flex justify-center space-x-0 bg-red-600 px-5 align-middle drop-shadow">
          <div className="flex w-full max-w-2xl justify-between space-x-3 py-2">
            <Link href={"/"} className="min-w-fit">
              <Image
                alt="Marshall icon"
                src={marshallIcon}
                className="h-auto w-5"
              />
            </Link>
            <div
              className="w-full"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            ></div>
          </div>
        </nav>
      )}
      <main className="relative flex min-h-screen flex-col items-center overscroll-none bg-neutral-900 pb-16 pt-5">
        <div className="relative flex max-w-2xl flex-col gap-4 px-3">
          {orderStatus === "pre-order" && (
            <>
              <div className="w-full">
                <h1 className="inline-block rounded-sm bg-neutral-950 p-2 px-3 text-left text-2xl font-bold uppercase text-lime-400">
                  Resumo do pedido:
                </h1>
              </div>
              <div className="w-full">
                <div className="flex w-full flex-col rounded-t-md bg-neutral-950 p-2 text-neutral-50">
                  {cart.map((item) => (
                    <div
                      className="min-h-24 flex justify-between space-x-3 p-3 align-middle"
                      key={item.id}
                    >
                      <div className="flex gap-3 align-middle">
                        <p className="m-0 self-center p-0 text-sm font-bold leading-none">
                          {item.quantity} <span className="font-normal">x</span>
                        </p>
                        <div className="shrink-0 self-center">
                          <Image
                            alt={`Imagem do produto ${item.name}`}
                            src={item.image}
                            height={50}
                            width={50}
                            className=""
                          />
                        </div>
                        <div className="flex flex-col justify-evenly gap-2">
                          <p className="m-0 p-0 text-sm font-bold leading-none">
                            {item.name}
                          </p>
                          <p className="m-0 p-0 text-sm leading-none">
                            R$ {item.price.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between space-x-3">
                        <p className="m-0 self-center p-0 text-sm leading-none">
                          R$
                          {(item.price * item.quantity)
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="min-h-24 flex justify-between space-x-3 p-3 align-middle">
                    <div className="flex gap-3 align-middle">
                      <p className="font-bold">Frete:</p>
                      <p>{shipping.type}</p>
                    </div>
                    <div className="flex justify-between space-x-3">
                      <p className="m-0 self-center p-0 text-sm leading-none">
                        R$ {shipping.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-6 flex w-full flex-col rounded-b-md bg-red-600 p-3 px-5 text-neutral-50">
                  <p className="text-right text-lg">
                    {" "}
                    <span className="font-bold">Total:</span> R${" "}
                    {getTotalPriceWithShipping().toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
              {shipping.type === "Motoboy" && (
                <>
                  <div className="w-full">
                    <h1 className="inline-block rounded-sm bg-neutral-950 p-2 px-3 text-left text-2xl font-bold uppercase text-lime-400">
                      Entrega via motoboy:
                    </h1>
                  </div>
                  <div className="w-full">
                    <div className="mb-4 flex w-full flex-col justify-center gap-3 rounded-md border-2 border-red-600 bg-neutral-950 p-4 py-6 align-middle text-neutral-50 sm:flex-row sm:gap-5">
                      <div className="h-16 w-16 shrink-0 self-center rounded-full bg-red-600 p-3">
                        <Image
                          src={helmetIcon}
                          alt="Motoboy Icon"
                          width={50}
                          height={50}
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="mb-1 text-lg">
                          Informe quando você gostaria de receber os seus
                          produtos:
                        </p>
                        <p className="mb-5 text-sm text-red-600">
                          Certifique de ter alguém para receber os produtos
                          entre 20min antes e 20min depois do horário informado!
                        </p>
                        <div className="mb-2 flex w-fit space-x-3">
                          <input
                            type="radio"
                            name="lobby"
                            id="hasNotLobby"
                            value="hasNotLobby"
                            className="checkbox h-4 w-4 shrink-0 cursor-pointer appearance-none self-center rounded-full border-4 border-neutral-950 bg-transparent ring-2 ring-neutral-50 transition-all checked:bg-lime-400 focus:outline-none"
                            onChange={() => void setHasLobby(false)}
                            defaultChecked
                          />
                          <label htmlFor="hasNotLobby">
                            <DatePicker
                              selected={startDate}
                              onChange={(date) => setStartDate(date!)}
                              excludeDates={[new Date()]}
                              showTimeSelect
                              dateFormat="dd/MM/yyyy - HH:mm"
                              locale="pt-BR"
                              disabled={hasLobby}
                              excludeTimes={[
                                setHours(setMinutes(new Date(), 0), 0),
                                setHours(setMinutes(new Date(), 30), 0),
                                setHours(setMinutes(new Date(), 0), 1),
                                setHours(setMinutes(new Date(), 30), 1),
                                setHours(setMinutes(new Date(), 0), 2),
                                setHours(setMinutes(new Date(), 30), 2),
                                setHours(setMinutes(new Date(), 0), 3),
                                setHours(setMinutes(new Date(), 30), 3),
                                setHours(setMinutes(new Date(), 0), 4),
                                setHours(setMinutes(new Date(), 30), 4),
                                setHours(setMinutes(new Date(), 0), 5),
                                setHours(setMinutes(new Date(), 30), 5),
                                setHours(setMinutes(new Date(), 0), 6),
                                setHours(setMinutes(new Date(), 30), 6),
                                setHours(setMinutes(new Date(), 0), 7),
                                setHours(setMinutes(new Date(), 30), 7),
                                setHours(setMinutes(new Date(), 0), 8),
                                setHours(setMinutes(new Date(), 30), 8),
                                setHours(setMinutes(new Date(), 0), 22),
                                setHours(setMinutes(new Date(), 30), 22),
                                setHours(setMinutes(new Date(), 0), 23),
                                setHours(setMinutes(new Date(), 30), 23),
                              ]}
                              className={
                                hasLobby
                                  ? "rounded border border-neutral-700 bg-transparent px-3 py-2 text-neutral-700"
                                  : "cursor-pointer rounded border border-red-600 bg-transparent px-3 py-2 focus:bg-neutral-800 focus:outline-none"
                              }
                            />
                          </label>
                        </div>
                        <div className="mb-5 flex w-fit space-x-3">
                          <input
                            type="radio"
                            name="lobby"
                            id="hasLobby"
                            value="hasLobby"
                            className="checkbox h-4 w-4 shrink-0 cursor-pointer appearance-none self-center rounded-full border-4 border-neutral-950 bg-transparent ring-2 ring-neutral-50 transition-all checked:bg-lime-400 focus:outline-none"
                            onChange={() => void setHasLobby(true)}
                          />
                          <label
                            htmlFor="hasLobby"
                            className="cursor-pointer text-sm"
                          >
                            Destino com serviço de portaria &#40;a entrega pode
                            ser feita em qualquer dia e horário&#41;
                          </label>
                        </div>
                        <div className="mb-2 flex w-fit justify-center space-x-3 align-middle">
                          <label
                            htmlFor="telNum"
                            className="cursor-pointer self-center text-sm"
                          >
                            Telefone &#40;com DDD&#41;:
                          </label>
                          <input
                            type="tel"
                            name="telNum"
                            id="telNum"
                            onChange={(e) => handleChangeTel(e.target.value)}
                            className="rounded border border-red-600 bg-transparent px-3 py-2 focus:bg-neutral-800 focus:outline-none"
                          />
                        </div>
                        {telError && (
                          <p className="mb-1 text-xs text-red-600">
                            ERRO: O campo de telefone deve conter apenas
                            números!
                          </p>
                        )}
                        <p className="text-sm text-neutral-500">
                          Você será avisado no momento da entrega e poderá
                          acompanhar o trajeto do motoboy.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="w-full">
                <h1 className="inline-block rounded-sm bg-neutral-950 p-2 px-3 text-left text-2xl font-bold uppercase text-lime-400">
                  Método de pagamento:
                </h1>
              </div>
              <div className="w-full">
                <div className="mb-4 flex w-full flex-col rounded-md border-2 border-red-600 bg-neutral-950 p-2 text-neutral-50">
                  <div className="min-h-24 flex space-x-3 p-3 align-middle">
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="pix"
                      value="pix"
                      className="checkbox h-4 w-4 shrink-0 cursor-pointer appearance-none self-center rounded-full border-4 border-neutral-950 bg-transparent ring-2 ring-neutral-50 transition-all checked:bg-lime-400 focus:outline-none"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      defaultChecked
                    />
                    <label htmlFor="pix" className="cursor-pointer">
                      PIX
                    </label>
                  </div>
                  <div className="min-h-24 flex space-x-3 p-3 align-middle">
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="cardOrBillet"
                      value="cardOrBillet"
                      className="checkbox h-4 w-4 shrink-0 cursor-pointer appearance-none self-center rounded-full border-4 border-neutral-950 bg-transparent ring-2 ring-neutral-50 transition-all checked:bg-lime-400 focus:outline-none"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="cardOrBillet" className="cursor-pointer">
                      Cartão ou boleto
                    </label>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <h1 className="inline-block rounded-sm bg-neutral-950 p-2 px-3 text-left text-2xl font-bold uppercase text-lime-400">
                  Dados para a entrega:
                </h1>
              </div>
              <form
                onSubmit={form.handleSubmit}
                className="mb-4 flex w-full flex-col"
              >
                <div className="-mx-3 mb-3 flex flex-wrap">
                  <div className="mb-3 w-full px-3 md:mb-0 md:w-1/2">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="nome"
                    >
                      Nome
                    </label>
                    <input
                      className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                      id="nome"
                      name="nome"
                      type="text"
                      placeholder="Jorge"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.nome}
                    />
                    {form.errors.nome && form.touched.nome && (
                      <p className="mt-1 text-xs italic text-red-500">
                        {form.errors.nome}
                      </p>
                    )}
                  </div>
                  <div className="w-full px-3 md:w-1/2">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="sobrenome"
                    >
                      Sobrenome
                    </label>
                    <input
                      className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                      id="sobrenome"
                      name="sobrenome"
                      type="text"
                      placeholder="Ben Jor"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.sobrenome}
                    />
                    {form.errors.sobrenome && form.touched.sobrenome && (
                      <p className="mt-1 text-xs italic text-red-500">
                        {form.errors.sobrenome}
                      </p>
                    )}
                  </div>
                </div>
                <div className="-mx-3 mb-3 flex flex-wrap">
                  <div className="mb-3 w-full px-3 md:mb-0">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                      id="email"
                      name="email"
                      type="text"
                      placeholder="seuemail@email.com"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.email}
                    />
                    {form.errors.email && form.touched.email && (
                      <p className="mt-1 text-xs italic text-red-500">
                        {form.errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="-mx-3 mb-3 flex flex-wrap md:mb-0">
                  <div className="mb-3 w-full px-3 md:w-1/2">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="endereco"
                    >
                      Endereço
                    </label>
                    <input
                      className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                      id="endereco"
                      name="endereco"
                      type="text"
                      placeholder="Rua, Av..."
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.endereco}
                    />
                    {form.errors.endereco && form.touched.endereco && (
                      <p className="mt-1 text-xs italic text-red-500">
                        {form.errors.endereco}
                      </p>
                    )}
                  </div>
                  <div className="w-1/2 px-3 md:w-1/4">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="numero"
                    >
                      Número
                    </label>
                    <input
                      className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                      id="numero"
                      name="numero"
                      type="text"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.numero}
                    />
                    {form.errors.numero && form.touched.numero && (
                      <p className="mt-1 text-xs italic text-red-500">
                        {form.errors.numero}
                      </p>
                    )}
                  </div>
                  <div className="w-1/2 px-3 md:w-1/4">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="complemento"
                    >
                      Complemento
                    </label>
                    <input
                      className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                      id="complemento"
                      name="complemento"
                      type="text"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.complemento}
                      placeholder="AP, Lote, etc..."
                    />
                  </div>
                </div>
                <div className="-mx-3 mb-2 flex flex-wrap">
                  <div className="mb-3 w-full px-3 md:w-5/12">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="bairro"
                    >
                      Bairro
                    </label>
                    <input
                      className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                      id="bairro"
                      name="bairro"
                      type="text"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.bairro}
                    />
                    {form.errors.bairro && form.touched.bairro && (
                      <p className="mt-1 text-xs italic text-red-500">
                        {form.errors.bairro}
                      </p>
                    )}
                  </div>
                  <div className="mb-3 w-8/12 px-3 md:mb-0 md:w-5/12">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="cidade"
                    >
                      Cidade
                    </label>
                    <input
                      className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                      id="cidade"
                      name="cidade"
                      type="text"
                      placeholder="Belo Horizonte"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.cidade}
                    />
                    {form.errors.cidade && form.touched.cidade && (
                      <p className="mt-1 text-xs italic text-red-500">
                        {form.errors.cidade}
                      </p>
                    )}
                  </div>
                  <div className="mb-3 w-4/12 px-3 md:mb-0 md:w-2/12">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="estado"
                    >
                      Estado
                    </label>
                    <div className="relative">
                      <input
                        className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                        id="estado"
                        name="estado"
                        type="text"
                        maxLength={2}
                        placeholder="UF"
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        value={form.values.estado}
                      />
                      {form.errors.estado && form.touched.estado && (
                        <p className="mt-1 text-xs italic text-red-500">
                          {form.errors.estado}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full px-3 md:mb-0">
                    <label
                      className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                      htmlFor="cep"
                    >
                      CEP
                    </label>
                    <input
                      className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                      id="cep"
                      name="cep"
                      type="text"
                      placeholder="insira seu CEP"
                      onChange={form.handleChange}
                      onBlur={form.handleBlur}
                      value={form.values.cep}
                    />
                    {form.errors.cep && form.touched.cep && (
                      <p className="mt-1 text-xs italic text-red-500">
                        {form.errors.cep}
                      </p>
                    )}
                  </div>
                </div>
                {!form.isValid && (
                  <div className="mt-2 flex justify-center align-middle">
                    <p className="w-full rounded bg-red-600 p-2 text-center text-sm leading-tight">
                      <span className="font-bold">Erro: </span>Preencha o todos
                      os campos corretamente.
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  className="mt-3 w-full self-end rounded-lg bg-lime-400 px-7 py-3 font-semibold text-neutral-950 no-underline transition md:w-fit"
                >
                  Confirmar compra
                </button>
              </form>
            </>
          )}
          {orderStatus === "ordering" && <Loading />}
          {orderStatus === "order-received-pix" && (
            <div className="flex flex-col items-center justify-center">
              <p className="mb-1 block font-bold text-neutral-50">
                Pix válido por 1 hora:
              </p>
              <p className="mb-1 block text-center text-xs text-neutral-500">
                caso o pagamento não seja efetuado, o pedido será cancelado.
              </p>
              <p className="mb-5 block text-center text-xs text-neutral-500">
                Assim que o pagamento for identificado você receberá um email de
                confirmação.
              </p>
              <p className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600">
                PIX QRCode:
              </p>
              <img src={qrCodeImg} className="mb-5" />
              <p className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600">
                Chave PIX Copia & Cola:
              </p>
              <input
                type="text"
                name="qrcode"
                id="qrcode"
                value={qrCode}
                readOnly
                className="mb-3 block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
              />
              <button
                onClick={() => void handleCopyToClipboard()}
                className="mb-5 w-full rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-lime-400 hover:text-neutral-950 md:w-fit"
              >
                {copyToClipboard === false
                  ? "Copiar código PIX"
                  : "CÓDIGO PIX COPIADO!"}
              </button>
              <p className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600">
                Status to pagamento:
              </p>
              <div className="flex w-full justify-between space-x-2 rounded-md border border-red-600 bg-neutral-950 p-3 align-middle">
                <p
                  className={
                    (paymentState === "Pago"
                      ? "text-lime-400"
                      : "text-amber-400") +
                    " self-center text-lg font-bold leading-tight"
                  }
                >
                  {paymentState}
                </p>
                <button
                  className={
                    (currentOrder.isFetching
                      ? "bg-neutral-700"
                      : "bg-red-600") + " rounded px-3 py-2 transition-all"
                  }
                  onClick={() => void handleRefreshOrder()}
                  disabled={currentOrder.isFetching}
                >
                  {currentOrder.isFetching ? "•••" : "Atualizar"}
                </button>
              </div>
            </div>
          )}
          {orderStatus === "order-received-cardOrBillet" && (
            <div className="flex flex-col items-center justify-center">
              {/* <p className="mb-1 block font-bold text-neutral-50">
                Pix válido por 1 hora:
              </p>
              <p className="mb-5 block text-center text-xs text-neutral-500">
                caso o pagamento não seja efetuado, o pedido será cancelado.
              </p> */}
              <p className="mb-1 block text-xs font-bold uppercase tracking-wide text-red-600">
                Prossiga para o link de pagamento:
              </p>
              <p className="mb-3 block text-center text-xs text-neutral-500">
                você será redirecionado para o sistema seguro da Efí
              </p>
              <a
                href={paymentURL}
                className="mb-3 w-full cursor-pointer rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-lime-400 hover:text-neutral-950 md:w-fit"
                target="_blank"
              >
                Link de pagamento
              </a>
              <p className="block text-center text-xs text-neutral-500">
                Assim que o pagamento for identificado você receberá um email de
                confirmação.
              </p>
            </div>
          )}
          {orderStatus === "error" && (
            <div className="flex flex-col items-center justify-center">
              <p className="mb-1 block text-xs font-bold uppercase tracking-wide text-red-600">
                Ocorreu um erro! Por favor tente novamente mais tarde.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Checkout;
