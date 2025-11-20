import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api/axios";
import type { ChatMessage } from "@/types/message";

interface MessagesState {
  messages: ChatMessage[];
}

const initialState: MessagesState = {
  messages: [],
};

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ token, userId }: { token: string; userId: string }) => {
    const { data } = await api.post(
      "/api/message/get",
      { to_user_id: userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return data.success ? (data.messages as ChatMessage[]) : null;
  }
);

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    resetMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      if (action.payload) {
        state.messages = action.payload;
      }
    });
  },
});

export const { setMessages, addMessage, resetMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
