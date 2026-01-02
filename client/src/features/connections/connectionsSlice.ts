import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import type { DisplayUser } from "../../types/user";

interface ConnectionsState {
  connections: DisplayUser[];
  pendingConnections: DisplayUser[];
  followers: DisplayUser[];
  following: DisplayUser[];
}

const initialState: ConnectionsState = {
  connections: [],
  pendingConnections: [],
  followers: [],
  following: [],
};

export const fetchConnections = createAsyncThunk(
  "connections/fetchConnections",
  async (token: string) => {
    const { data } = await api.get("/api/user/connections", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data.success) return null;

    return {
      connections: data.connections,
      pendingConnections: data.pendingConnections,
      followers: data.followers,
      following: data.following,
    };
  }
);

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchConnections.fulfilled, (state, action) => {
      if (!action.payload) return;

      state.connections = action.payload.connections;
      state.pendingConnections = action.payload.pendingConnections;
      state.followers = action.payload.followers;
      state.following = action.payload.following;
    });
  },
});

export default connectionsSlice.reducer;
