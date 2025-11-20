import { configureStore } from "@reduxjs/toolkit";
import connectionsReducer from "@/features/connections/connectionsSlice";
import messagesReducer from "@/features/messages/messagesSlice";
import userReducer from "@/features/user/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    connections: connectionsReducer,
    messages: messagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
