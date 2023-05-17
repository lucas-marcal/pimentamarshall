import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface shippingState {
    type: string
    price: number
  }

const initialState: shippingState = {
    type: "",
    price: 0
}

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    setShipping: (state, action: PayloadAction<shippingState>) => {
      state.type = action.payload.type;
      state.price = action.payload.price;
    }
  },
});

export const shippingReducer = shippingSlice.reducer;

export const {
  setShipping
} = shippingSlice.actions;
