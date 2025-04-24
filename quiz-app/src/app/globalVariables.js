import { create } from "zustand";

export const isUserLoggedIn = create((set) => ({
  user: true,
  setIsUserLoggedIn: (userData) => set({ user: userData }),
}));
