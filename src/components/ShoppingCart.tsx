import { Dispatch, SetStateAction, useState } from "react";
import { useAppDispatch } from "redux/hooks";
import {
  CartState,
  addToCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "redux/cart.slice";
import Image from "next/image";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const ShoppingCart: React.FC<{
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  cart: CartState;
}> = (props) => {
  const [cepInput, setCepInput] = useState<string>("");
  const [error, setError] = useState(false);
  const [cepInfo, setCepInfo] = useState<SingleCepResponse>();
  const [deliveryCost, setDeliveryCost] = useState(0);

  const { setIsOpen, isOpen, cart } = props;

  const dispatch = useAppDispatch();

  const deliveryChangeHandle = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.value) {
        case "Motoboy":
            setDeliveryCost(10);
            break;
        
        case "Sedex":
            setDeliveryCost(22.50);
            break;
    
        default:
            break;
    }
  }

  const getTotalPrice = () => {
    return cart.reduce(
      (accumulator, item) => accumulator + item.quantity * item.price,
      0
    );
  };

  const goToCheckout = () => {
    console.log("CHECKOUT");
  };

  const handleChange = (text: string) => {
    setCepInput(text);
  };

  interface SingleCepResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: number;
    gia: number;
    ddd: number;
    siafi: number;
    erro?: boolean;
  }

  const fetchCepInfo = async () => {
    try {
      const inputWithoutSpaces = cepInput.replace(/\D/g, "").replace("-", "");
      const inputToNumber = Number(inputWithoutSpaces);

      if (!/^[0-9]{8}$/.test(inputWithoutSpaces) || isNaN(inputToNumber)) {
        return setError(true);
      }

      const res = await axios.get<SingleCepResponse>(
        `https://viacep.com.br/ws/${inputToNumber}/json/`
      );

      if (res.data.erro) {
        setError(true);
      }

      setCepInfo(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const cepInputHandler = async () => {
    setDeliveryCost(0);
    setError(false);
    setCepInfo(undefined);
    await fetchCepInfo().catch((err) => console.log(err));
  };

  return (
    <div
      className={
        "fixed right-0 top-0 z-30 mt-16 flex h-[calc(100%-3rem)] w-full transform flex-col overflow-scroll bg-neutral-950 text-neutral-50 ease-in-out sm:max-w-sm" +
        (isOpen
          ? " translate-x-0 transition-all duration-300  "
          : " translate-x-full transition-all  ")
      }
    >
      <div className="flex flex-col gap-3 pt-3">
        {cart.length === 0 ? (
          <p className="mt-4 text-center text-red-600">
            Seu carrinho está vazio! :&#40;
          </p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                className="min-h-24 flex justify-between space-x-3 p-3 align-middle"
                key={item.id}
              >
                <div className="flex gap-3 align-middle">
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="h-fit self-center p-2 font-bold leading-none text-red-600"
                  >
                    x
                  </button>
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
                      R$ {item.price}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between space-x-3">
                  {/* <p className="m-0 self-center p-0 text-sm leading-none">
                        R${item.price}
                      </p> */}

                  <div className="align-middleflex-nowrap flex h-8 self-center rounded border-2 border-red-600">
                    <button
                      onClick={() => dispatch(decrementQuantity(item.id))}
                      className="w-8 pb-1 font-bold text-red-600"
                    >
                      -
                    </button>
                    <p className="m-0 self-center p-0 text-sm font-bold leading-none">
                      {item.quantity}
                    </p>
                    <button
                      onClick={() => dispatch(incrementQuantity(item.id))}
                      className="w-8 pb-1 font-bold text-red-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-col px-3 align-bottom">
              <div className="mb-3 flex justify-between px-3 align-middle">
                <div className="flex align-middle">
                  <p className="mr-2 self-center leading-none">CEP:</p>
                  <input
                    type="text"
                    name="cep"
                    id="cep"
                    className="mr-2 w-24 rounded-md border border-red-600 bg-neutral-950 px-2 py-1 text-sm text-neutral-50 outline-none [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    onChange={(e) => handleChange(e.target.value)}
                  />
                  <button
                    className="rounded-md bg-lime-400 px-2 text-sm text-neutral-950"
                    onClick={() => void cepInputHandler()}
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </button>
                </div>

                <p className="self-center text-center leading-none ">
                  <span className="font-bold">Total:</span> R$ {(getTotalPrice() + deliveryCost).toFixed(2).replace(".",",")}
                </p>
              </div>
              {error && (
                <div className="mb-3 flex flex-col rounded-md bg-red-600 p-3">
                  <p className="mb-2 text-center text-neutral-950">
                    CEP inválido!
                  </p>
                </div>
              )}
              {cepInfo?.localidade && (
                <div className="mb-3 flex flex-col rounded-md border-2 border-neutral-700 p-1 px-3">
                  <p className="mb-1 text-center text-neutral-50">
                    {cepInfo.localidade} - {cepInfo.bairro}
                  </p>
                </div>
              )}
              {cepInfo?.localidade &&
              cepInfo?.localidade !== "Belo Horizonte" ? (
                <div className="mb-3 flex flex-col rounded-md bg-red-600 p-3">
                  <p className="mb-1 text-center text-neutral-50">
                    Infelizmente o frete está indisponível para a sua
                    localidade. Mande uma DM no nosso instagram{" "}
                    <a
                      href="https://www.instagram.com/pimentamarshall/"
                      className="text-neutral-900 transition hover:text-neutral-50"
                      target="_blank"
                    >
                      @pimentamarshall
                    </a>{" "}
                    para ver como podemos realizar a sua entrega!
                  </p>
                </div>
              ) : null}
              {cepInfo?.localidade === "Belo Horizonte" ? (
                <div className="mb-3 flex flex-col rounded-md bg-red-600 p-3">
                  <div className="flex justify-between py-1">
                    <div className="flex gap-3 align-middle">
                      <input
                        type="radio"
                        name="deliveryType"
                        id="motoboy"
                        value="Motoboy"
                        className=""
                        onChange={deliveryChangeHandle}
                      />
                      <p className="">Motoboy</p>
                    </div>
                    <p>R$ 10</p>
                  </div>
                  <div className="flex justify-between py-1">
                    <div className="flex gap-3 align-middle">
                      <input type="radio" name="deliveryType" id="sedex" value="Sedex" onChange={deliveryChangeHandle} />
                      <p className="">SEDEX</p>
                    </div>
                    <p>R$ 22,50</p>
                  </div>
                </div>
              ) : null}

              <button
                onClick={goToCheckout}
                className="mb-3 rounded-lg bg-white/10 px-7 py-3 font-semibold text-white no-underline transition hover:bg-lime-400 hover:text-neutral-950"
              >
                Finalizar a compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// const checkCep = (cep: number) => {
//   const getCepInfo = async (cep: number) => {
//     const res = await axios.get<SingleCepResponse>(
//       `https://viacep.com.br/ws/${cep}/json/`
//     );

//     const cepInfo = res.data;

//     return cepInfo;
//   };
// };

export default ShoppingCart;
