import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CartState } from "redux/cart.slice";
import { useAppSelector } from "redux/hooks";

const Checkout = () => {
  const [cart, setCart] = useState<CartState>([]);

  const currentCart = useAppSelector((state) => state.cart);
  const address = useAppSelector((state) => state.address);

  useEffect(() => {
    setCart(currentCart);
  }, [currentCart]);

  const paymentMethodHandle = () => {
    console.log("METHOD CHANGED");
  };

  const paymentHandle = () => {
    console.log("GO TO PAYMENT");
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
        <div className="flex max-w-2xl flex-col gap-4 px-3">
          <div className="w-full">
            <h1 className="inline-block rounded-sm bg-neutral-950 p-2 px-3 text-left text-2xl font-bold uppercase text-lime-400">
              Dados para a entrega:
            </h1>
          </div>
          <form className="w-full mb-4">
            <div className="-mx-3 mb-5 flex flex-wrap">
              <div className="mb-3 w-full px-3 md:mb-0 md:w-1/2">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-first-name"
                >
                  Nome
                </label>
                <input
                  className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                  id="grid-first-name"
                  type="text"
                  placeholder="Jorge"
                />
                {/* <p className="text-xs italic text-red-500">
                  Por favor preencha este campo.
                </p> */}
              </div>
              <div className="w-full px-3 md:w-1/2">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-last-name"
                >
                  Sobrenome
                </label>
                <input
                  className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                  id="grid-last-name"
                  type="text"
                  placeholder="Ben Jor"
                />
              </div>
            </div>
            <div className="-mx-3 mb-2 flex flex-wrap">
              <div className="w-full px-3 md:w-1/2">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-first-name"
                >
                  Endereço
                </label>
                <input
                  className="mb-3 block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                  id="grid-first-name"
                  type="text"
                  placeholder="Rua, Av..."
                  defaultValue={address.logradouro}
                />
              </div>
              <div className="w-1/2 px-3 md:w-1/4">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-last-name"
                >
                  Número
                </label>
                <input
                  className="mb-3 block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                  id="grid-last-name"
                  type="text"
                />
              </div>
              <div className="w-1/2 px-3 md:w-1/4">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-last-name"
                >
                  Complemento
                </label>
                <input
                  className="mb-3 block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                  id="grid-last-name"
                  type="text"
                />
              </div>
            </div>
            <div className="-mx-3 mb-2 flex flex-wrap">
              <div className="mb-6 w-8/12 px-3 md:mb-0 md:w-5/12">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-city"
                >
                  Cidade
                </label>
                <input
                  className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                  id="grid-city"
                  type="text"
                  placeholder="Belo Horizonte"
                  defaultValue={address.localidade}
                />
              </div>
              <div className="mb-6 w-4/12 px-3 md:mb-0 md:w-2/12">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-state"
                >
                  Estado
                </label>
                <div className="relative">
                  <input
                    className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                    id="grid-state"
                    type="text"
                    maxLength={2}
                    defaultValue={address.uf}
                    placeholder="UF"
                  />
                </div>
              </div>
              <div className="w-full px-3 md:mb-0 md:w-5/12">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-zip"
                >
                  CEP
                </label>
                <input
                  className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 placeholder:text-neutral-700 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none"
                  id="grid-zip"
                  type="text"
                  placeholder="30190-922"
                  defaultValue={address.cep}
                />
              </div>
            </div>
          </form>
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
                  <p>Motoboy</p>
                </div>
                <div className="flex justify-between space-x-3">
                  <p className="m-0 self-center p-0 text-sm leading-none">
                    R$ 10,00
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-6 flex w-full flex-col rounded-b-md bg-red-600 p-3 px-5 text-neutral-50">
              <p className="text-right text-lg">
                {" "}
                <span className="font-bold">Total:</span> R$125,00{" "}
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
          <button
          onClick={paymentHandle}
          className="w-full self-end rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-lime-400 hover:text-neutral-950 md:w-fit"
        >
          Confirmar compra
        </button>
        </div>
        
      </main>
    </>
  );
};

export default Checkout;

const stateSelectOptions = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];
