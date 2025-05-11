"use client"
import LoginPage from "@/components/loginPage";
import { useState } from "react";
import { isUserLoggedIn } from "./globalVariables";
import GenerateQuiz from "@/components/generateQuiz";
import { Button } from "@/components/ui/button";
import Link from "next/link";



export default function Page() {
  const userLogged = isUserLoggedIn((state) => state.user);

  if(!userLogged){
    return(
      <LoginPage></LoginPage>
    )
  }

  return (
    <div>
        <GenerateQuiz></GenerateQuiz>
        <Link href="/historyStats">
          <Button asChild>
            <h1>Wyświetl Historię</h1>
          </Button>
        </Link>
        <Link href="/stats">
          <Button asChild>
            <h1>Wyświetl statystyki</h1>
          </Button>
        </Link>
    </div>
  );
}