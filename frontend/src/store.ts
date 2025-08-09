//frontend\src
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import chatReducer from "./features/chat/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});

export type AppStore = typeof store;

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
