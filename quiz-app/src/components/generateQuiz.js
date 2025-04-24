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
import { useEffect, useState } from "react";

export default function GenerateQuiz() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizData, setQuizData] = useState(null)

  const linkSchool = "http://172.16.15.163"
  const getQuizData = async () => {
    try {
      const res = await fetch(`${linkSchool}:5678/webhook-test/ai`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("Response from n8n:", data);
      setQuizData(data)
    } catch (err) {
      console.error("Error fetching quiz:", err);
    }
  };

  const testFunc = (e) => {
    const answer = e.target.innerText;
    if (answer === quizData[0].output.correctAnswer) {
      console.log("Correct answer");
    } else {
      console.log("Wrong answer");
    }

    getQuizData();
  };

  const getTopic = (e) => {
    setSelectedTopic(e.target.value);
  };

  const generateQuiz = (e) => {
    e.preventDefault();
    console.log("Selected topic:", selectedTopic);
    getQuizData();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 gap-10">
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

      {quizData && (
        <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>
            {quizData && quizData[0]?.output?.question
              ? quizData[0].output.question
              : "Pytanie"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              onClick={(e) => testFunc(e)}
              className="text-lg py-6"
            >
              {quizData && quizData[0]?.output?.answers?.[0]?.text
                ? quizData[0].output.answers[0].text
                : "Odpowiedź 1"}
            </Button>
            <Button
              onClick={(e) => testFunc(e)}
              className="text-lg py-6"
            >
              {quizData && quizData[0]?.output?.answers?.[1]?.text
                ? quizData[0].output.answers[1].text
                : "Odpowiedź 2"}
            </Button>
            <Button
              onClick={(e) => testFunc(e)}
              className="text-lg py-6"
            >
              {quizData && quizData[0]?.output?.answers?.[2]?.text
                ? quizData[0].output.answers[2].text
                : "Odpowiedź 3"}
            </Button>
            <Button
              onClick={(e) => testFunc(e)}
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
    </div>
  );
}
