import React, { useState, useEffect } from 'react';
import { todoService, userService } from '../services/api';

const TodoForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    mentions: []
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await userService.getUsers();
        const currentUser = userService.getCurrentUser();
        setUsers(usersResponse || []);
        setCurrentUser(currentUser);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        tags: initialData.tags || [],
        mentions: initialData.mentions?.map(m => m.username) || []
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleUserSelect = (e) => {
    const selectedUsername = e.target.value;
    if (selectedUsername && !formData.mentions.includes(selectedUsername)) {
      setFormData(prev => ({ ...prev, mentions: [...prev.mentions, selectedUsername] }));
    }
    setSelectedUser('');
  };

  const removeMention = (mentionToRemove) => {
    setFormData(prev => ({ ...prev, mentions: prev.mentions.filter(m => m !== mentionToRemove) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(formData);
      if (!initialData) {
        setFormData({ title: '', description: '', priority: 'medium', tags: [], mentions: [] });
      }
    } catch (error) {
      console.error('Error submitting todo:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => user._id !== currentUser?.id);

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg space-y-6">
      <h2 className="text-xl font-bold text-center text-indigo-600">{initialData ? 'Edit Todo' : 'Create a New Todo'}</h2>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title<span className="text-red-500">*</span></label>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Enter title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 w-full p-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description<span className="text-red-500">*</span></label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`mt-1 w-full p-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-indigo-500`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map(tag => (
            <span key={tag} className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full inline-flex items-center">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-indigo-500">×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add a tag and press Enter"
          className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Mentions</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.mentions.map(mention => (
            <span key={mention} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full inline-flex items-center">
              @{mention}
              <button type="button" onClick={() => removeMention(mention)} className="ml-2 text-green-500">×</button>
            </span>
          ))}
        </div>
        <select
          value={selectedUser}
          onChange={handleUserSelect}
          className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          disabled={loadingUsers}
        >
          <option value="">Select user to mention</option>
          {filteredUsers.map(user => (
            <option key={user._id} value={user.username}>{user.name} (@{user.username})</option>
          ))}
        </select>
        {loadingUsers && <p className="text-sm text-gray-500 mt-1">Loading users...</p>}
        {!loadingUsers && filteredUsers.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">No other users available</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Saving...' : initialData ? 'Update Todo' : 'Create Todo'}
      </button>
    </form>
  );
};

export default TodoForm;
