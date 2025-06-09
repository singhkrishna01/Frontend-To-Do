import React, { useState } from 'react';
import { Loader2, X, Edit2, Save, XCircle, Tag, Users, Clock, FileText, ChevronDown } from 'lucide-react';

const TodoDetails = ({ todo, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTodo, setEditedTodo] = useState({
    title: todo?.title || '',
    description: todo?.description || '',
    priority: todo?.priority || 'low',
    tags: todo?.tags || [],
    mentions: todo?.mentions?.map(m => m.username) || []
  });
  const [tagInput, setTagInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTodo({
      title: todo?.title || '',
      description: todo?.description || '',
      priority: todo?.priority || 'low',
      tags: todo?.tags || [],
      mentions: todo?.mentions?.map(m => m.username) || []
    });
  };

const handleSave = async () => {
  setLoading(true);
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show success animation
    setShowSuccess(true);
    setIsEditing(false);
    
    // Simulate closing after delay
    setTimeout(() => {
      setShowSuccess(false);
      if (onClose) {
        onClose();
      }
    }, 1500);
  } catch (error) {
    console.error('Error updating todo:', error);
    // Optionally handle error state here
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTodo(prev => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!editedTodo.tags.includes(tagInput.trim())) {
        setEditedTodo(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setEditedTodo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'low': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🌱';
      default: return '📋';
    }
  };

  // Mock data for demonstration
  const mockTodo = {
    title: "Complete React Todo App",
    description: "Build a fully functional todo application with React, including user authentication, real-time updates, and responsive design.",
    priority: "high",
    tags: ["React", "JavaScript", "Frontend", "UI/UX"],
    mentions: [
      { _id: "1", name: "John Doe", username: "johndoe" },
      { _id: "2", name: "Jane Smith", username: "janesmith" },
      { _id: "3", name: "Mike Johnson", username: "mikej" }
    ],
    createdAt: new Date().toISOString(),
    notes: [
      {
        _id: "1",
        content: "Started working on the component structure. Need to focus on responsive design.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: { name: "John Doe" }
      },
      {
        _id: "2",
        content: "Added user mention functionality. Testing the UI components.",
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        createdBy: { name: "Jane Smith" }
      }
    ]
  };

  const displayTodo = todo || mockTodo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl animate-bounce max-w-sm mx-4">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Todo Updated!</h3>
            <p className="text-gray-600 text-sm">Changes saved successfully</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    name="title"
                    value={editedTodo.title}
                    onChange={handleInputChange}
                    className="w-full text-xl sm:text-2xl font-bold bg-white/10 text-white placeholder-white/70 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Enter todo title..."
                  />
                ) : (
                  <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                    {displayTodo.title}
                  </h1>
                )}
                <div className="flex items-center gap-2 text-white/80 mt-2">
                  <Clock size={14} />
                  <span className="text-xs sm:text-sm">
                    Created {new Date(displayTodo.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 items-center">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50 text-sm"
                    >
                      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />}
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 text-sm"
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => onClose?.()}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                    >
                      <X size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Priority and Description Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-800">Priority</h3>
                </div>
                {isEditing ? (
                  <select
                    name="priority"
                    value={editedTodo.priority}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 p-3 text-sm"
                  >
                    <option value="low">🌱 Low Priority</option>
                    <option value="medium">⚡ Medium Priority</option>
                    <option value="high">🔥 High Priority</option>
                  </select>
                ) : (
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getPriorityColor(displayTodo.priority)}`}>
                    <span>{getPriorityIcon(displayTodo.priority)}</span>
                    {displayTodo.priority.charAt(0).toUpperCase() + displayTodo.priority.slice(1)}
                  </div>
                )}
              </div>

              {/* Mentions */}
              {displayTodo.mentions?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <h3 className="text-sm font-semibold text-gray-800">Mentioned Users</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayTodo.mentions.map((mention, index) => (
                      <div
                        key={mention._id}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-medium"
                      >
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">
                          {mention.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{mention.name}</span>
                        <span className="text-white/70">@{mention.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-800">Description</h3>
              </div>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editedTodo.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 p-3 text-sm resize-none"
                  placeholder="Add a detailed description..."
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {displayTodo.description || 'No description provided.'}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-800">Tags</h3>
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {editedTodo.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-xs"
                      >
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)} 
                          className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a tag and press Enter"
                    className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-sm"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {displayTodo.tags?.length > 0 ? displayTodo.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  )) : (
                    <p className="text-gray-500 italic text-sm">No tags added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Notes Section */}
            {displayTodo.notes?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-800">Notes & Comments</h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {displayTodo.notes.map((note) => (
                    <div 
                      key={note._id} 
                      className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-100"
                    >
                      <p className="text-gray-800 text-sm leading-relaxed mb-2">{note.content}</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          By {note.createdBy.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TodoDetails;