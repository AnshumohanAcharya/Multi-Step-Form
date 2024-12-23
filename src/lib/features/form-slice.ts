import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormState {
  step: number;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    theme: string;
  };
}

const initialState: FormState = {
  step: 1,
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
  },
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
  },
  preferences: {
    notifications: false,
    newsletter: false,
    theme: "light",
  },
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    updatePersonalInfo: (
      state,
      action: PayloadAction<Partial<FormState["personalInfo"]>>
    ) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    updateAddress: (
      state,
      action: PayloadAction<Partial<FormState["address"]>>
    ) => {
      state.address = { ...state.address, ...action.payload };
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<FormState["preferences"]>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    resetForm: (state) => {
      return initialState;
    },
  },
});

export const {
  setStep,
  updatePersonalInfo,
  updateAddress,
  updatePreferences,
  resetForm,
} = formSlice.actions;
export default formSlice.reducer;
