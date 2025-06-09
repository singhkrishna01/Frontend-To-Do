import React from "react";
import {
  CheckCircle,
  ClipboardList,
  Clock,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  BarChart3,
  TrendingUp,
} from "lucide-react";

const TodoStats = ({ stats = {
  totalTodos: 9,
  completedTodos: 3,
  pendingTodos: 6,
  highPriority: 5,
  mediumPriority: 4,
  lowPriority: 0
} }) => {
  const completionRate = stats.totalTodos > 0 ? Math.round((stats.completedTodos / stats.totalTodos) * 100) : 0;

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
    
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Todo Statistics</h2>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-800">{stats.totalTodos}</div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-lg font-bold text-green-800">{stats.completedTodos}</div>
            <div className="text-xs text-green-600">Done</div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-amber-800">{stats.pendingTodos}</div>
            <div className="text-xs text-amber-600">Pending</div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Priority Breakdown</h3>
          
          <div className="flex items-center justify-between bg-red-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">High</span>
            </div>
            <span className="text-lg font-bold text-red-800">{stats.highPriority}</span>
          </div>
          
          <div className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Medium</span>
            </div>
            <span className="text-lg font-bold text-orange-800">{stats.mediumPriority}</span>
          </div>
          
          <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Low</span>
            </div>
            <span className="text-lg font-bold text-emerald-800">{stats.lowPriority}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-800">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoStats;