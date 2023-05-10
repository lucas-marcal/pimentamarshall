import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  cartReducer,
} from "./cart.slice";
import { listenerMiddleware, startAppListening } from "./listenerMiddleware";

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

const reducer = {
  cart: cartReducer,
};

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
