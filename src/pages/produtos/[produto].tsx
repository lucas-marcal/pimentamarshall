import {
  InferGetStaticPropsType,
  GetStaticPropsContext,
  GetStaticPaths,
} from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import Head from "next/head";
import instagramIcon from "../../../public/img/Instagram-icon-white.png";
import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import SuperJSON from "superjson";
import Link from "next/link";
import StoreCard from "~/components/StoreCard";
import { CartState, addToCart } from "redux/cart.slice";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import ShoppingCart from "~/components/ShoppingCart";

type Product = RouterOutputs["product"]["getAll"][number];

const Produto = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const product = api.product.getBySlug.useQuery(props.urlSlug).data as Product;
  const resellers = api.reseller.getAll.useQuery().data;

  const [cart, setCart] = useState<CartState>([]);
  const [itemsQnty, setItemsQnty] = useState(0)
  const [isOpen, setIsOpen] = useState(false);

  const currentCart = useAppSelector((state) => state.cart);

  const getItemsQnty = (currentCart: CartState) => {
    return currentCart.reduce(
      (accumulator, item) => accumulator + item.quantity,
      0
    );
  }

  useEffect(() => {
    setCart(currentCart);
    setItemsQnty(getItemsQnty(currentCart));
  }, [currentCart]);

  return (
    <>
      <Head>
        <title>{`${product.name} | Pimenta Marshall`}</title>
        <meta
          name="description"
          content={product.description}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar setIsOpen={setIsOpen} isOpen={isOpen} />
      <main className="relative flex flex-col items-center bg-neutral-900 pb-24 pt-5 px-3">
        <div className="flex flex-col max-w-2xl gap-8">
          <div className="flex flex-wrap">
          <Link href={"/"} className="text-red-600">Produtos</Link> 
          <p className="text-neutral-600 mx-3">/</p>
          <p className="text-lime-400">{product.name}</p>
          </div>
          <ProductPanel {...product} />
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
          {resellers && resellers.map((reseller) => (
            <StoreCard key={reseller.id} {...reseller} />
          ))}
        </div>
      </section>
      <footer className="w-full bg-black py-3 text-center text-xs text-neutral-700">
        Copyright &copy; {new Date().getFullYear()} Pimenta Marshall
      </footer>
      <ShoppingCart setIsOpen={setIsOpen} isOpen={isOpen} />
    </>
  );
};

export default Produto;

const ProductPanel = (props: Product) => {
  const { name, id, description, image, price, picancia, urlSlug } = props;
  const [count, setCount] = useState(1);

  const dispatch = useAppDispatch();

  const addToCartHandle = () => {
    const cartProduct = {
      name: name,
      id: id,
      image: image,
      price: price,
      urlSlug: urlSlug,
      quantity: count,
    };
    dispatch(addToCart(cartProduct));
  };

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
    <div className="flex gap-4 flex-wrap sm:flex-nowrap justify-center">
      <div className="max-w-sm">
        <Image src={image} alt={`${name} image`} width={1080} height={1080}/>
      </div>
      <div className="flex flex-col justify-between space-y-4 sm:max-w-xs">
        <h2 className="rounded-sm bg-neutral-950 p-2 text-2xl font-bold text-red-600">
          {name}
        </h2>
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between align-middle">
            <p className="self-center text-3xl font-bold text-red-600">
              <span className="text-2xl font-normal">R$</span>{" "}
              {price.toFixed(2)}
            </p>
            <div className="rounded-xl border border-red-600 px-3 py-3">
              <p className="font-bold leading-tight text-neutral-700">
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
          <button onClick={addToCartHandle} className="rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-red-600">
            <ShoppingCartIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};



export async function getStaticProps(context: GetStaticPropsContext) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: SuperJSON, // optional - adds superjson serialization
  });

  const urlSlug = context.params?.produto as string;

  await helpers.product.getBySlug.prefetch(urlSlug);
  await helpers.reseller.getAll.prefetch()

  return {
    props: {
      trpcState: helpers.dehydrate(),
      urlSlug,
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: SuperJSON, // optional - adds superjson serialization
  });

  const slugs = await helpers.product.getSlugs.fetch();

  if (!slugs) {
    throw new Error("Error");
  }

  return {
    paths: slugs.map((item) => ({
      params: {
        produto: item.urlSlug,
      },
    })),
    // https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-blocking
    fallback: false,
  };
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
