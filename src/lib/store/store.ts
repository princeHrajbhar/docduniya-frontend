"use client";
import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export type ApiCall = {
  operationId: string;
  path: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
  file?: File;
  key?: string;
};
export type ApiResult = {
  data?: unknown;
  message?: string;
  pagination?: unknown;
};
export const platformApi = createApi({
  reducerPath: "platformApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/platform",
    credentials: "same-origin",
    timeout: 30000,
  }),
  tagTypes: ["Records"],
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    read: builder.query<ApiResult, ApiCall>({
      query: (body) => ({ url: "", method: "POST", body }),
      providesTags: ["Records"],
    }),
    command: builder.mutation<ApiResult, ApiCall>({
      query: (input) => {
        if (!input.file) return { url: "", method: "POST", body: input };
        const form = new FormData();
        const { file, ...metadata } = input;
        form.set("request", JSON.stringify(metadata));
        form.set("file", file);
        return { url: "", method: "POST", body: form };
      },
      invalidatesTags: (_result, error) => (error ? [] : ["Records"]),
    }),
  }),
});
const workspace = createSlice({
  name: "workspace",
  initialState: { context: {} as Record<string, string>, search: "" },
  reducers: {
    setContext: (state, action: PayloadAction<Record<string, string>>) => {
      state.context = { ...state.context, ...action.payload };
    },
    clearContext: (state) => {
      state.context = {};
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
  },
});
export const { setContext, clearContext, setSearch } = workspace.actions;
export const makeStore = () =>
  configureStore({
    reducer: {
      workspace: workspace.reducer,
      [platformApi.reducerPath]: platformApi.reducer,
    },
    middleware: (get) => get().concat(platformApi.middleware),
    devTools: false,
  });
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const { useReadQuery, useLazyReadQuery, useCommandMutation } =
  platformApi;
