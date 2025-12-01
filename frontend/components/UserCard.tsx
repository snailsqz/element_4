import { User, Flame, Droplets, Wind, Mountain } from "lucide-react";

// รับค่า (Props) ที่ส่งเข้ามา
interface UserCardProps {
  name: string;
  animal: string; // สัตว์ (เดิม)
  type: string; // D, I, S, C
}

export default function UserCard({ name, animal, type }: UserCardProps) {
  const getTheme = (type: string) => {
    switch (type) {
      case "D":
        return {
          color: "bg-red-100 text-red-700 border-red-200",
          icon: <Flame />,
          element: "Fire (ไฟ)",
        };
      case "I":
        return {
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: <Wind />,
          element: "Wind (ลม)",
        };
      case "S":
        return {
          color: "bg-green-100 text-green-700 border-green-200",
          icon: <Mountain />,
          element: "Earth (ดิน)",
        };
      case "C":
        return {
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <Droplets />,
          element: "Water (น้ำ)",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <User />,
          element: "Unknown",
        };
    }
  };

  const theme = getTheme(type);

  return (
    <div
      className={`p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between ${theme.color}`}
    >
      <div>
        <h3 className="font-bold text-lg">{name}</h3>
        <p className="text-sm opacity-80">
          {animal} • {theme.element}
        </p>
      </div>
      <div className="p-2 bg-white rounded-full bg-opacity-50">
        {theme.icon}
      </div>
    </div>
  );
}
