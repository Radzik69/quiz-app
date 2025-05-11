"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { isUserLoggedIn } from "../globalVariables";
import { useEffect, useState } from "react";

export default function Stats() {
  const userLogged = isUserLoggedIn((state) => state.user);
  const linkHome = "http://192.168.88.216";

  const [answersCorrectData, setAnswersCorrectData] = useState([]);
  const [sessionsScoreData, setSessionsScoreData] = useState([]);
  const [averageScore,setAverageScore] = useState();
  useEffect(() => {
    const getAllAnswers = async () => {
      try {
        const res = await fetch(
          `${linkHome}:5678/webhook/allAnswers?filter=${userLogged[0].record.id}`
        );
        const result = await res.json();

        const answers = result[0].items;


          const correctCount = answers.filter(
            (answer) => answer.isTrueAnswer === "true"
          ).length;

          const incorrectCount = answers.filter(
            (answer) => answer.isTrueAnswer === "false"
          ).length;

          setAnswersCorrectData([
            {
              name: "Odpowiedzi poprawne",
              ilosc: correctCount,
            },
            {
              name: "Odpowiedzi niepoprawne",
              ilosc: incorrectCount,
            },
          ]);
        
      } catch (err) {
        console.error("Error fetching answers:", err);
      }
    };

    const getAllSessions = async () => {
      try {
        const res = await fetch(`${linkHome}:5678/webhook/allSessionsUser?filter=${userLogged[0].record.id}`);
        const data = await res.json();
        let totalScore = 0;
        let countedSessions = 0;
        const sessionChartData = [];
    
        data[0].items.forEach((session) => {
          const score = parseInt(session.score);
          if (!isNaN(score)) {
            totalScore += score;
            countedSessions += 1;
            sessionChartData.push({
              name: session.category,
              ilosc: score,
            });
          }
        });
    
        const averageScore = totalScore / countedSessions
        setAverageScore(averageScore);
        setSessionsScoreData(sessionChartData);
      } catch (err) {
        console.error("Error fetching session answers:", err);
      }
    };
    
    
    getAllAnswers();
    getAllSessions();
  }, [userLogged]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <ResponsiveContainer width="80%" height="70%">
        <BarChart data={answersCorrectData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="ilosc" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h1>Sredni wynik z sesji: {averageScore}</h1>

      <ResponsiveContainer width="80%" height="70%">
        <BarChart data={sessionsScoreData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="ilosc" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
