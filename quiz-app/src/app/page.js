"use client"
import LoginPage from "@/components/loginPage";
import { useState } from "react";
import { isUserLoggedIn } from "./globalVariables";

export default function Page() {
  const userLogged = isUserLoggedIn((state) => state.user);

  if(!userLogged){
    return(
      <LoginPage></LoginPage>
    )
  }

  return (
    <div>
      <h1>Quiz App</h1>
      <p>Welcome to the Quiz App!</p>
    </div>
  );
}