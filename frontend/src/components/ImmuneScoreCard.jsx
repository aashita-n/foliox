import React, { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/react";
// import CardTitle from "./CardTitle"; // your existing CardTitle component
import { getImmunityAnalysis } from "../services/api"; // make sure this points to your API functions
function CardTitle({ children, align = "center" }) {
  return (
      <p
          className={`text-xl font-semibold tracking-widest uppercase text-slate-800 ${
              align === "left" ? "text-left" : "text-center"
          }`}
      >
        {children}
      </p>
  );
}

const ImmuneScoreCard = () => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImmunity = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getImmunityAnalysis();
        setScore(data?.immune_strength);
      } catch (err) {
        console.error("Failed to fetch immunity data:", err);
        setError("Failed to load immunity score");
      } finally {
        setLoading(false);
      }
    };

    fetchImmunity();
  }, []);

  return (
    <Card className="rounded-2xl shadow-lg bg-lime-100">
      <CardBody className="p-7">
        <CardTitle>Immune Score</CardTitle>
        <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
        {loading ? (
          <p className="mt-6 text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="mt-6 text-center text-red-600">{error}</p>
        ) : (
          <p className="mt-6 text-3xl font-extrabold text-center">
            {score != null ? Math.round(score * 100) : "0"} / 100
          </p>
        )}
      </CardBody>
    </Card>
  );
};

export default ImmuneScoreCard;
