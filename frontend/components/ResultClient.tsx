"use client";
import { useRouter } from "next/navigation";
import {
  Flame,
  Wind,
  Mountain,
  Droplets,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import DiscGraph from "@/components/DiscGraph";

// --- Interfaces (ก๊อปมาเหมือนเดิม) ---
interface Scores {
  D: number;
  I: number;
  S: number;
  C: number;
}
interface User {
  id: number;
  name: string;
  dominant_type: string;
  animal: string;
  scores: Scores;
}
interface Analysis {
  title: string;
  element_desc: string;
  personality: string;
  weakness: string;
  work_style: string;
  compatible_with: string;
}
interface ResultData {
  user: User;
  analysis: Analysis;
}

// --- Helper Functions ---
const getThemeColor = (type: string) => {
  switch (type) {
    case "D":
      return "bg-red-50 text-red-900 border-red-200";
    case "I":
      return "bg-yellow-50 text-yellow-900 border-yellow-200";
    case "S":
      return "bg-green-50 text-green-900 border-green-200";
    case "C":
      return "bg-blue-50 text-blue-900 border-blue-200";
    default:
      return "bg-slate-50";
  }
};

const getElementIcon = (type: string) => {
  switch (type) {
    case "D":
      return <Flame size={48} className="text-red-500" />;
    case "I":
      return <Wind size={48} className="text-yellow-500" />;
    case "S":
      return <Mountain size={48} className="text-green-500" />;
    case "C":
      return <Droplets size={48} className="text-blue-500" />;
    default:
      return null;
  }
};

const renderBulletList = (
  text: string | string[] | null | undefined,
  type: "normal" | "warning" = "normal"
) => {
  if (!text) return null;
  let lines: string[] = [];
  if (Array.isArray(text)) lines = text;
  else if (typeof text === "string") lines = text.split("\n");
  else return null;

  lines = lines.filter((line) => line.trim() !== "");

  return (
    <ul className="space-y-3 mt-3">
      {lines.map((line, index) => {
        const cleanText = line.replace(/^[-•*]\s*/, "").trim();
        const isWarning = type === "warning";
        const itemStyle = isWarning
          ? "bg-red-50 border-red-100 text-red-800 hover:bg-red-100"
          : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-blue-50 hover:border-blue-200";
        const Icon = isWarning ? AlertCircle : CheckCircle2;
        const iconColor = isWarning ? "text-red-500" : "text-blue-500";

        return (
          <li
            key={index}
            className={`p-3 rounded-lg border flex items-start gap-3 transition-colors duration-200 ${itemStyle}`}
          >
            <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} />
            <span className="leading-relaxed text-sm font-medium">
              {cleanText}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

// --- Component หลัก ---
export default function ResultClient({ data }: { data: ResultData }) {
  const router = useRouter();
  const { user, analysis } = data;
  const theme = getThemeColor(user.dominant_type);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-slate-500 mb-6 hover:text-slate-900 transition-colors duration-300"
        >
          <ArrowLeft size={20} className="mr-2" /> กลับหน้าหลัก
        </button>

        {/* Header Card */}
        <div
          className={`relative p-8 rounded-2xl shadow-lg border-2 mb-6 text-center ${theme} overflow-hidden`}
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-4 bg-white rounded-full shadow-md mb-4">
              {getElementIcon(user.dominant_type)}
            </div>
            <h1 className="text-3xl font-bold mb-2">{analysis.title}</h1>

            <div className="mt-4 px-4 py-1 bg-white/50 rounded-full text-sm font-semibold inline-block">
              ธาตุหลัก: {user.animal} ({user.dominant_type})
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <DiscGraph scores={user.scores} />
          <div className="mt-4 p-4 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-sm flex gap-3 items-start">
            <span className="text-xl mt-0.5">💡</span>
            <div className="leading-relaxed">
              <strong className="block mb-1 text-blue-700">
                ทำไมจุดของฉันถึงอยู่ตรงกลาง?
              </strong>
              หากตำแหน่งจุดในกราฟดูไม่ตรงกับธาตุหลัก (เช่น
              ได้อินทรีแต่จุดอยู่ตรงกลาง)
              เกิดจากคะแนนธาตุคู่ตรงข้ามของคุณมีค่าสูงพอๆ กัน เช่น สูงทั้ง D และ
              S ทำให้แรงดึงดูดหักล้างกันเองจนจุดเคลื่อนเข้าสู่ศูนย์กลาง
              ซึ่งสะท้อนว่าคุณเป็นคนที่มี <b>ความยืดหยุ่นสูง (Well-Rounded)</b>{" "}
              และสามารถปรับเปลี่ยนสไตล์ได้ตามสถานการณ์ครับ
            </div>
          </div>
        </div>

        {/* Content Grid (Layout ใหม่ที่คุณชอบ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* ซ้าย */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                ✨ ตัวตนของคุณ
              </h3>
              <div className="text-slate-600 leading-relaxed text-sm">
                {renderBulletList(analysis.element_desc)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                🍾 จุดเด่นที่เฉิดฉาย
              </h3>
              <div className="text-slate-600 text-sm">
                {renderBulletList(analysis.personality)}
              </div>
            </div>
          </div>

          {/* ขวา */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                💼 สไตล์การทำงาน
              </h3>
              <div className="text-slate-600 leading-relaxed text-sm">
                {renderBulletList(analysis.work_style)}
              </div>
            </div>
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 relative overflow-hidden">
              <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2 relative z-10">
                ⚠️ ด้านมืดที่ต้องระวัง
              </h3>
              <div className="relative z-10 text-red-800/80 text-sm">
                {renderBulletList(analysis.weakness, "warning")}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Card */}
        <div className="mt-6 bg-linear-to-br from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-100 flex items-center gap-6 shadow-sm">
          <div className="bg-white p-4 rounded-full shadow-sm text-3xl shrink-0 border border-pink-100">
            ❤️
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-pink-700 mb-2">
              คู่หูที่แนะนำ
            </h3>
            <div className="text-slate-700 text-sm">
              {renderBulletList(analysis.compatible_with)}
            </div>
          </div>
        </div>

        {/* Stat Bars */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            📊 ระดับพลังธาตุ
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "🔥 Fire (D)",
                score: user.scores.D,
                color: "bg-red-500",
              },
              {
                label: "💨 Wind (I)",
                score: user.scores.I,
                color: "bg-yellow-500",
              },
              {
                label: "⛰️ Earth (S)",
                score: user.scores.S,
                color: "bg-green-500",
              },
              {
                label: "💧 Water (C)",
                score: user.scores.C,
                color: "bg-blue-500",
              },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-sm mb-1 text-slate-900">
                  <span>{stat.label}</span>
                  <span className="font-bold">{stat.score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${stat.color}`}
                    style={{
                      width: `${Math.min((stat.score / 30) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
