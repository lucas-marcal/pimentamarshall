import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface CartProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  urlSlug: string;
  quantity: number;
}

interface CartState extends Array<CartProduct> {}

const initialState: CartState = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartProduct>) => {
      const itemExists = state.find((item) => item.id === action.payload.id);
      if (itemExists) {
        itemExists.quantity += action.payload.quantity;
      } else {
        state.push({ ...action.payload, quantity: action.payload.quantity });
      }
    },
    incrementQuantity: (state, action: PayloadAction<CartProduct>) => {
      const item = state.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity++;
      }
    },
    decrementQuantity: (state, action: PayloadAction<CartProduct>) => {
      const item = state.find((item) => item.id === action.payload.id);
      if (item) {
        if (item.quantity === 1) {
          const index = state.findIndex((item) => item.id === action.payload.id);
          state.splice(index, 1);
        } else {
          item.quantity--;
        }
      }
    },
    removeFromCart: (state, action) => {
      const index = state.findIndex((item) => item.id === action.payload);
      state.splice(index, 1);
    },
  },
});

export const cartReducer = cartSlice.reducer;

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} = cartSlice.actions;
