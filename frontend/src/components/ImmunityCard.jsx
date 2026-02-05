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
    <Card className="rounded-xl shadow-sm border border-slate-200 bg-white hover:shadow-md transition-shadow">
      <CardBody className="p-6">
        <p className="text-xl font-semibold tracking-widest uppercase text-slate-800 text-center">
          Immunity Analysis
        </p>
        <div className="h-1 w-12 rounded-full bg-primary-500 mt-3 mx-auto" />

        {loading ? (
          <p className="mt-5 text-center text-slate-400">Loading...</p>
        ) : error ? (
          <p className="mt-5 text-center text-danger-600">{error}</p>
        ) : (
          <div className="mt-5 text-center space-y-3">
            <p className="font-medium text-slate-700">Diagnosis: <span className="font-semibold">{immunityData?.diagnosis || "-"}</span></p>
            <p className="text-slate-600">Immune Strength: <span className="font-medium">{immunityData?.immune_strength || 0}</span></p>
            <p className="text-slate-600">Systemic Risk: <span className="font-medium">{immunityData?.systemic_risk || "-"}</span></p>
            {immunityData?.weak_points?.length > 0 && (
              <div className="mt-4 text-left bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-700 mb-2">Weak Points:</p>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
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
