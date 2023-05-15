import { signIn, signOut, useSession } from "next-auth/react";
import marshallIcon from "../../public/img/marshall-icn-preto.png";
import Image from "next/image";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { type Dispatch, type SetStateAction } from "react";

const Navbar: React.FC<{setIsOpen: Dispatch<SetStateAction<boolean>>, isOpen: boolean, itemsQnty: number}> = (props) => {
  const { data: sessionData } = useSession();
  const {setIsOpen, isOpen, itemsQnty} = props;
  return (
    <nav
      className="sticky top-0 z-10 flex justify-center space-x-0 bg-red-600 px-5 align-middle drop-shadow"
    >
      <div className="flex w-full max-w-2xl justify-between space-x-3 py-2">
        <Link href={"/"} className="min-w-fit"><Image alt="Marshall icon" src={marshallIcon} className="h-auto w-5" /></Link>
        <div className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}></div>
        <ul className="flex justify-center space-x-4 align-middle">
          <li className="self-center">
            <button
              className="rounded-lg bg-red-700 px-7 py-3 font-semibold text-white no-underline transition hover:bg-red-800"
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData ? "Sair" : "Entrar"}
            </button>
          </li>
          <li className="self-center">
            <button className="relative group rounded-full bg-neutral-900 p-3 no-underline" onClick={() => {setIsOpen(!isOpen)}}>
              <ShoppingCartIcon className="h-6 w-6 stroke-red-600 transition group-hover:stroke-neutral-50" />
              {itemsQnty > 0 ? 
              (<div className="rounded-full bg-neutral-50 h-5 w-5 absolute right-0 bottom-0 text-center text-xs flex align-middle justify-center"><p className="leading-none pt-1">{itemsQnty}</p></div>) : null
            }
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
