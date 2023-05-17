import Head from "next/head";
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
        <div className="flex max-w-2xl flex-wrap justify-center gap-6 px-3">
            <div className="w-full">
          <h1 className="text-left uppercase rounded-sm bg-neutral-950 p-2 px-3 text-2xl font-bold text-red-600 inline-block">
            Dados para a entrega:
          </h1>
          </div>
          <form className="w-full">
            <div className="-mx-3 mb-5 flex flex-wrap">
              <div className="mb-3 w-full px-3 md:mb-0 md:w-1/2">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-first-name"
                >
                  Nome
                </label>
                <input
                  className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 focus:bg-neutral-900 focus:border-neutral-100 focus:outline-none placeholder:text-neutral-700"
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
                  className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 focus:bg-neutral-900 focus:border-neutral-100 focus:outline-none placeholder:text-neutral-700"
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
                  className="mb-3 block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 focus:bg-neutral-900 focus:border-neutral-100 focus:outline-none placeholder:text-neutral-700"
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
                  className="mb-3 block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 focus:bg-neutral-900 focus:border-neutral-100 focus:outline-none placeholder:text-neutral-700"
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
                  className="mb-3 block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 focus:bg-neutral-900 focus:border-neutral-100 focus:outline-none placeholder:text-neutral-700"
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
                  className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 focus:bg-neutral-900 focus:border-neutral-100 focus:outline-none placeholder:text-neutral-700"
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
                    className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 focus:border-neutral-100 focus:bg-neutral-900 focus:outline-none placeholder:text-neutral-700"
                    id="grid-state"
                    type="text"
                    maxLength={2}
                    defaultValue={address.uf}
                    placeholder="MG, PE, AC, RS, etc.."
                  />
                </div>
              </div>
              <div className="mb-6 w-full px-3 md:mb-0 md:w-5/12">
                <label
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-red-600"
                  htmlFor="grid-zip"
                >
                  CEP
                </label>
                <input
                  className="block w-full appearance-none rounded border border-neutral-500 bg-neutral-950 px-4 py-3 leading-tight text-neutral-50 focus:bg-neutral-900 focus:border-neutral-100 focus:outline-none placeholder:text-neutral-700"
                  id="grid-zip"
                  type="text"
                  placeholder="30190-922"
                  defaultValue={address.cep}
                />
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default Checkout;


const stateSelectOptions = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"]
