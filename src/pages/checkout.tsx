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

const Checkout = () => {
  const [cart, setCart] = useState<CartState>([]);
  const [orderStatus, setOrderStatus] = useState("pre-order");
  const [qrCode, setQrCode] = useState("");
  const [qrCodeImg, setQrCodeImg] = useState("");
  const [copyToClipboard, setCopyToClipboard] = useState(false);
  const [paymentType, setPaymentType] = useState("pix");

  const currentCart = useAppSelector((state) => state.cart);
  const address = useAppSelector((state) => state.address);
  const shipping = useAppSelector((state) => state.shipping);

  const createOrder = api.order.createOrder.useMutation();
  const createOrderItem = api.order.createOrderItem.useMutation();
  const addTxid = api.order.addTxid.useMutation();

  const form = useFormik({
    initialValues: {
      nome: "",
      sobrenome: "",
      endereco: address.logradouro,
      numero: "",
      complemento: "",
      cidade: address.localidade,
      estado: address.uf,
      cep: address.cep,
    },
    onSubmit: async (values) => {
      setOrderStatus("ordering");
      const order = {
        ...values,
        items: cart,
        shipping: {
          type: shipping.type,
          price: Number(shipping.price)*100,
          id: shipping.id,
        },
        orderTotal: Number(getTotalPriceWithShipping().toFixed(2)),
      };

      console.log("order => ", order);

      const newOrder = await createOrder.mutateAsync(order);
      console.log("newOrder => ", newOrder);
      cart.forEach((cartItem) => {
        createOrderItem.mutate({ ...cartItem, orderId: newOrder.id });
      });

      if (paymentType === "pix") {
        const result = await axios.post(
          "https://api-pagamentos.pimentamarshall.com.br/create-order",
          order
        );
  
        const toUpdateTxid = {
          id: newOrder.id,
          txid: result.data.txid
        }
  
        addTxid.mutate(toUpdateTxid);
  
        setQrCode(result.data.qrcode);
        setQrCodeImg(result.data.imagemQrcode);
        setOrderStatus("order-received-pix");
      }

      if (paymentType === "cardOrBillet") {
        const cardOrBilletOrder = {
          ...order,
          id: newOrder.id
        }
        const result = await axios.post(
          "https://api-pagamentos.pimentamarshall.com.br/create-one-step-link",
          cardOrBilletOrder
        );
      }
      
    },
    validationSchema: Yup.object({
      nome: Yup.string().required("Campo obrigatório!"),
      sobrenome: Yup.string().required("Campo obrigatório!"),
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

  const paymentHandle = () => {
    console.log("GO TO PAYMENT");
  };

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
              <div className="w-full">
                <h1 className="inline-block rounded-sm bg-neutral-950 p-2 px-3 text-left text-2xl font-bold uppercase text-lime-400">
                  Entrega via motoboy:
                </h1>
              </div>
              <div className="w-full">
                <div className="mb-4 flex w-full rounded-md border-2 border-red-600 bg-neutral-950 p-2 text-neutral-50">
                  <div className="w-14 h-14 m-3 p-2 bg-red-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 143.38 143.8"><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path d="M40.21,72.56a9.47,9.47,0,1,1,6.68-2.78,9.49,9.49,0,0,1-6.68,2.78Zm0-13.51a4.06,4.06,0,1,0,4,4.05,4.07,4.07,0,0,0-4-4.05Z"/><path d="M140.57,72.17c-4.24-29.64-15-49.7-32.95-61.31C91.37.34,68.65-2.82,48.29,2.62,5.77,14-9.57,55.57,5.86,96.69a16.18,16.18,0,0,0,9.49,9.45l95.59,36.1a23.9,23.9,0,0,0,32.38-21.88,316.93,316.93,0,0,0-2.75-48.19Zm-2.72,34.29L69.36,78.83A13.78,13.78,0,0,1,60.57,67a13.2,13.2,0,0,1,13.77-13.7H131a131.76,131.76,0,0,1,4.24,19.63,295.86,295.86,0,0,1,2.63,33.52Zm.07,13.8h0a18.5,18.5,0,0,1-25.07,16.93l-95.59-36.1a10.84,10.84,0,0,1-6.35-6.3C-3.36,56.74,10.25,18.38,49.69,7.84c18.91-5.07,40-2.16,55,7.56,11,7.13,19.1,17.87,24.47,32.51H74.33A18.59,18.59,0,0,0,55.17,67.3,19.23,19.23,0,0,0,67.33,83.84l70.61,28.47c0,2.67,0,5.33,0,8Z"/><path d="M11.16,72.12C8.58,45,21.51,23.16,46.68,14.45a2.7,2.7,0,0,1,1.77,5.11c-23.26,8.05-34.2,28-31.92,52.05a2.7,2.7,0,0,1-5.37.51Z"/><path d="M56,12A68.11,68.11,0,0,1,66,10.83a2.7,2.7,0,0,1,.22,5.4A62.8,62.8,0,0,0,57,17.29,2.7,2.7,0,0,1,56,12Z"/><path d="M97.79,66.21l5.4-5.4A2.7,2.7,0,0,1,107,64.63L101.6,70a2.7,2.7,0,0,1-3.81-3.82Z"/><path d="M100.32,80.24l18.91-18.91a2.7,2.7,0,0,1,3.82,3.82L104.14,84.06a2.7,2.7,0,0,1-3.82-3.82Z"/></g></g></svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="">Informe quando você gostaria de receber os seus produtos:</p>
                  </div>
                </div>
              </div>
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
                      name="paymentType"
                      id="pix"
                      value="pix"
                      className=""
                      onChange={e => setPaymentType(e.target.value)}
                      defaultChecked
                    />
                    <label htmlFor="pix">PIX</label>
                  </div>
                  <div className="min-h-24 flex space-x-3 p-3 align-middle">
                    <input
                      type="radio"
                      name="paymentType"
                      id="cardOrBillet"
                      value="cardOrBillet"
                      className=""
                      onChange={e => setPaymentType(e.target.value)}
                    />
                    <label htmlFor="cardOrBillet">Cartão ou boleto</label>
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
                  <div className="w-full px-3 md:mb-0 md:w-5/12">
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
                  className="mt-3 w-full self-end rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-lime-400 hover:text-neutral-950 md:w-fit"
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
              <p className="mb-5 block text-center text-xs text-neutral-500">
                caso o pagamento não seja efetuado, o pedido será cancelado.
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
                className="w-full rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-lime-400 hover:text-neutral-950 md:w-fit"
              >
                {copyToClipboard === false
                  ? "Copiar código PIX"
                  : "CÓDIGO PIX COPIADO!"}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Checkout;
