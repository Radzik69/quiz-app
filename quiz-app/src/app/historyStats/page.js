"use client";
import { useState, useEffect } from "react";
import { isUserLoggedIn } from "../globalVariables";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export default function History() {
  const userLogged = isUserLoggedIn((state) => state.user);
  const [allSessions, setAllSessions] = useState(null);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [sessionQuestions, setSessionQuestions] = useState([]);

  const linkHome = "http://192.168.88.216";

  const getAllSessions = async () => {
    try {
      const res = await fetch(`${linkHome}:5678/webhook/allSessionsUser?filter=${userLogged[0].record.id}`);
      const data = await res.json();
      setAllSessions(data);
    } catch (err) {
      console.error("Error fetching session answers:", err);
    }
  };

  const getSessionAnswers = async (sessionId) => {
    try {
      const res = await fetch(`${linkHome}:5678/webhook/sessionAnswers?filter=${sessionId}`);
      const data = await res.json();
      setSessionAnswers(data[0]?.items || []);
    } catch (err) {
      console.error("Error fetching session answers:", err);
    }
  };

  const getSessionQuestions = async (answerData) => {
    try {
      const fetchedQuestions = [];
      for (const answer of answerData) {
        const res = await fetch(`${linkHome}:5678/webhook/sessionQuestion?filter=${answer.question}`);
        const data = await res.json();
        fetchedQuestions.push(data[0]?.items[0]);
      }
      setSessionQuestions(fetchedQuestions);
    } catch (err) {
      console.error("Error fetching session questions:", err);
    }
  };

  useEffect(() => {
    getAllSessions();
  }, []);

  const getSessionData = async (session) => {
    await getSessionAnswers(session.id);
    await getSessionQuestions(sessionAnswers);
  };

  const getAnswerClass = (answerText, selectedAnswer, isCorrect) => {
    if (answerText === selectedAnswer && isCorrect) return "bg-green-500 text-white font-bold";
    if (answerText === selectedAnswer && !isCorrect) return "bg-red-500 text-white font-bold";
    if (answerText !== selectedAnswer && isCorrect) return "bg-green-200";
    return "bg-gray-100";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {allSessions &&
        allSessions[0]?.items?.map((session) => (
          <Dialog key={session.id} onOpenChange={(open) => open && getSessionData(session)}>
            <DialogTrigger asChild>
              <div className="bg-gray-800 text-white p-4 rounded-md shadow-md mb-4 w-full max-w-md cursor-pointer">
                <h1>Kategoria: {session.category}</h1>
                <h1>Data: {session.created}</h1>
                <h1>Wynik: {session.score}</h1>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Historia sesji</DialogTitle>
              </DialogHeader>
              <Carousel className="w-full max-w-md">
                <CarouselContent>
                  {sessionQuestions.map((question) => {
                    const answer = sessionAnswers.find((a) => a.question === question.id);
                    return (
                      <CarouselItem>
                        <div className="p-4">
                          <Card>
                            <CardContent className="p-6">
                              <h1 className="text-lg font-semibold mb-4">{question.question}</h1>
                              <div className="flex flex-col gap-2">
                                {question.answers.map((ans) => (
                                  <div
                                    className={`p-2 rounded ${getAnswerClass(ans.text, answer?.selectedAnswer, ans.correct)}`}
                                  >
                                    {ans.text}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </DialogContent>
          </Dialog>
        ))}
    </div>
  );
}
