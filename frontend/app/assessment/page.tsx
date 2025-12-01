"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";

const questions = [
  {
    id: 1,
    text: "ในวันหยุด คุณมักจะ...",
    options: [
      { label: "หาอะไรท้าทายทำ แข่งขันกีฬา", value: "D" },
      { label: "ไปปาร์ตี้ สังสรรค์กับเพื่อนฝูง", value: "I" },
      { label: "นอนดูซีรีส์อยู่บ้าน พักผ่อนเงียบๆ", value: "S" },
      { label: "จัดห้อง อ่านหนังสือ หรือวางแผนงาน", value: "C" },
    ],
  },
  {
    id: 2,
    text: "เพื่อนมักจะบอกว่าคุณเป็นคน...",
    options: [
      { label: "ตรงไปตรงมา พูดจาขวานผ่าซาก", value: "D" },
      { label: "ร่าเริง สนุกสนาน เฮฮา", value: "I" },
      { label: "ใจดี เป็นผู้ฟังที่ดี", value: "S" },
      { label: "เจ้าระเบียบ เป๊ะทุกกระเบียดนิ้ว", value: "C" },
    ],
  },
  {
    id: 3,
    text: "เวลาทำงานกลุ่ม คุณมักจะรับบทเป็น...",
    options: [
      { label: "หัวหน้า ตัดสินใจชี้ขาด", value: "D" },
      { label: "คนนำเสนอ พูดหน้าชั้น", value: "I" },
      { label: "คนหาข้อมูล ประสานงาน", value: "S" },
      { label: "คนตรวจสอบความถูกต้อง ตรวจคำผิด", value: "C" },
    ],
  },
  {
    id: 4,
    text: "สิ่งที่ทำให้คุณหงุดหงิดที่สุด...",
    options: [
      { label: "ความชักช้า ไม่ทันใจ", value: "D" },
      { label: "ความน่าเบื่อ บรรยากาศเงียบเหงา", value: "I" },
      { label: "การทะเลาะเบาะแว้ง ความขัดแย้ง", value: "S" },
      { label: "ความผิดพลาด ข้อมูลมั่ว", value: "C" },
    ],
  },
];

const fullQuestions = [...questions, ...questions].map((q, i) => ({
  ...q,
  id: i + 1, // run id ใหม่ 1-12
}));

export default function AssessmentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [answers, setAnswers] = useState<
    Record<number, { most: string | null; least: string | null }>
  >({});

  const handleSelect = (
    questionId: number,
    value: string,
    type: "most" | "least"
  ) => {
    const prevAnswer = answers[questionId] || { most: null, least: null };

    const updatedAnswer = { ...prevAnswer };

    if (type === "most" && updatedAnswer.least === value) {
      updatedAnswer.least = null;
    }
    if (type === "least" && updatedAnswer.most === value) {
      updatedAnswer.most = null;
    }

    updatedAnswer[type] = value;

    setAnswers({
      ...answers,
      [questionId]: updatedAnswer,
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("กรุณากรอกชื่อก่อนนะครับ 🥺");
      return;
    }

    const answeredCount = Object.values(answers).filter(
      (a) => a.most && a.least
    ).length;
    if (answeredCount < fullQuestions.length) {
      toast.error("ตอบให้ครบทุกข้อก่อนน้า เหลืออีกนิดเดียว");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name,
      answers: Object.entries(answers).map(([qid, val]) => ({
        question_id: Number(qid),
        most_value: val.most,
        least_value: val.least,
      })),
    };

    try {
      const res = await axios.post(
        "http://localhost:8000/submit-assessment",
        payload
      );
      toast.success("บันทึกสำเร็จ! ยินดีต้อนรับสู่ทีม");
      const newUserId = res.data.id;

      router.push(`/result/${newUserId}`);
    } catch (err) {
      console.error(err);
      toast.error("อุ๊ย ระบบมีปัญหา ลองใหม่อีกทีนะครับ");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
        แบบประเมิน 4Elements
      </h1>
      <p className="text-center text-gray-500 mb-8">
        ค้นหานิสัยประจำตัวของคุณในการทำงาน
      </p>

      {/* ส่วนกรอกชื่อ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 text-slate-900">
        <label className="block font-semibold mb-2">
          ชื่อของคุณ (หรือชื่อเล่น)
        </label>
        <input
          type="text"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
          placeholder="เช่น สมชาย ใจดี"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        {fullQuestions.map((q, index) => {
          const ans = answers[q.id] || { most: null, least: null };

          return (
            <div
              key={q.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
            >
              <h3 className="font-semibold text-lg mb-4 text-slate-800">
                <span className="text-blue-600 mr-2">ข้อ {index + 1}.</span>
                {q.text}
              </h3>

              {/* Header ตาราง */}
              <div className="grid grid-cols-12 gap-2 text-sm text-gray-400 mb-2 px-2">
                <div className="col-span-8">เลือกทั้งมากสุดและน้อยสุด</div>
                <div className="col-span-2 text-center text-green-600 font-bold">
                  มากสุด
                </div>
                <div className="col-span-2 text-center text-red-500 font-bold">
                  น้อยสุด
                </div>
              </div>

              {/* ตัวเลือก */}
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <div
                    key={opt.value}
                    className="grid grid-cols-12 gap-2 items-center p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100"
                  >
                    {/* Text ตัวเลือก */}
                    <div className="col-span-8 text-slate-700">{opt.label}</div>

                    {/* ปุ่ม Most (M) */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => handleSelect(q.id, opt.value, "most")}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                          ${
                            ans.most === opt.value
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-200 text-gray-300 hover:border-green-300"
                          }
                        `}
                      >
                        <Check size={20} />
                      </button>
                    </div>

                    {/* ปุ่ม Least (L) */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => handleSelect(q.id, opt.value, "least")}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                          ${
                            ans.least === opt.value
                              ? "bg-red-500 border-red-500 text-white"
                              : "border-gray-200 text-gray-300 hover:border-red-300"
                          }
                        `}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ปุ่มส่ง */}
      <div className="mt-10 bottom-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition disabled:opacity-50"
        >
          {isSubmitting ? "กำลังคำนวณธาตุ... 🔮" : "ส่งผลประเมิน"}
        </button>
      </div>
    </div>
  );
}
