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
import FloatingDockMenu from "@/components/floatingDock";

export default function History() {
  const userLogged = isUserLoggedIn((state) => state.user);
  const [allSessions, setAllSessions] = useState(null);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [sessionQuestions, setSessionQuestions] = useState([]);

  const currentLink = "http://192.168.88.216"

  const getAllSessions = async () => {
    try {
      const res = await fetch(`${currentLink}:5678/webhook/allSessionsUser?filter=${userLogged[0].record.id}`);
      const data = await res.json();
      setAllSessions(data);
      console.log("Fetched sessions:", data);
    } catch (err) {
      console.error("Error fetching session answers:", err);
    }
  };

  const getSessionAnswers = async (sessionId) => {
    try {
      const res = await fetch(`${currentLink}:5678/webhook/sessionAnswers?filter=${sessionId}`);
      const data = await res.json();
      setSessionAnswers(data.items);
    } catch (err) {
      console.error("Error fetching session answers:", err);
    }
  };

  const getSessionQuestions = async (answerData) => {
    try {
      const fetchedQuestions = [];
      for (const answer of answerData) {
        const res = await fetch(`${currentLink}:5678/webhook/sessionQuestion?filter=${answer.question}`);
        const data = await res.json();
        fetchedQuestions.push(data.items[0]);
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
  setSessionQuestions([])
  const res = await fetch(`${currentLink}:5678/webhook/sessionAnswers?filter=${session.id}`);
  const answerData = await res.json();
  setSessionAnswers(answerData.items);
  await getSessionQuestions(answerData.items);

};


  const getAnswerClass = (answerText, selectedAnswer, isCorrect) => {
    if (answerText === selectedAnswer && isCorrect) return "bg-green-500 text-white font-bold";
    if (answerText === selectedAnswer && !isCorrect) return "bg-red-500 text-white font-bold";
    if (answerText !== selectedAnswer && isCorrect) return "bg-green-200";
    return "bg-gray-100";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <FloatingDockMenu className="w-full h-16"></FloatingDockMenu>
      {allSessions &&
        allSessions.items?.map((session) => (
          <Dialog key={session.id} onOpenChange={(open) => open}>
            <DialogTrigger asChild>
              <div className="bg-gray-800 text-white p-4 rounded-md shadow-md mb-4 w-full max-w-md cursor-pointer" onClick={() => getSessionData(session)}>
                <h1>Kategoria: {session.category}</h1>
                <h1>Data: {session.created}</h1>
                <h1>Wynik: {session.score}</h1>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle></DialogTitle>
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
