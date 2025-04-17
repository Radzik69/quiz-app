"use client"
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

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-700 p-4">
      <Tabs defaultValue="Register" className="w-full max-w-md shadow-xl rounded-2xl bg-gray-800/80 backdrop-blur-md p-6">
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
                <Input id="email" className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input id="username" className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input type="password" id="password" className="bg-gray-700 border-gray-600 text-white" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Register
              </Button>
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
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input id="username" className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input type="password" id="password" className="bg-gray-700 border-gray-600 text-white" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Login
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
