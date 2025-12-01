"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import UserCard from "@/components/UserCard";

interface User {
  id: number;
  name: string;
  animal: string;
  dominant_type: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        alert("เชื่อมต่อ Backend ไม่ได้!");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  return (
    <div className="h-full w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 ">4Elements Team</h1>
          <p className="text-slate-500">สมาชิกทั้งหมด {users.length} คน</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10 text-zinc-900 text-3xl">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              name={user.name}
              animal={user.animal}
              type={user.dominant_type}
            />
          ))}
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="text-center text-gray-400 mt-10">
          ยังไม่มีสมาชิกในทีม
        </div>
      )}
    </div>
  );
}
