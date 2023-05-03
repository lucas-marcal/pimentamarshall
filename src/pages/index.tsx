import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import marshallIcon from "../../public/img/marshall-icn-preto.png";
import marshallogo from "../../public/img/marshall-logo.png";
import original from "../../public/img/marshall-original-home.png";
import instagramIcon from "../../public/img/Instagram-icon-white.png";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const { data: sessionData } = useSession();

  const {data} = api.product.getAll.useQuery()

  return (
    <>
      <Head>
        <title>Home | Pimenta Marshall</title>
        <meta name="description" content="A Marshall é um molho de pimenta artesanal de produção minúscula fermentado com especiarias no estilo sriracha." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="flex sticky top-0 z-10 justify-center space-x-0 bg-red-600 px-5 align-middle" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="flex w-full max-w-2xl justify-between space-x-3 py-2">
          <Image
            alt="Marshall icon"
            src={marshallIcon}
            className="w-5 h-auto"
          />
          <ul className="flex justify-center space-x-4 align-middle">
            <li className="self-center">
              <button
                className="rounded-lg bg-red-700 px-7 py-3 font-semibold text-white no-underline transition hover:bg-red-800"
                onClick={
                  sessionData ? () => void signOut() : () => void signIn()
                }
              >
                {sessionData ? "Sair" : "Entrar"}
              </button>
            </li>
            <li className="self-center"><button className="group no-underline bg-neutral-900 p-3 rounded-full"><ShoppingCartIcon className="w-6 h-6 stroke-red-600 group-hover:stroke-neutral-50 transition" /></button></li>
          </ul>
        </div>
      </nav>
      <main className="relative flex min-h-screen flex-col items-center bg-neutral-900 pb-14 pt-5">
        <div className="max-w-sm px-5">
          <Image alt="Marshall logo" src={marshallogo} className="max-w-5" />
        </div>
        <div className="flex flex-col space-y-3 max-w-2xl rounded-xl border-2 border-red-600 px-6 py-4 mx-3 my-5">
          <p className="text-neutral-50"><span className="text-red-600 font-bold">• Entregas via Motoboy:</span> entraremos em contato após a compra para conferir o melhor momento para a entrega e garantir que tenha alguém pra receber os molhos.</p>
          <p className="text-neutral-50"><span className="text-red-600 font-bold">• Se você não for de Belo Horizonte e quiser a sua Marshall:</span> entre em contato com a gente pelo instagram <a
            href="https://www.instagram.com/pimentamarshall/"
            className="text-red-600 hover:text-lime-400 transition" target="_blank"
          >
            @pimentamarshall
          </a> que daremos um jeito de te entregar mesmo assim 😉.</p>
        </div>
        <div className="flex max-w-2xl flex-wrap justify-center gap-8">
        {data?.map((product) => (<ProductCard key={product.id} {...product} />))}
        </div>
        <a href="https://www.instagram.com/pimentamarshall/" className="absolute -bottom-7 flex rounded-xl border-2 border-red-600 bg-neutral-900 px-7 py-4 align-middle font-semibold text-neutral-50 no-underline transition hover:bg-red-600" target="_blank">
          <Image
            src={instagramIcon}
            alt="Instagram icon"
            className="mr-3 inline-block h-auto w-6"
          />
          Siga no Instagram
        </a>
      </main>
      <section className="w-full bg-neutral-950 px-3 py-10 pt-12">
        <h2 className="mb-5 text-center text-2xl font-bold uppercase text-neutral-50">
          Onde encontrar a Pimenta Marshall:
        </h2>
        <div className="flex max-w-2xl flex-wrap justify-center gap-8 mx-auto">
          <StoreCard />
          <StoreCard />
          <StoreCard />
          <StoreCard />
        </div>
      </section>
      <footer className="w-full bg-black py-3 text-center text-xs text-neutral-700">
        Copyright &copy; {new Date().getFullYear()} Pimenta Marshall
      </footer>
    </>
  );
};

export default Home;

const StoreCard: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-xs space-x-3 rounded-xl border-2 border-red-600 p-3">
      <div className="flex flex-col space-y-2">
        <h4 className="text-lg font-bold text-red-600">
          MERCADO CENTRAL - Paraíso das Pimentas
        </h4>
        <p className="text-lime-400">Loja</p>
        <p className="text-neutral-50">
          Av. Augusto de Lima, 744 - Centro - Belo Horizonte <a
            href="https://goo.gl/maps/w2L4ojb8TGBtwvn16"
            className="text-red-600 hover:text-lime-400 transition" target="_blank"
          >
            [ver no mapa]
          </a>
        </p>
        <p className="text-neutral-50">
          Instagram:{" "}
          <a
            href="https://www.instagram.com/paraisodaspimentas/"
            className="text-red-600 hover:text-lime-400 transition"
            target="_blank"
          >
            @paraisodaspimentas
          </a>
        </p>
      </div>
    </div>
  );
};

type Product = RouterOutputs["product"]["getAll"][number]

const ProductCard = (props: Product) => {
  const {name, id, description, image, price, picancia} = props

  const getPicancia = () => {
    if (!picancia) {
      return null
    }
    let totalPicancia = "";

    for (let i = 0; i < 5; i++) {
      if (i < picancia) {
        totalPicancia = totalPicancia + "🔥"
      } else {  totalPicancia = totalPicancia + " •" }
    }
    return totalPicancia
  }

  return (
    <div className="flex max-w-xs flex-col space-y-5 p-3">
      <h2 className="bg-neutral-950 p-2 rounded-sm text-2xl font-bold text-red-600">
        {name}
      </h2>
      <Image src={image} alt={`${name} image`} width={1080} height={1080}/>
      <div className="flex flex-col space-y-2">
        <p className="text-lg font-bold text-red-600">Picância: {getPicancia()}
          {}
        </p>
        <p className="text-lg font-bold text-red-600">R$ {price}</p>
        <p className="text-neutral-50">
          {description}
        </p>
      </div>
      <div className="flex space-x-3">
        <input
          type="number"
          name="qnty"
          id="qntyOriginal"
          defaultValue={1}
          className="text-md w-16 rounded-lg border border-red-600 bg-transparent text-center font-semibold text-gray-50 outline-none [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none "
        />
        <button className="rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-red-600">
          <ShoppingCartIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// const AuthShowcase: React.FC = () => {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = api.example.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => void signOut() : () => void signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// };
