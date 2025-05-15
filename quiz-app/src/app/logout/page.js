"use client"
import { isUserLoggedIn } from "@/app/globalVariables";
import { useRouter } from 'next/navigation'
import { useEffect } from "react";

export default function Logout() {
  const router = useRouter();

  const setIsUserLoggedIn = isUserLoggedIn((state) => state.setIsUserLoggedIn);

  useEffect(() => {
    setIsUserLoggedIn(null);
    router.push("/");
  }, [setIsUserLoggedIn, router]);

  return (
    <div className="flex items-center justify-center mt-20 mb-10">
      <h1 className="text-2xl font-bold">Wylogowano</h1>
    </div>
  );
}
