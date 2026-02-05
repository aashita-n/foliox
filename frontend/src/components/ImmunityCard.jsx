import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/react";
import { getImmunityAnalysis } from "../services/api";


export default function ImmunityCard() {
  const [immunityData, setImmunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImmunity = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getImmunityAnalysis();
        setImmunityData(data);
      } catch (err) {
        console.error("Failed to fetch immunity analysis:", err);
        setError("Failed to load immunity data");
      } finally {
        setLoading(false);
      }
    };
    fetchImmunity();
  }, []);

  return (
    <Card className="rounded-2xl shadow-lg bg-indigo-100">
      <CardBody className="p-7">
        <p className="text-xl font-semibold tracking-widest uppercase text-slate-800 text-center">
          Immunity Analysis
        </p>
        <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />

        {loading ? (
          <p className="mt-6 text-center text-zinc-500">Loading...</p>
        ) : error ? (
          <p className="mt-6 text-center text-red-600">{error}</p>
        ) : (
          <div className="mt-6 text-center space-y-3">
            <p className="font-semibold">Diagnosis: {immunityData?.diagnosis || "-"}</p>
            <p>Immune Strength: {immunityData?.immune_strength || 0}</p>
            <p>Systemic Risk: {immunityData?.systemic_risk || "-"}</p>
            {immunityData?.weak_points?.length > 0 && (
              <div>
                <p className="font-semibold mt-2">Weak Points:</p>
                <ul className="list-disc list-inside text-left">
                  {immunityData.weak_points.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
