import { PayloadAction, createSlice } from "@reduxjs/toolkit";

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

const initialState: SingleCepResponse = {
    cep: "",
    logradouro: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    ibge: 0,
    gia: 0,
    ddd: 0,
    siafi: 0,
}

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<SingleCepResponse>) => {
      state.bairro = action.payload.bairro;
      state.cep = action.payload.cep;
      state.complemento = action.payload.complemento;
      state.ddd = action.payload.ddd;
      state.gia = action.payload.gia;
      state.ibge = action.payload.ibge;
      state.localidade = action.payload.localidade;
      state.logradouro = action.payload.logradouro;
      state.siafi = action.payload.siafi;
      state.uf = action.payload.uf;
    }
  },
});

export const addressReducer = addressSlice.reducer;

export const {
  setAddress
} = addressSlice.actions;
