import axios from "axios";
import { useFormik } from "formik";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CartState } from "redux/cart.slice";
import { useAppSelector } from "redux/hooks";
import Loading from "~/components/Loading";
import { api } from "~/utils/api";
import * as Yup from "yup";

const Checkout = () => {
  const [cart, setCart] = useState<CartState>([]);
  const [orderStatus, setOrderStatus] = useState("pre-order");
  const [qrCode, setQrCode] = useState("");
  const [qrCodeImg, setQrCodeImg] = useState("");
  const [copyToClipboard, setCopyToClipboard] = useState(false);

  const currentCart = useAppSelector((state) => state.cart);
  const address = useAppSelector((state) => state.address);
  const shipping = useAppSelector((state) => state.shipping);

  const createOrder = api.order.createOrder.useMutation();
  const createOrderItem = api.order.createOrderItem.useMutation();

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
      // setOrderStatus("ordering");
      const order = {
        ...values,
        items: cart,
        orderTotal: Number(getTotalPriceWithShipping().toFixed(2)),
      };

      const newOrder = await createOrder.mutateAsync(order);
      console.log(newOrder);
      cart.forEach((cartItem) => {
        createOrderItem.mutate({ ...cartItem, orderId: newOrder.id });
      });

      // const result = await axios.post(
      //   "https://api-pagamentos.pimentamarshall.com.br/create-order",
      //   order
      // );

      // setQrCode(result.data.qrcode);
      // setQrCodeImg(result.data.imagemQrcode);
      // setOrderStatus("order-received");
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

  const paymentMethodHandle = () => {
    console.log("METHOD CHANGED");
  };

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
                      value="Pix"
                      className=""
                      onChange={paymentMethodHandle}
                    />
                    <label htmlFor="pix">PIX</label>
                  </div>
                  <div className="min-h-24 flex space-x-3 p-3 align-middle">
                    <input
                      type="radio"
                      name="paymentType"
                      id="pagseguro"
                      value="PagSeguro"
                      className=""
                      onChange={paymentMethodHandle}
                    />
                    <label htmlFor="pagseguro">PagSeguro</label>
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
          {orderStatus === "order-received" && (
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
                onClick={handleCopyToClipboard}
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
