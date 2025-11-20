import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api/axios";
import { toast } from "react-hot-toast";
import type { DisplayUser } from "@/types/user";

interface UserState {
  value: DisplayUser | null;
}

const initialState: UserState = {
  value: null,
};

export const fetchUser = createAsyncThunk("user/fetchUser", async (token: string) => {
  const { data } = await api.get("/api/user/data", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data.success ? (data.user as DisplayUser) : null;
});

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userData, token }: { userData: FormData; token: string }) => {
    const { data } = await api.post("/api/user/update", userData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      toast.success(data.message);
      return data.user as DisplayUser;
    }

    toast.error(data.message);
    return null;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.value = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.value = action.payload;
      });
  },
});

export default userSlice.reducer;
