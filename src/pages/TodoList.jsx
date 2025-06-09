import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { todoService } from "../services/api";
import { authService } from "../services/api";
import { userService } from "../services/api";
import TodoForm from "../components/TodoForm";
import TodoDetails from "../components/TodoDetails";
import TodoStats from "../components/TodoStats";

const TodoList = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    priority: "",
    tag: "",
    mention: "",
    completed: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showHistory, setShowHistory] = useState(false);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters,
      };
      const response = await todoService.getTodos(params);
      setTodos(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError("Error fetching todos");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, filters]);

  const fetchStats = async () => {
    try {
      const response = await todoService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchCompletedTodos = async () => {
    try {
      setHistoryLoading(true);
      const response = await todoService.getTodos({
        completed: "true",
        page: 1,
        limit: 10,
        sortBy: "completedAt",
        sortOrder: "desc",
      });
      setCompletedTodos(response.data);
    } catch (error) {
      console.error("Error fetching completed todos:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [fetchTodos]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getUsers();
        setUsers(response.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showHistory) {
      fetchCompletedTodos();
    }
  }, [showHistory]);

  const handleCreateTodo = async (todoData) => {
    try {
      await todoService.createTodo(todoData);
      fetchTodos();
      fetchStats();
    } catch (error) {
      setError("Error creating todo");
      console.error("Error:", error);
    }
  };

  const handleUpdateTodo = async (id, todoData) => {
    try {
      const response = await todoService.updateTodo(id, todoData);
      fetchTodos();
      fetchStats();
      if (showHistory) {
        fetchCompletedTodos();
      }
      if (selectedTodo?._id === id) {
        setSelectedTodo(null);
      }
    } catch (error) {
      setError("Error updating todo");
      console.error("Error:", error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      fetchTodos();
      fetchStats();
      if (selectedTodo?._id === id) {
        setSelectedTodo(null);
      }
    } catch (error) {
      setError("Error deleting todo");
      console.error("Error:", error);
    }
  };

  // Debounced filter change handler
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));

    // Reset pagination when filters change
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        filters.search !== "" ||
        filters.tag !== "" ||
        filters.mention !== ""
      ) {
        setFilterLoading(true);
        fetchTodos().finally(() => setFilterLoading(false));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.search, filters.tag, filters.mention, fetchTodos]);

  const handleSortChange = (e) => {
    const { value } = e.target;
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      case "medium":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "low":
        return "bg-gradient-to-r from-green-400 to-blue-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
    }
  };

  useEffect(() => {
  if (selectedTodo) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }

  // Clean up when component unmounts or modal closes
  return () => {
    document.body.style.overflow = 'auto';
  };
}, [selectedTodo]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Memoized user options for performance
  const userOptions = useMemo(
    () => users.map((user) => ({ value: user.username, label: user.name })),
    [users]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0 mb-12 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Todo Workspace
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg">
              Organize your tasks with style
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto group relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Todo
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Todos List */}
          <div className="xl:col-span-3 bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            {/* Enhanced Filters */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filters & Search
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  className="rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white"
                  disabled={filterLoading}
                >
                  <option value="">All Priorities</option>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>

                <input
                  type="text"
                  value={filters.tag}
                  onChange={(e) => handleFilterChange("tag", e.target.value)}
                  placeholder="🏷️ Filter by tag..."
                  className="rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  disabled={filterLoading}
                />

                <select
                  value={filters.mention}
                  onChange={(e) =>
                    handleFilterChange("mention", e.target.value)
                  }
                  className="rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white"
                  disabled={filterLoading}
                >
                  <option value="">👥 All Users</option>
                  {userOptions.map((user) => (
                    <option key={user.value} value={user.value}>
                      @{user.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.completed}
                  onChange={(e) =>
                    handleFilterChange("completed", e.target.value)
                  }
                  className="rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white"
                  disabled={filterLoading}
                >
                  <option value="">📋 All Status</option>
                  <option value="true">✓ Completed</option>
                  <option value="false">⏳ Pending</option>
                </select>

                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-2">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="🔍 Search todos..."
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                    disabled={filterLoading}
                  />
                </div>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  className="rounded-xl border-2 border-gray-200 px-4 py-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white"
                  disabled={filterLoading}
                >
                  <option value="createdAt-desc">🕐 Newest First</option>
                  <option value="createdAt-asc">🕐 Oldest First</option>
                </select>
              </div>
            </div>

            {/* Status Messages */}
            {filterLoading && (
              <div className="text-center py-4 text-indigo-600 font-medium bg-indigo-50 rounded-xl mb-6 px-4 sm:px-0">
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Applying filters...
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 px-4 sm:px-0">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  <p className="text-gray-500 text-lg font-medium">
                    Loading your todos...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-red-50 rounded-xl px-4 sm:px-0">
                <p className="text-red-600 text-lg font-medium">{error}</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl px-4 sm:px-0">
                <div className="flex flex-col items-center gap-4">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">
                    No todos found
                  </p>
                  <p className="text-gray-400">
                    Create your first todo to get started!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 px-4 sm:px-0">
                {todos.map((todo) => (
                  <div
                    key={todo._id}
                    className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-1"
                    onClick={() => setSelectedTodo(todo)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-1 h-16 rounded-full ${getPriorityColor(
                              todo.priority
                            )} shadow-sm`}
                          ></div>
                          <div className="flex-grow">
                            <h3
                              className={`text-lg sm:text-xl font-bold ${
                                todo.completed
                                  ? "line-through text-gray-400"
                                  : "text-gray-900"
                              } group-hover:text-indigo-600 transition-colors duration-200`}
                            >
                              {todo.title}
                            </h3>
                            <p
                              className={`mt-2 text-sm sm:text-base text-gray-600 leading-relaxed ${
                                todo.completed ? "italic" : ""
                              }`}
                            >
                              {todo.description}
                            </p>
                          </div>
                        </div>

                        {todo.tags?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2 break-words">
                            {todo.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold shadow-sm"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {todo.mentions?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 break-words">
                            {todo.mentions.map((mention) => (
                              <span
                                key={mention._id}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-semibold shadow-sm"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                @{mention.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {todo.notes?.length > 0 && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {todo.notes.length} note
                              {todo.notes.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}

                        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-400 font-mono gap-2">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {new Date(todo.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                              todo.priority
                            )}`}
                          >
                            {todo.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 items-end ml-0 sm:ml-4 w-full sm:w-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTodo(todo._id, {
                              ...todo,
                              completed: !todo.completed,
                            });
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-md w-full sm:w-auto ${
                            todo.completed
                              ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600"
                              : "bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600"
                          }`}
                        >
                          {todo.completed ? "↺ Reopen" : "✓ Complete"}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this todo?"
                              )
                            ) {
                              handleDeleteTodo(todo._id);
                            }
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                          aria-label="Delete Todo"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 disabled:opacity-50 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200 shadow-sm"
                >
                  ← Previous
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map(
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: pageNum,
                            }))
                          }
                          className={`px-3 py-2 rounded-xl transition-all duration-200 ${
                            pagination.page === pageNum
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 disabled:opacity-50 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200 shadow-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Statistics
            </h3>
            {stats ? (
              <TodoStats stats={stats} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p>No stats available</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced History Section */}
        <div className="mt-8 md:mt-12 px-4 sm:px-6 lg:px-0">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent flex items-center gap-2">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="break-words">Completed History</span>
              </h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="group flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-sm sm:text-base w-full sm:w-auto"
              >
                <span className="whitespace-nowrap">
                  {showHistory ? "Hide History" : "Show History"}
                </span>
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform duration-300 flex-shrink-0 ${
                    showHistory ? "rotate-180" : ""
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {showHistory && (
              <div className="transition-all duration-500 ease-in-out">
                {historyLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-gray-500 border-t-transparent rounded-full"></div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        Loading completed todos...
                      </p>
                    </div>
                  </div>
                ) : completedTodos.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="flex flex-col items-center gap-4">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-500 text-base sm:text-lg font-medium">
                        No completed todos yet
                      </p>
                      <p className="text-gray-400 text-sm sm:text-base px-4">
                        Complete some todos to see them here!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {completedTodos.map((todo) => (
                      <div
                        key={todo._id}
                        className="group bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
                      >
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-grow min-w-0">
                            <div className="flex items-start gap-3">
                              <div className="w-1 h-8 sm:h-12 rounded-full bg-gradient-to-b from-green-400 to-emerald-500 shadow-sm flex-shrink-0"></div>
                              <div className="flex-grow min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold line-through text-gray-500 flex items-start gap-2 break-words">
                                  <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>{todo.title}</span>
                                </h3>
                                <p className="mt-2 text-gray-500 italic leading-relaxed text-sm sm:text-base break-words">
                                  {todo.description}
                                </p>
                              </div>
                            </div>

                            {/* Tags */}
                            {todo.tags && todo.tags.length > 0 && (
                              <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 ml-4">
                                {todo.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-semibold opacity-75 break-all"
                                  >
                                    <svg
                                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100 2 1 1 0 000-2z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="truncate max-w-[100px] sm:max-w-none">
                                      {tag}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Mentions */}
                            {todo.mentions && todo.mentions.length > 0 && (
                              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2 ml-4">
                                {todo.mentions.map((mention) => (
                                  <span
                                    key={mention._id}
                                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs font-semibold opacity-75 break-all"
                                  >
                                    <svg
                                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="truncate max-w-[100px] sm:max-w-none">
                                      @{mention.name}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-3 sm:mt-4 ml-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-400 font-mono">
                              <span className="flex items-center gap-1 break-all">
                                <svg
                                  className="w-3 h-3 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="whitespace-nowrap">
                                  Completed:
                                </span>
                                <span>
                                  {new Date(
                                    todo.updatedAt
                                  ).toLocaleDateString()}
                                </span>
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold opacity-75 whitespace-nowrap ${getPriorityColor(
                                  todo.priority
                                )}`}
                              >
                                {todo.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 items-stretch lg:items-end lg:ml-4 lg:flex-shrink-0">
                            <button
                              onClick={() =>
                                handleUpdateTodo(todo._id, {
                                  ...todo,
                                  completed: false,
                                })
                              }
                              className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-semibold hover:from-indigo-500 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-md text-xs sm:text-sm whitespace-nowrap"
                            >
                              ↺ Reopen
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Modals */}
        {selectedTodo && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="transform transition-all duration-300 scale-100">
              <TodoDetails
                todo={selectedTodo}
                onClose={() => setSelectedTodo(null)}
                onUpdate={handleUpdateTodo}
              />
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl transition-all duration-200"
                aria-label="Close Create Todo Modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <TodoForm
                onSubmit={async (todoData) => {
                  await handleCreateTodo(todoData);
                  setShowCreateModal(false);
                }}
                users={users}
              />
            </div>
          </div>
        )}
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TodoList;
