"use client"
import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function GenerateQuiz() {

    const linkSchool = "http://172.16.15.163"
    const linkHome = "http://192.168.88.216"
    const [quizData,setQuizData] = useState(null)

    const getQuizData = async () => {
    
        try {
          const res = await fetch(`${linkSchool}:5678/webhook-test/ai`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "host":"172.16.15.163:5678",
              "connection":"keep-alive",
              "accept":"*/*",
              "origin":"http://localhost:3000",
            },
          });
      
            const data = await res.json();
            console.log("Response from n8n:", data);
            setQuizData(data)
        } catch (err) {
          console.error("Error sending data to n8n:", err);
        }
      };

    const testFunc = (e) => {
        console.log(e.target.innerText)
        if(e.target.innerText === quizData[0].output.correctAnswer){
            console.log("Correct answer")
    }
        else{
            console.log("Wrong answer")
        }

        getQuizData()
}

return(
    <div>
        <Button onClick={()=>getQuizData()}></Button>
        <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{quizData!=null ? quizData[0].output.question : "Pytanie 1"} </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
            {/* <div onClick={testFunc}>
                <h1>{quizData!=null ? quizData[0].output.answers[0].text : "Odpowiedz 1"}</h1>
            </div>
            <div>
                <h1>{quizData!=null ? quizData[0].output.answers[1].text : "Odpowiedz 2"}</h1>
            </div>
            <div>
                <h1>{quizData!=null ? quizData[0].output.answers[2].text : "Odpowiedz 3"}</h1>
            </div>
            <div>
                <h1>{quizData!=null ? quizData[0].output.answers[3].text : "Odpowiedz 4"}</h1>
            </div> */}

            <Button onClick={(e)=>{testFunc(e)}}>{quizData!=null ? quizData[0].output.answers[0].text : "Odpowiedz 1"}</Button>
            <Button onClick={(e)=>{testFunc(e)}}>{quizData!=null ? quizData[0].output.answers[1].text : "Odpowiedz 2"}</Button>
            <Button onClick={(e)=>{testFunc(e)}}>{quizData!=null ? quizData[0].output.answers[2].text : "Odpowiedz 3"}</Button>
            <Button onClick={(e)=>{testFunc(e)}}>{quizData!=null ? quizData[0].output.answers[3].text : "Odpowiedz 4"}</Button>

        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Submit Question</Button>
      </CardFooter>
    </Card>
    </div>
)
}
