import { create } from "zustand";

export const isUserLoggedIn = create((set) => ({
  user: false,
  setIsUserLoggedIn: (userData) => set({ user: userData }),
}));

