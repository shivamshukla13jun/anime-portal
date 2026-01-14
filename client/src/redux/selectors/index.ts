// src/redux/selectors/userSelectors.ts
import { Role } from "@/types";
import { RootState } from "../store";
export const CurrentRole = (state: RootState) =>
  state.user?.user?.role as Role;

export const CurrentUser = (state: RootState) =>
  state.user?.user;
export const SelectUser = (state: RootState) =>
  state.user;

