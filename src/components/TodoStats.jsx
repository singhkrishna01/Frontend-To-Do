import React from "react";
import {
  CheckCircle,
  ClipboardList,
  Clock,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  BarChart3,
} from "lucide-react";

const TodoStats = ({ stats }) => {
  const statItems = [
    {
      name: "Total Todos",
      value: stats.totalTodos,
      color: "bg-blue-100",
      textColor: "text-blue-600",
      icon: ClipboardList,
    },
    {
      name: "Completed",
      value: stats.completedTodos,
      color: "bg-green-100",
      textColor: "text-green-600",
      icon: CheckCircle,
    },
    {
      name: "Pending",
      value: stats.pendingTodos,
      color: "bg-yellow-100",
      textColor: "text-yellow-600",
      icon: Clock,
    },
    {
      name: "High Priority",
      value: stats.highPriority,
      color: "bg-red-100",
      textColor: "text-red-600",
      icon: ArrowUp,
    },
    {
      name: "Medium Priority",
      value: stats.mediumPriority,
      color: "bg-yellow-200",
      textColor: "text-yellow-700",
      icon: ArrowRight,
    },
    {
      name: "Low Priority",
      value: stats.lowPriority,
      color: "bg-green-200",
      textColor: "text-green-700",
      icon: ArrowDown,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-indigo-500" />
        Todo Statistics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-4 flex items-center justify-between shadow-sm"
            >
              <div>
                <p className="text-sm text-gray-500 font-medium">{item.name}</p>
                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-full ${item.color} ${item.textColor} flex items-center justify-center`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodoStats;
