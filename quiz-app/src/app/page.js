"use client"
import LoginPage from "@/components/loginPage";
import { useState } from "react";

export default function Page() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  if(!isUserLoggedIn){
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