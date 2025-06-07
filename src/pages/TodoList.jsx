import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { todoService } from '../services/api';
import { authService } from '../services/api';
import { userService } from '../services/api';
import TodoForm from '../components/TodoForm';
import TodoDetails from '../components/TodoDetails';
import TodoStats from '../components/TodoStats';

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
    priority: '',
    tag: '',
    mention: '',
    completed: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showHistory, setShowHistory] = useState(false);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters
      };
      const response = await todoService.getTodos(params);
      setTodos(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError('Error fetching todos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await todoService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCompletedTodos = async () => {
    try {
      setHistoryLoading(true);
      const response = await todoService.getTodos({
        completed: 'true',
        page: 1,
        limit: 10,
        sortBy: 'completedAt',
        sortOrder: 'desc'
      });
      setCompletedTodos(response.data);
    } catch (error) {
      console.error('Error fetching completed todos:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [pagination.page, filters, sortBy, sortOrder]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getUsers();
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
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
      setError('Error creating todo');
      console.error('Error:', error);
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
      setError('Error updating todo');
      console.error('Error:', error);
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
      setError('Error deleting todo');
      console.error('Error:', error);
    }
  };

  const handleFilterChange = async (filterType, value) => {
    try {
      setFilterLoading(true);
      setError(null);
      
      // Update filters state
      setFilters(prev => ({
        ...prev,
        [filterType]: value
      }));

      // Reset pagination when filters change
      setPagination(prev => ({
        ...prev,
        page: 1
      }));

      // Fetch todos with new filters
      const response = await todoService.getTodos({
        ...filters,
        [filterType]: value,
        page: 1,
        limit: pagination.limit
      });

      setTodos(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Error applying filters');
      console.error('Filter error:', err);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleSortChange = (e) => {
    const { value } = e.target;
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

return (
  <div className="container mx-auto px-6 py-10 max-w-7xl">
    {/* Header */}
    <div className="flex justify-between items-center mb-10">
      <h1 className="text-4xl font-extrabold text-navy-800">Todo List</h1>
      <div className="flex gap-5">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg shadow-md transition duration-300"
        >
          Create Todo
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg shadow-md transition duration-300"
        >
          Logout
        </button>
      </div>
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Todos List */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-5 mb-8">
          <select
            name="priority"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="flex-grow md:flex-grow-0 min-w-[150px] rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={filterLoading}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <input
            type="text"
            name="tag"
            value={filters.tag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            placeholder="Filter by tag"
            className="flex-grow md:flex-grow-0 min-w-[180px] rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={filterLoading}
          />

          <input
            type="text"
            value={filters.mention}
            onChange={(e) => handleFilterChange('mention', e.target.value)}
            placeholder="Filter by username"
            className="flex-grow min-w-[220px] rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={filterLoading}
          />

          <select
            name="completed"
            value={filters.completed}
            onChange={(e) => handleFilterChange('completed', e.target.value)}
            className="min-w-[140px] rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={filterLoading}
          >
            <option value="">All Status</option>
            <option value="true">Completed</option>
            <option value="false">Pending</option>
          </select>

          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search todos..."
            className="flex-grow rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={filterLoading}
          />

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            className="min-w-[180px] rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={filterLoading}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="priority-desc">Priority (High to Low)</option>
            <option value="priority-asc">Priority (Low to High)</option>
          </select>
        </div>

        {/* Status Messages */}
        {filterLoading && (
          <div className="text-center py-3 text-indigo-600 font-medium">Applying filters...</div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500 text-lg font-medium">Loading todos...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-600 text-lg font-medium">{error}</div>
        ) : (
          <div className="space-y-6">
            {todos.map(todo => (
              <div
                key={todo._id}
                className="bg-gray-50 rounded-lg p-6 shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedTodo(todo)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-grow">
                    <h3 className={`text-xl font-semibold ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {todo.title}
                    </h3>
                    <p className={`mt-2 text-gray-600 ${todo.completed ? 'italic' : ''}`}>
                      {todo.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 items-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTodo(todo._id, { ...todo, completed: !todo.completed });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        todo.completed
                          ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          : 'bg-green-200 text-green-700 hover:bg-green-300'
                      }`}
                    >
                      {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(todo.priority)} bg-opacity-20`}
                    >
                      {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this todo?')) {
                          handleDeleteTodo(todo._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 transition"
                      aria-label="Delete Todo"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {todo.tags?.map(tag => (
                    <span
                      key={tag}
                      className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Mentions */}
                {todo.mentions?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {todo.mentions.map(mention => (
                      <span
                        key={mention._id}
                        className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium"
                      >
                        @{mention.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex justify-between text-xs text-gray-400 font-mono">
                  <span>Created: {new Date(todo.createdAt).toLocaleString()}</span>
                  <span>{todo.notes?.length || 0} notes</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-4">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Previous
            </button>
            <span className="text-gray-600 font-semibold">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {stats ? <TodoStats stats={stats} /> : <p className="text-gray-500 text-center">No stats available</p>}
      </div>
    </div>

    {/* History Section */}
    <div className="mt-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-navy-800">History</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-semibold"
        >
          {showHistory ? 'Hide History' : 'Show History'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transform transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
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
        <div className="bg-white rounded-xl shadow-lg p-8">
          {historyLoading ? (
            <div className="text-center py-6 text-gray-500 font-medium">Loading history...</div>
          ) : completedTodos.length === 0 ? (
            <div className="text-center py-6 text-gray-400 font-medium italic">No completed todos yet</div>
          ) : (
            <div className="space-y-6">
              {completedTodos.map(todo => (
                <div
                  key={todo._id}
                  className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold line-through text-gray-400">
                        {todo.title}
                      </h3>
                      <p className="mt-2 text-gray-500 italic">
                        {todo.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {todo.tags?.map(tag => (
                          <span
                            key={tag}
                            className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 items-end">
                      <button
                        onClick={() => handleUpdateTodo(todo._id, { ...todo, completed: false })}
                        className="px-4 py-2 rounded-full bg-gray-200 text-gray-600 font-semibold hover:bg-gray-300 transition"
                      >
                        Mark Incomplete
                      </button>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(todo.priority)} bg-opacity-20`}
                      >
                        {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-400 font-mono">
                    Completed: {new Date(todo.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

    {/* Modals */}
    {selectedTodo && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-6 z-50">
        <TodoDetails
          todo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
          onUpdate={handleUpdateTodo}
        />
      </div>
    )}

    {showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full relative">
          <button
            onClick={() => setShowCreateModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold leading-none"
            aria-label="Close Create Todo Modal"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Todo</h2>
          <TodoForm 
            onSubmit={async (todoData) => {
              await handleCreateTodo(todoData);
              setShowCreateModal(false);
            }} 
          />
        </div>
      </div>
    )}
  </div>
);

};

export default TodoList; 