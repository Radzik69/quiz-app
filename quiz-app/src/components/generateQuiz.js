"use client"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { isUserLoggedIn } from "@/app/globalVariables";

export default function GenerateQuiz() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizData, setQuizData] = useState(null)
  const linkSchool = "http://172.16.15.163"
  const linkHome = "http://192.168.88.216"
  const [questionDbData, setQuestionDbData] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [sessionDbData, setSessionDbData] = useState(null)
  const [score, setScore] = useState(0)
  const userLogged = isUserLoggedIn((state) => state.user);

  const getQuizData = async () => {
    try {
      const res = await fetch(`${linkHome}:5678/webhook/ai`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("Response from n8n:", data);
      setQuizData(data)
      setQuestionNumber(questionNumber + 1)

    } catch (err) {
      console.error("Error fetching quiz:", err);
    }
  };

  const addQuestionToDB = async () => {
    const dataToDB = {
      question: quizData[0].output.question,
      category: selectedTopic,
      answers: JSON.stringify(quizData[0].output.answers)
    };
  
    try {
      const res = await fetch(`${linkHome}:5678/webhook/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToDB),
      });
      const data = await res.json();
      setQuestionDbData(data)
      console.log("Response from n8n:", data);
    } catch (err) {
      console.error("Error sending data to n8n:", err);
    }
  };
  
  const addSessionToDB = async () => {
    console.log("User logged:", userLogged);

    const dataToDB = {
      user: userLogged[0].record.id,
      category: selectedTopic,
    };
    console.log("Data to send to n8n:", dataToDB);
    try {
      const res = await fetch(`${linkHome}:5678/webhook/sessionCreate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToDB),
      });
      const data = await res.json();
      setSessionDbData(data)
      console.log("Response from n8n:", data);
    } catch (err) {
      console.error("Error sending data to n8n:", err);
    }
  };

  const checkAnswerCorrect = (e) => {
    addQuestionToDB()
    const answer = e.target.innerText;
    if (answer === quizData[0].output.correctAnswer) {
      console.log("Correct answer");
      setScore(score + 1)
      toast({
        variant: "outline",
        title: "Your answer is correct",
        description: "Congratulations on getting the right answer, now please go to next question",
      })
    } else {
      console.log("Wrong answer");
      toast({
        variant: "destructive",
        title: "Your answer is wrong",
        description: "The correct answer was: " + quizData[0].output.correctAnswer,
      })
    }
    getQuizData()
  };

  const getTopic = (e) => {
    setSelectedTopic(e.target.value);
  };

  const generateQuiz = (e) => {
    e.preventDefault();
    console.log("Selected topic:", selectedTopic);
    addSessionToDB()
    getQuizData();
  };

  const sessionAddScore = async () => {
    const dataToDB = {
      id: sessionDbData[0].id,
      score: score,
    };
  
    try {
      const res = await fetch(`${linkHome}:5678/webhook/sessionUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToDB),
      });
      const data = await res.json();
      console.log("Response from n8n:", data);
    } catch (err) {
      console.error("Error sending data to n8n:", err);
    }
  }

  if(questionNumber==10){
    sessionAddScore()
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 gap-10">
      {quizData==null && (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Generate New Quiz</CardTitle>
          <CardDescription>Choose or write your quiz topic</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="customTopic">Write your own topic</Label>
                <Input onChange={getTopic} id="customTopic" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="selectTopic">Select topic</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger id="selectTopic">
                    <SelectValue placeholder="Select a topic..." />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="next">Next.js</SelectItem>
                    <SelectItem value="sveltekit">SvelteKit</SelectItem>
                    <SelectItem value="astro">Astro</SelectItem>
                    <SelectItem value="nuxt">Nuxt.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setSelectedTopic(null)}>Reset</Button>
          <Button type="submit" onClick={generateQuiz}>Generate Quiz</Button>
        </CardFooter>
      </Card>
)}
      {quizData && questionNumber<=10 && (
        <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>
            {quizData && quizData[0]?.output?.question
              ? <h1> {questionNumber}. {quizData[0].output.question}</h1>
              : "Pytanie"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              onClick={(e) => checkAnswerCorrect(e)}
              className="text-lg py-6"
            >
              {quizData && quizData[0]?.output?.answers?.[0]?.text
                ? quizData[0].output.answers[0].text
                : "Odpowiedź 1"}
            </Button>
            <Button
              onClick={(e) => checkAnswerCorrect(e)}
              className="text-lg py-6"
            >
              {quizData && quizData[0]?.output?.answers?.[1]?.text
                ? quizData[0].output.answers[1].text
                : "Odpowiedź 2"}
            </Button>
            <Button
              onClick={(e) => checkAnswerCorrect(e)}
              className="text-lg py-6"
            >
              {quizData && quizData[0]?.output?.answers?.[2]?.text
                ? quizData[0].output.answers[2].text
                : "Odpowiedź 3"}
            </Button>
            <Button
              onClick={(e) => checkAnswerCorrect(e)}
              className="text-lg py-6"
            >
              {quizData && quizData[0]?.output?.answers?.[3]?.text
                ? quizData[0].output.answers[3].text
                : "Odpowiedź 4"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={getQuizData}>
            Next Question
          </Button>
        </CardFooter>
      </Card>
      )}

      {questionNumber>10 && (
        <div>
          <div className="text-center mb-4">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Quiz finished</CardTitle>
            <CardDescription>Congratulations, you finished the quiz!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() =>{generateQuiz()}}>Start new quiz</Button>
          </CardContent>
        </Card>
        </div>
            <div>
              
            </div> 
        </div>
      )}
    </div>
  );
}
