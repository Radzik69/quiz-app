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
import FloatingDockMenu from "./floatingDock";
import { AnimatedCircularProgressBar } from "./magicui/animated-circular-progress-bar";

export default function GenerateQuiz() {
  const [writtenTopic, setWrittenTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [sessionDbData, setSessionDbData] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState(null);
  const [proggresValue, setProggresValue] = useState(10);
  const [notionTopics, setNotionTopics] = useState(null);
  const finalTopic = writtenTopic || selectedTopic;

  const currentLink = "http://192.168.88.216"
  const userLogged = isUserLoggedIn((state) => state.user);

const [lastValidQuizData, setLastValidQuizData] = useState(null);

const getQuizData = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${currentLink}:5678/webhook/ai?topic=${finalTopic}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    console.log("Fetched question:", data);
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      !data[0] ||
      !data[0].output ||
      typeof data[0].output.question !== "string" ||
      !Array.isArray(data[0].output.answers) ||
      data[0].output.answers.length < 3 ||
      typeof data[0].output.correctAnswer !== "string"
    ) {
      console.error("Invalid question format:", data);
      setQuizData("error");
      return;
    }

    setQuizData(data);
    setLastValidQuizData(data);
  } catch (err) {
    console.error("Error fetching or validating question:", err);
    toast({
      variant: "destructive",
      title: "Error loading quiz",
      description: "AI did not return a valid question. Please try again.",
    });
    setQuizData("error");
  } finally {
    setLoading(false);
  }
};

const retryLastQuiz = () => {
  if (lastValidQuizData) {
    setQuizData(lastValidQuizData);
  }
};



  const getNotionTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${currentLink}:5678/webhook/getNotionTopics`);
      const data = await res.json();
      data.reverse();
      setNotionTopics(data);
      console.log("Fetched topics:", data);
    } catch (err) {
      console.error("Error fetching question:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSessionAnswers = async (sessionId) => {
    setLoading(true);
    try {
      const res = await fetch(`${currentLink}:5678/webhook/sessionAnswers?filter=${sessionId}`);
      const data = await res.json();
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
      const res = await fetch(`${currentLink}:5678/webhook/sessionCreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToDB)
      });
      const data = await res.json();
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
      const res = await fetch(`${currentLink}:5678/webhook/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToDB)
      });
      return await res.json();
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
      const res = await fetch(`${currentLink}:5678/webhook/answerCreate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToDB)
      });
      return await res.json();
    } catch (err) {
      console.error("Error saving answer to database:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sessionAddScore = async () => {
    setLoading(true);
    const dataToDB = {
      id: sessionDbData.id,
      score: score
    };
    try {
      const res = await fetch(`${currentLink}:5678/webhook/sessionUpdate`, {
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
    const questionId = savedQuestion.id;
    const sessionId = sessionDbData.id;
    const isCorrect = answer == quizData[0].output.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      toast({
        variant: "success",
        title: "Correct!",
        description: "Great job! Next question incoming."
      });
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect",
        description: `Correct answer: ${quizData?.[0]?.output?.correctAnswer}`
      });
    }

    await addAnswerToDB(answer, isCorrect, questionId, sessionId);
    setQuestionNumber((prev) => prev + 1);
    setProggresValue((prev) => prev + 10);
    getQuizData();
  };

  const generateQuiz = async () => {
    if (!finalTopic) {
      toast({
        variant: "destructive",
        title: "Topic required",
        description: "Please write or select a topic first"
      });
      return;
    }
    const session = await addSessionToDB();
    if (session) await getQuizData();
  };

  const generateNewQuiz = () => {
    setQuizData(null);
    setQuestionNumber(0);
    setProggresValue(0);
    setScore(0);
    setSessionDbData(null);
    setSessionAnswers(null);
    setWrittenTopic("");
    setSelectedTopic("");
    setLoading(false);
    toast({
      variant: "default",
      title: "New quiz started",
      description: "Let's go!"
    });
  };

  const resetTopic = () => {
    setWrittenTopic("");
    setSelectedTopic("");
  };

  useEffect(() => {
    if (questionNumber === 10 && sessionDbData?.id) {
      sessionAddScore();
      getSessionAnswers(sessionDbData.id);
    }
  }, [questionNumber]);

   useEffect(() => {
    getNotionTopics()
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 flex flex-col items-center py-10 gap-10">
      {loading && (
        <Card className="w-[350px] text-center animate-pulse shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-500">Loading...</CardTitle>
            <CardDescription className="text-blue-300">Please wait</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-blue-200 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !quizData && (
        <div>
        <Card className="w-[350px] shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-600">Start a New Quiz</CardTitle>
            <CardDescription>Select or type a topic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="customTopic">Custom Topic</Label>
                <Input
                  id="customTopic"
                  value={writtenTopic}
                  onChange={(e) => setWrittenTopic(e.target.value)}
                  disabled={!!selectedTopic}
                  placeholder="e.g. React, History"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="selectTopic">Predefined Topics</Label>
                <Select
                  value={selectedTopic}
                  onValueChange={setSelectedTopic}
                  disabled={!!writtenTopic}
                >
                  <SelectTrigger id="selectTopic">
                    <SelectValue placeholder="Choose topic..." />
                  </SelectTrigger>
                  <SelectContent>
                    {notionTopics && notionTopics.map((topic, index) => (
                      <SelectItem key={index} value={topic}>
                        {topic.property_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={resetTopic}>Clear</Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={generateQuiz}>Generate Quiz</Button>
          </CardFooter>
        </Card>
              <FloatingDockMenu />
        </div>
      )}

      {!loading && quizData && questionNumber < 10 && quizData!="error" && (
        <div>
        <Card className="w-full max-w-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              {`${questionNumber + 1}. ${quizData[0].output.question}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {quizData[0].output.answers.map((ans, i) => (
                <Button
                  key={i}
                  onClick={checkAnswerCorrect}
                  className="text-md py-5 transition-colors hover:bg-indigo-600 hover:text-white "
                >
                  {ans.text}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <AnimatedCircularProgressBar
          className="w-96 h-96 mt-10 flex justify-center items-center"
          max={100}
          min={0}
          value={proggresValue}
          gaugePrimaryColor="rgb(79 70 229)"
          gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
        />
        </div>
      )}

      {!loading && questionNumber === 10 && (
        <div className="w-full flex flex-col items-center gap-6">
          <Card className="w-[350px] text-center shadow-md">
            <CardHeader>
              <CardTitle>Quiz Finished</CardTitle>
              <CardDescription>Your score: {score} / 10</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={generateNewQuiz}>Start Again</Button>
            </CardContent>
          </Card>

          {sessionAnswers?.items.map((answer, index) => {
            const bgColor =
              answer.isTrueAnswer === "true" ? "bg-green-500" :
              answer.isTrueAnswer === "false" ? "bg-red-500" :
              "bg-gray-500";

            const label =
              answer.isTrueAnswer === "true" ? "Correct" :
              answer.isTrueAnswer === "false" ? "Wrong" :
              "No Answer";

            return (
              <div
                key={index}
                className={`w-[350px] text-center ${bgColor} py-2 rounded text-white`}
              >
                <h1>{index + 1}. {label}</h1>
              </div>
            );
          })}
                <FloatingDockMenu />
        </div>
      )}

      {!loading && quizData === "error" && (
  <Card className="w-[350px] text-center shadow-md">
    <CardHeader>
      <CardTitle>Oops!</CardTitle>
      <CardDescription>Something went wrong. Please try again.</CardDescription>
    </CardHeader>
    <CardContent>
      <Button onClick={retryLastQuiz}>Try Again</Button>
    </CardContent>
  </Card>
)}


    </div>
  );
}
