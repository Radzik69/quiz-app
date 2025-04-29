"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { isUserLoggedIn } from "@/app/globalVariables";

export default function GenerateQuiz() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [sessionDbData, setSessionDbData] = useState(null);
  const [score, setScore] = useState(0);
  const [buttonDisable, setButtonDisable] = useState(false);
  const [loading, setLoading] = useState(false);

  const linkHome = "http://192.168.88.216";
  const userLogged = isUserLoggedIn((state) => state.user);

  const getQuizData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${linkHome}:5678/webhook/ai`);
      const data = await res.json();
      console.log("🟡 AI Response:", data);
      setQuizData(data);
      setButtonDisable(false);
    } catch (err) {
      console.error("❌ Error fetching quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const addSessionToDB = async () => {
    setLoading(true);
    const dataToDB = {
      user: userLogged[0].record.id,
      category: selectedTopic
    };
    try {
      const res = await fetch(`${linkHome}:5678/webhook/sessionCreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToDB)
      });
      const data = await res.json();
      console.log("🟢 Session created:", data);
      setSessionDbData(data);
      return data;
    } catch (err) {
      console.error("❌ Error creating session:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addQuestionToDB = async () => {
    setLoading(true);
    const dataToDB = {
      question: quizData[0].output.question,
      category: selectedTopic,
      answers: JSON.stringify(quizData[0].output.answers)
    };
    try {
      const res = await fetch(`${linkHome}:5678/webhook/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToDB)
      });
      const data = await res.json();
      console.log("🟢 Question saved:", data);
      return data;
    } catch (err) {
      console.error("❌ Error saving question:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addAnswerToDB = async (selectedAnswer, isTrueAnswer, questionId, sessionId) => {
    setLoading(true);
    const dataToDB = {
      user: userLogged[0].record.id,
      session: sessionId,
      question: questionId,
      selectedAnswer,
      isTrueAnswer
    };
    try {
      const res = await fetch(`${linkHome}:5678/webhook/answerCreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToDB)
      });
      const data = await res.json();
      console.log("🟢 Answer saved:", data);
      return data;
    } catch (err) {
      console.error("❌ Error saving answer:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sessionAddScore = async () => {
    if (!sessionDbData || !sessionDbData[0]) return;
    setLoading(true);
    const dataToDB = {
      id: sessionDbData[0].id,
      score: score
    };
    try {
      const res = await fetch(`${linkHome}:5678/webhook/sessionUpdate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToDB)
      });
      const data = await res.json();
      console.log("🟢 Session updated:", data);
    } catch (err) {
      console.error("❌ Error updating session:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswerCorrect = async (e) => {
    const selectedAnswer = e.target.innerText;
    setButtonDisable(true);
    const questionRecord = await addQuestionToDB();
    const questionId = questionRecord?.[0]?.id;
    const sessionId = sessionDbData?.[0]?.id;

    if (!questionId || !sessionId) {
      console.error("❌ Missing questionId or sessionId.");
      return;
    }

    const correctAnswer = quizData[0].output.correctAnswer;
    const isCorrect = selectedAnswer === correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast({
        variant: "outline",
        title: "Correct!",
        description: "You chose the right answer!"
      });
    } else {
      toast({
        variant: "destructive",
        title: "Wrong!",
        description: `Correct answer was: ${correctAnswer}`
      });
    }

    await addAnswerToDB(selectedAnswer, isCorrect, questionId, sessionId);
    setQuestionNumber((prev) => prev + 1);
    await getQuizData();
  };

  const generateQuiz = async (e) => {
    e.preventDefault();
    const session = await addSessionToDB();
    if (session) {
      await getQuizData();
      setQuestionNumber(1);
      setScore(0);
    }
  };

  if (questionNumber === 11) {
    sessionAddScore();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 gap-10">
      {loading && (
        <Card className="w-[350px] text-center animate-pulse">
          <CardHeader>
            <CardTitle className="text-gray-400">Loading...</CardTitle>
            <CardDescription className="text-gray-300">Please wait</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-300 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !quizData && (
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
                  <Input
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    id="customTopic"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="selectTopic">Select topic</Label>
                  <Select value={selectedTopic ?? ""} onValueChange={setSelectedTopic}>
                    <SelectTrigger id="selectTopic">
                      <SelectValue placeholder="Select a topic..." />
                    </SelectTrigger>
                    <SelectContent>
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
            <Button variant="outline" onClick={() => setSelectedTopic(null)}>
              Reset
            </Button>
            <Button type="submit" onClick={generateQuiz}>
              Generate Quiz
            </Button>
          </CardFooter>
        </Card>
      )}

      {!loading && quizData && questionNumber <= 10 && (
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>
              {questionNumber}. {quizData?.[0]?.output?.question || "Question"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {quizData[0]?.output?.answers?.map((ans, index) => (
                <Button
                  key={index}
                  onClick={checkAnswerCorrect}
                  disabled={buttonDisable}
                  className="text-lg py-6"
                >
                  {ans?.text || `Answer ${index + 1}`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && questionNumber > 10 && (
        <Card className="w-[350px] text-center">
          <CardHeader>
            <CardTitle>Quiz finished</CardTitle>
            <CardDescription>Good job! Your score: {score} / 10</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={generateQuiz}>
              Start new quiz
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
