import { create } from "zustand";

export const isUserLoggedIn = create((set) => ({
  user: [
    {
        "record": {
            "collectionId": "_pb_users_auth_",
            "collectionName": "users",
            "created": "2025-04-17 15:42:45.880Z",
            "email": "radzikowski.mateusz@gmail.com",
            "emailVisibility": false,
            "id": "6zd3r9q531lgr52",
            "name": "Radzik",
            "updated": "2025-04-17 15:42:45.880Z",
            "verified": false
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9uSWQiOiJfcGJfdXNlcnNfYXV0aF8iLCJleHAiOjE3NDcxNTQzOTQsImlkIjoiNnpkM3I5cTUzMWxncjUyIiwicmVmcmVzaGFibGUiOnRydWUsInR5cGUiOiJhdXRoIn0.V_EcIkb8cT_yOGzuevc72SQLksEdChC3R83wLmJ3fqw"
    }
],
  setIsUserLoggedIn: (userData) => set({ user: userData }),
}));

