import { type NextPage } from "next";
import Head from "next/head";
import instagramIcon from "../../../public/img/Instagram-icon-white.png";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Navbar from "~/components/Navbar";

const Home: NextPage = () => {
  const products = api.product.getAll.useQuery().data;
  const resellers = api.reseller.getAll.useQuery().data;

  return (
    <>
      <Head>
        <title>Home | Pimenta Marshall</title>
        <meta
          name="description"
          content="A Marshall é um molho de pimenta artesanal de produção minúscula fermentado com especiarias no estilo sriracha."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center bg-neutral-900 pb-16 pt-5">
        <div className="flex max-w-2xl flex-wrap justify-center gap-8">
          {products?.map((product) => (
            <ProductPageDetails key={product.id} {...product} />
          ))}
        </div>
        <a
          href="https://www.instagram.com/pimentamarshall/"
          className="absolute -bottom-7 flex rounded-xl border-2 border-red-600 bg-neutral-900 px-7 py-4 align-middle font-semibold text-neutral-50 no-underline transition hover:bg-red-600"
          target="_blank"
        >
          <Image
            src={instagramIcon}
            alt="Instagram icon"
            className="mr-3 inline-block h-auto w-6"
          />
          Siga no Instagram
        </a>
      </main>
      <section className="w-full bg-neutral-950 px-3 py-10 pt-16">
        <h2 className="mb-5 text-center text-2xl font-bold uppercase text-neutral-50">
          Onde encontrar a Pimenta Marshall:
        </h2>
        <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-8">
          {resellers?.map((reseller) => (
            <StoreCard key={reseller.id} {...reseller} />
          ))}
        </div>
      </section>
      <footer className="w-full bg-black py-3 text-center text-xs text-neutral-700">
        Copyright &copy; {new Date().getFullYear()} Pimenta Marshall
      </footer>
    </>
  );
};

export default Home;

type Reseller = RouterOutputs["reseller"]["getAll"][number];

const StoreCard = (props: Reseller) => {
  const { name, id, address, instagram, instagramHandle, mapsLink, storeType } =
    props;

  return (
    <div className="mx-auto flex max-w-xs space-x-3 rounded-xl border-2 border-red-600 p-3">
      <div className="flex flex-col space-y-2">
        <h4 className="text-lg font-bold text-red-600">{name}</h4>
        <p className="text-lime-400">{storeType}</p>
        <p className="text-neutral-50">
          {address}{" "}
          <a
            href={mapsLink}
            className="text-red-600 transition hover:text-lime-400"
            target="_blank"
          >
            [ver no mapa]
          </a>
        </p>
        {instagram && (
          <p className="text-neutral-50">
            Instagram:{" "}
            <a
              href={instagram}
              className="text-red-600 transition hover:text-lime-400"
              target="_blank"
            >
              {instagramHandle}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

type Product = RouterOutputs["product"]["getAll"][number];

const ProductPageDetails = (props: Product) => {
  const { name, id, description, image, price, picancia } = props;
  const [count, setCount] = useState(1);

  const qntyIncrement = () => {
    setCount(count + 1);
  };

  const qntyDecrement = () => {
    if (count <= 1) {
      return null;
    }

    setCount(count - 1);
  };

  const getPicancia = () => {
    if (!picancia) {
      return null;
    }
    let totalPicancia = "";

    for (let i = 0; i < 5; i++) {
      if (i < picancia) {
        totalPicancia = totalPicancia + "🔥";
      } else {
        totalPicancia = totalPicancia + " •";
      }
    }
    return totalPicancia;
  };

  return (
    <div className="flex max-w-xs flex-col space-y-4 p-3">
      <h2 className="rounded-sm bg-neutral-950 p-2 text-2xl font-bold text-red-600">
        {name}
      </h2>
      <Image src={image} alt={`${name} image`} width={1080} height={1080} />
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between align-middle">
        <p className="text-3xl font-bold text-red-600 self-center"><span className="text-2xl font-normal">R$</span> {price.toFixed(2)}</p>
          <div className="rounded-xl border border-red-600 px-3 py-3">
            <p className="font-bold text-neutral-700 leading-tight">
              {getPicancia()}
            </p>
          </div>
        </div>
        <p className="text-neutral-50">{description}</p>
      </div>
      <div className="flex space-x-3">
        <div className="flex justify-center rounded-lg border border-red-600 bg-transparent align-middle">
          <button
            className="w-8 pb-1 font-bold text-red-600"
            onClick={qntyDecrement}
          >
            –
          </button>
          <input
            type="number"
            name="qnty"
            id="qntyOriginal"
            value={count}
            className="text-md w-7 bg-transparent text-center font-semibold text-gray-50 outline-none [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none "
          />
          <button
            className="w-8 pb-1 font-bold text-red-600"
            onClick={qntyIncrement}
          >
            +
          </button>
        </div>
        <button className="rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-red-600">
          <ShoppingCartIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};