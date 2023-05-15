import {
  type InferGetStaticPropsType,
  GetStaticPropsContext,
  type NextPage,
} from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import Head from "next/head";
import marshallogo from "../../public/img/marshall-logo.png";
import instagramIcon from "../../public/img/Instagram-icon-white.png";
import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { ShoppingCartIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import SuperJSON from "superjson";
import StoreCard from "~/components/StoreCard";
import Link from "next/link";
import {
  CartState,
  addToCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "redux/cart.slice";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import ShoppingCart from "~/components/ShoppingCart";

const Home = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [cart, setCart] = useState<CartState>([]);
  const [itemsQnty, setItemsQnty] = useState(0)
  const [isOpen, setIsOpen] = useState(false);
  const products = api.product.getAll.useQuery().data;
  const resellers = api.reseller.getAll.useQuery().data;

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

  const dispatch = useAppDispatch();

  const getTotalPrice = () => {
    return cart.reduce(
      (accumulator, item) => accumulator + item.quantity * item.price,
      0
    );
  };

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
      <Navbar setIsOpen={setIsOpen} isOpen={isOpen} itemsQnty={itemsQnty} />
      <main className="relative flex min-h-screen flex-col items-center bg-neutral-900 pb-16 pt-5 overscroll-none">
        <div className="max-w-xs px-5">
          <Image alt="Marshall logo" src={marshallogo} className="" />
        </div>
        <div className="mx-3 my-5 flex max-w-2xl flex-col space-y-3 rounded-xl border-2 border-red-600 px-6 py-4">
          <p className="text-neutral-50">
            <span className="font-bold text-red-600">
              • Entregas via Motoboy:
            </span>{" "}
            entraremos em contato após a compra para conferir o melhor momento
            para a entrega e garantir que tenha alguém pra receber os molhos.
          </p>
          <p className="text-neutral-50">
            <span className="font-bold text-red-600">
              • Se você <span className="text-lime-400">não for de Belo Horizonte</span> e quiser a sua Marshall:
            </span>{" "}
            entre em contato com a gente pelo instagram{" "}
            <a
              href="https://www.instagram.com/pimentamarshall/"
              className="text-red-600 transition hover:text-lime-400"
              target="_blank"
            >
              @pimentamarshall
            </a>{" "}
            que daremos um jeito de te entregar mesmo assim 😉.
          </p>
        </div>
        <div className="flex max-w-2xl flex-wrap justify-center gap-8">
          {products?.map((product) => (
            <ProductCard key={product.id} {...product} />
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
          {resellers &&
            resellers.map((reseller) => (
              <StoreCard key={reseller.id} {...reseller} />
            ))}
        </div>
      </section>
      <footer className="w-full bg-black py-3 text-center text-xs text-neutral-700">
        Copyright &copy; {new Date().getFullYear()} Pimenta Marshall
      </footer>
      <ShoppingCart cart={cart} setIsOpen={setIsOpen} isOpen={isOpen} />
      
    </>
  );
};

export default Home;

type Product = RouterOutputs["product"]["getAll"][number];

interface CartProduct {
  name: string;
  id: string;
  image: string;
  price: number;
  urlSlug: string;
  quantity: number;
}



const ProductCard = (props: Product) => {
  const { name, description, image, price, picancia, urlSlug, id } = props;
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
    <div className="flex max-w-xs flex-col space-y-4 p-3">
      <Link
        href={`/produtos/${urlSlug}`}
        className="rounded-sm bg-neutral-950 p-2 text-2xl font-bold text-red-600"
      >
        {name}
      </Link>
      <Image src={image} alt={`${name} image`} width={1080} height={1080} />
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between align-middle">
          <p className="self-center text-3xl font-bold text-red-600">
            <span className="text-2xl font-normal">R$</span> {price.toFixed(2)}
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
            readOnly
          />
          <button
            className="w-8 pb-1 font-bold text-red-600"
            onClick={qntyIncrement}
          >
            +
          </button>
        </div>
        <button
          onClick={addToCartHandle}
          className="rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-red-600"
        >
          <ShoppingCartIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: SuperJSON, // optional - adds superjson serialization
  });
  // const id = context.params?.id as string;
  // prefetch `post.byId`

  await helpers.product.getAll.prefetch();
  await helpers.reseller.getAll.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}

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
