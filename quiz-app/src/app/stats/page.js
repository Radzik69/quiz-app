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
  const currentLink = "http://172.16.15.163";

  const [answersCorrectData, setAnswersCorrectData] = useState([]);
  const [sessionsScoreData, setSessionsScoreData] = useState([]);
  const [averageScore, setAverageScore] = useState();

  useEffect(() => {
    const getAllAnswers = async () => {
      try {
        const res = await fetch(
          `${currentLink}:5678/webhook/allAnswers?filter=${userLogged[0].record.id}`
        );
        const result = await res.json();

        const answers = result.items;

        const correctCount = answers.filter((answer) => answer.isTrueAnswer === "true").length;
        const incorrectCount = answers.filter((answer) => answer.isTrueAnswer === "false").length;

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
        const res = await fetch(`${currentLink}:5678/webhook/allSessionsUser?filter=${userLogged[0].record.id}`);
        const data = await res.json();
        let totalScore = 0;
        let countedSessions = 0;
        const sessionChartData = [];

        data.items.forEach((session) => {
          const score = parseInt(session.score);
          if (!isNaN(score)) {
            totalScore += score;
            countedSessions += 1;

            const existing = sessionChartData.find((item) => item.name === session.category);
            if (existing) {
              existing.ilosc += score;
            } else {
              sessionChartData.push({ name: session.category, ilosc: score });
            }
          }
        });

        const averageScore = totalScore / countedSessions;
        setAverageScore(averageScore.toFixed(2));
        setSessionsScoreData(sessionChartData);
      } catch (err) {
        console.error("Error fetching session answers:", err);
      }
    };

    getAllAnswers();
    getAllSessions();
  }, [userLogged]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6 flex flex-col items-center gap-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 transition-transform hover:scale-[1.01]">
        <h2 className="text-2xl font-bold text-center mb-4 text-purple-700">Statystyki odpowiedzi</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={answersCorrectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ilosc" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xl font-medium text-gray-800 bg-white px-6 py-3 rounded-full shadow-lg">
        Średni wynik z sesji: <span className="font-bold text-indigo-600">{averageScore}</span>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 transition-transform hover:scale-[1.01]">
        <h2 className="text-2xl font-bold text-center mb-4 text-purple-700">Wyniki wg kategorii</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sessionsScoreData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ilosc" fill="#ec4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
