"use client";

import { useEffect, useState } from "react";
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
  const [writtenTopic, setWrittenTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [sessionDbData, setSessionDbData] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState(null);

  const finalTopic = writtenTopic || selectedTopic;

  const linkHome = "http://192.168.88.216";
  const userLogged = isUserLoggedIn((state) => state.user);

  const getQuizData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${linkHome}:5678/webhook/ai?topic=${finalTopic}`);
      const data = await res.json();
      console.log(`Generate Quiz question ${questionNumber + 1} Response:`, data);
      setQuizData(data);
    } catch (err) {
      console.error("Error fetching question:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSessionAnswers = async (sessionId) => {
    setLoading(true);
    try {
      const res = await fetch(`${linkHome}:5678/webhook/sessionAnswers?filter=${sessionId}`);
      const data = await res.json();
      console.log("Fetched all answers within specific session Response:", data);
      setSessionAnswers(data);
    } catch (err) {
      console.error("Error fetching session answers:", err);
    } finally {
      setLoading(false);
    }
  };

  const addSessionToDB = async () => {
    setLoading(true);
    const dataToDB = {
      user: userLogged[0].record.id,
      category: finalTopic
    };
    try {
      const res = await fetch(`${linkHome}:5678/webhook/sessionCreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToDB)
      });
      const data = await res.json();
      console.log("Session created:", data);
      setSessionDbData(data);
      return data;
    } catch (err) {
      console.error("Error creating session:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addQuestionToDB = async () => {
    setLoading(true);
    const dataToDB = {
      question: quizData[0].output.question,
      category: finalTopic,
      answers: JSON.stringify(quizData[0].output.answers)
    };
    try {
      const res = await fetch(`${linkHome}:5678/webhook/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToDB)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error saving question to database:", err);
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
      return data;
    } catch (err) {
      console.error("Error saving answer to database:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sessionAddScore = async () => {
    if (!sessionDbData || !sessionDbData[0]?.id) return;
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
      await res.json();
    } catch (err) {
      console.error("Error updating session score:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswerCorrect = async (e) => {
    const answer = e.target.innerText;
    const savedQuestion = await addQuestionToDB();
    const questionId = savedQuestion?.[0]?.id;
    const sessionId = sessionDbData?.[0]?.id;
    const isCorrect = answer === quizData?.[0]?.output?.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast({
        variant: "outline",
        title: "Your answer is correct",
        description: "Congratulations on getting the right answer, now please go to next question",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Your answer is wrong",
        description: "The correct answer was: " + quizData?.[0]?.output?.correctAnswer,
      });
    }

    await addAnswerToDB(answer, isCorrect, questionId, sessionId);
    setQuestionNumber((prev) => prev + 1);
    getQuizData();
  };

  const generateQuiz = async () => {
    if (!finalTopic) {
      toast({
        variant: "destructive",
        title: "Topic required",
        description: "Please write or select a topic first",
      });
      return;
    }

    console.log("Selected topic:", finalTopic);
    const session = await addSessionToDB();
    if (session) await getQuizData();
  };

  const generateNewQuiz = () => {
    setQuizData(null);
    setQuestionNumber(0);
    setScore(0);
    setSessionDbData(null);
    setSessionAnswers(null);
    setWrittenTopic("");
    setSelectedTopic("");
    setLoading(false);
    toast({
      variant: "default",
      title: "New quiz generated",
      description: "You can start answering questions now!",
    });
  };

  const resetTopic = () => {
    setWrittenTopic("");
    setSelectedTopic("");
  };

  useEffect(() => {
    if (questionNumber === 10 && sessionDbData?.[0]?.id) {
      sessionAddScore();
      getSessionAnswers(sessionDbData[0].id);
    }
  }, [questionNumber]);

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
            <div className="grid w-full gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="customTopic">Write your own topic</Label>
                <Input
                  id="customTopic"
                  value={writtenTopic}
                  onChange={(e) => setWrittenTopic(e.target.value)}
                  disabled={!!selectedTopic}
                  placeholder="Type your custom topic"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="selectTopic">Select topic</Label>
                <Select
                  value={selectedTopic}
                  onValueChange={setSelectedTopic}
                  disabled={!!writtenTopic}
                >
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
              <Button variant="outline" onClick={resetTopic}>
                Reset topic
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={generateQuiz}>Generate Quiz</Button>
          </CardFooter>
        </Card>
      )}

      {!loading && quizData && questionNumber < 10 && (
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>
              {quizData?.[0]?.output?.question ? `${questionNumber + 1}. ${quizData[0].output.question}` : "Pytanie"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {quizData[0]?.output?.answers?.map((ans, i) => (
                <Button
                  key={i}
                  onClick={(e) => checkAnswerCorrect(e)}
                  className="text-lg py-6"
                >
                  {ans.text || `Odpowiedź ${i + 1}`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && questionNumber === 10 && (
        <div>
          <Card className="w-[350px] text-center">
            <CardHeader>
              <CardTitle>Quiz finished</CardTitle>
              <CardDescription>Your score: {score} / 10</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={generateNewQuiz}>
                Start new quiz
              </Button>
            </CardContent>
          </Card>

          {sessionAnswers?.[0]?.items?.map((answer, index) => {
            const bgColor =
              answer.isTrueAnswer === "true"
                ? "bg-green-500"
                : answer.isTrueAnswer === "false"
                ? "bg-red-500"
                : "bg-gray-500";

            const label =
              answer.isTrueAnswer === "true"
                ? "Correct"
                : answer.isTrueAnswer === "false"
                ? "Wrong"
                : "No Answer";

            return (
              <div key={index} className={`w-[350px] text-center ${bgColor} my-2 py-2 rounded text-white`}>
                <h1>{index + 1}. {label}</h1>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
