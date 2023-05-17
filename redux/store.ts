import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  cartReducer,
} from "./cart.slice";
import { listenerMiddleware, startAppListening } from "./listenerMiddleware";
import { addressReducer, setAddress } from "./address.slice";
import { setShipping, shippingReducer } from "./shipping.slice";

startAppListening({
  matcher: isAnyOf(
    addToCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart
  ),
  effect: async (action, listenerApi) => {
    localStorage.setItem("cart", JSON.stringify(listenerApi.getState().cart));
  },
});

startAppListening({
  actionCreator: setAddress,
  effect: async (action, listenerApi) => {
    localStorage.setItem("address", JSON.stringify(listenerApi.getState().address));
  },
});

startAppListening({
  actionCreator: setShipping,
  effect: async (action, listenerApi) => {
    localStorage.setItem("shipping", JSON.stringify(listenerApi.getState().shipping));
  },
});

const reducer = {
  cart: cartReducer,
  address: addressReducer,
  shipping: shippingReducer,
};

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
