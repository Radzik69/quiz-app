"use client"
import { isUserLoggedIn } from "@/app/globalVariables"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useState } from "react"

export default function LoginPage() {
  const setUserLogged = isUserLoggedIn((state) => state.setIsUserLoggedIn);

  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isError, setIsError] = useState(false);
  // const currentLink = "http://172.16.15.163"
  const currentLink = "http://192.168.88.216"

  const getInputData = (data) => {
    if(data.target.id === "email") setUserEmail(data.target.value);
    if(data.target.id === "username") setUserName(data.target.value);
    if(data.target.id === "password") setUserPassword(data.target.value);
  }

  const handleRegister = async () => {
  
    const dataToDB = {
      email: userEmail,
      username: userName,
      password: userPassword,
    };

    try {
      const res = await fetch(`${currentLink}:5678/webhook/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToDB), 
      });
  
      const data = await res.json();
      console.log("Response from n8n:", data);
      setUserLogged(data)
    } catch (err) {
      console.error("Error sending data to n8n:", err);
      setIsError(true);
    }
  };

  const handleLogin = async () => {
  
    const dataToDB = {
      email: userEmail,
      password: userPassword,
    };

    try {
      const res = await fetch(`${currentLink}:5678/webhook/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToDB), 
      });
  
      const data = await res.json();
      console.log("Response from n8n:", data);
      setUserLogged(data)
    } catch (err) {
      console.error("Error sending data to n8n:", err);
      setIsError(true);
    }
  };
  


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-700 p-4">
      <Tabs defaultValue="Register" className="w-full max-w-md shadow-xl rounded-2xl bg-gray-800/80 backdrop-blur-md p-6" onValueChange={() => setIsError(false)}
>
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-700/50 backdrop-blur-md rounded-xl shadow-inner">
          <TabsTrigger
            value="Register"
            className="rounded-xl text-gray-200 data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all"
          >
            Register
          </TabsTrigger>
          <TabsTrigger
            value="Login"
            className="rounded-xl text-gray-200 data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all"
          >
            Login
          </TabsTrigger>
        </TabsList>

        <TabsContent value="Register">
          <Card className="bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-700">
            <CardHeader>
              <CardTitle className="text-indigo-400">Register</CardTitle>
              <CardDescription className="text-gray-400">
                If you don't have an account, register here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input onChange={(e)=>{getInputData(e)}} id="email" className="bg-gray-700 border-gray-600 text-white"/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input onChange={(e)=>{getInputData(e)}} id="username" className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input onChange={(e)=>{getInputData(e)}} type="password" id="password" className="bg-gray-700 border-gray-600 text-white" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRegister} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Register
              </Button>
              {isError && (
                <div className="text-red-500 text-sm mt-2">
                  Invalid email or password.
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="Login">
          <Card className="bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-700">
            <CardHeader>
              <CardTitle className="text-indigo-400">Login</CardTitle>
              <CardDescription className="text-gray-400">
                If you already have an account, login here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input onChange={(e)=>{getInputData(e)}} id="email" className="bg-gray-700 border-gray-600 text-white"/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input onChange={(e)=>{getInputData(e)}} type="password" id="password" className="bg-gray-700 border-gray-600 text-white" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleLogin} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Login
              </Button>
              {isError && (
                <div className="text-red-500 text-sm mt-2">
                  Invalid email or password.
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
