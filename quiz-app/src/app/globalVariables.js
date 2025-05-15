
"use client";
import { create } from "zustand";

export const isUserLoggedIn = create((set) => ({
  user: 
    [
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
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9uSWQiOiJfcGJfdXNlcnNfYXV0aF8iLCJleHAiOjE3NDc5MDg0MDQsImlkIjoiNnpkM3I5cTUzMWxncjUyIiwicmVmcmVzaGFibGUiOnRydWUsInR5cGUiOiJhdXRoIn0.YjjIJ_17A250IGB3H-jtcHzb6gqfQfVhVltgVLYxc7E"
    }
]
    // null
,
  setIsUserLoggedIn: (userData) => set({ user: userData }),
}));

