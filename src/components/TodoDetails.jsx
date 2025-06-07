import React, { useState } from 'react';
import { todoService } from '../services/api';
import { Loader2, X, Edit2, Save, XCircle } from 'lucide-react';

const TodoDetails = ({ todo, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTodo, setEditedTodo] = useState({
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    tags: todo.tags || [],
    mentions: todo.mentions?.map(m => m.username) || []
  });
  const [tagInput, setTagInput] = useState('');

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setEditedTodo({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      tags: todo.tags || [],
      mentions: todo.mentions?.map(m => m.username) || []
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await todoService.updateTodo(todo._id, editedTodo);
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
    setLoading(false);
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
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl mx-auto my-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b pb-4">
        {isEditing ? (
          <input
            type="text"
            name="title"
            value={editedTodo.title}
            onChange={handleInputChange}
            className="text-2xl font-semibold text-gray-900 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <h2 className="text-2xl font-semibold text-gray-900">{todo.title}</h2>
        )}
        <div className="flex gap-2 items-center self-start sm:self-auto">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />} Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                <XCircle size={16} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-indigo-700 border border-indigo-700 rounded hover:bg-indigo-50"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-600"
              >
                <X size={24} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meta Info */}
      <div className="text-sm text-gray-500">
        Created on: <span className="font-medium">{new Date(todo.createdAt).toLocaleString()}</span>
      </div>

      {/* Description */}
      <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
        <h3 className="text-gray-600 font-medium mb-2">Description</h3>
        {isEditing ? (
          <textarea
            name="description"
            value={editedTodo.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2"
          />
        ) : (
          <p className="text-gray-800">{todo.description}</p>
        )}
      </div>

      {/* Priority */}
      <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
        <h3 className="text-gray-600 font-medium mb-2">Priority</h3>
        {isEditing ? (
          <select
            name="priority"
            value={editedTodo.priority}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        ) : (
          <span className={`inline-block px-3 py-1 border text-sm font-medium rounded-full ${getPriorityColor(todo.priority)}`}>
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
        <h3 className="text-gray-600 font-medium mb-2">Tags</h3>
        {isEditing ? (
          <>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedTodo.tags.map(tag => (
                <span key={tag} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-600">×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag and press Enter"
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {todo.tags?.map(tag => (
              <span key={tag} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mentions */}
      {todo.mentions?.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h3 className="text-gray-600 font-medium mb-2">Mentions</h3>
          <div className="flex flex-wrap gap-2">
            {todo.mentions.map(m => (
              <span key={m._id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                @{m.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {todo.notes?.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h3 className="text-gray-600 font-medium mb-2">Notes</h3>
          <div className="space-y-4">
            {todo.notes.map(note => (
              <div key={note._id} className="bg-white p-4 rounded-lg border">
                <p className="text-gray-800">{note.content}</p>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                  <span>By {note.createdBy.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoDetails;
