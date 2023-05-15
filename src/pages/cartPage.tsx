import Image from "next/image";
import { decrementQuantity, incrementQuantity, removeFromCart } from "redux/cart.slice";
import { useAppDispatch, useAppSelector } from "redux/hooks";

const CartPage = () => {

    const cart = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();
  
    const getTotalPrice = () => {
      return cart.reduce(
        (accumulator, item) => accumulator + item.quantity * item.price,
        0
      );
    };
    
  
    return (
      <div className="flex flex-col">
        {cart.length === 0 ? (
          <h1>Your Cart is Empty!</h1>
        ) : (
          <>
            <div className="flex space-x-3 justify-between">
              <div>Image</div>
              <div>Product</div>
              <div>Price</div>
              <div>Quantity</div>
              <div>Actions</div>
              <div>Total Price</div>
            </div>
            {cart.map((item) => (
              <div className="flex space-x-3 justify-between" key={item.id}>
                <div className="">
                  <Image alt={`Imagem do produto ${item.name}`} src={item.image} height="90" width="90" />
                </div>
                <p>{item.name}</p>
                <p>$ {item.price}</p>
                <p>{item.quantity}</p>
                <div className="">
                  <button onClick={() => dispatch(incrementQuantity(item.id))}>
                    +
                  </button>
                  <button onClick={() => dispatch(decrementQuantity(item.id))}>
                    -
                  </button>
                  <button onClick={() => dispatch(removeFromCart(item.id))}>
                    x
                  </button>
                </div>
                <p>$ {item.quantity * item.price}</p>
              </div>
            ))}
            <h2>Grand Total: $ {getTotalPrice()}</h2>
          </>
        )}
      </div>
    );
  };
  
  export default CartPage;