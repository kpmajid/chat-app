//frontend\src\features\auth
import { createAsyncThunk } from "@reduxjs/toolkit";
import client from "../../api/client";
import { AxiosError } from "axios";
import type { User } from "@/lib/types";

interface ErrorResponse {
  message?: string;
}

export const fetchUserData = createAsyncThunk<
  User,
  void,
  {
    rejectValue: string;
  }
>("auth/fetchUserData", async (_, { rejectWithValue, signal }) => {
  try {
    const response = await client.get("/api/user/me", {
      signal,
    });

    const user = response.data.data;
    console.log(user)
    // Validate response data
    if (!user) {
      return rejectWithValue("No user data received");
    }

    return user;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;

    return rejectWithValue(
      axiosError.response?.data?.message || "Failed to fetch user data"
    );
  }
});
