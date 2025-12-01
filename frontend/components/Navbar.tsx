import Link from "next/link";
import { Users, ClipboardList, BrainCircuit } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold flex items-center gap-2 text-green-400 hover:text-green-300 transition"
        >
          <Users size={28} />
          <span>ZooLogic</span>
        </Link>

        <div className="flex gap-6">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-green-400 transition"
          >
            <Users size={18} />
            <span>ทีมของฉัน</span>
          </Link>

          <Link
            href="/assessment"
            className="flex items-center gap-1 hover:text-green-400 transition"
          >
            <ClipboardList size={18} />
            <span>ทำแบบประเมิน</span>
          </Link>

          <Link
            href="/analysis"
            className="flex items-center gap-1 hover:text-green-400 transition"
          >
            <BrainCircuit size={18} />
            <span>AI วิเคราะห์</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
