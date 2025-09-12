'use client';

import { useState, useEffect } from 'react';

export default function CourseModal({ isOpen, onClose, course, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    modules: ['']
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        modules: course.modules || ['']
      });
    } else {
      setFormData({
        title: '',
        description: '',
        modules: ['']
      });
    }
  }, [course, isOpen]);

  const handleAddModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, '']
    }));
  };

  const handleRemoveModule = (index) => {
    if (formData.modules.length > 1) {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.filter((_, i) => i !== index)
      }));
    }
  };

  const handleModuleChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => i === index ? value : module)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredModules = formData.modules.filter(module => module.trim() !== '');
      
      if (filteredModules.length === 0) {
        alert('Please add at least one module');
        setLoading(false);
        return;
      }

      const method = course ? 'PUT' : 'POST';
      const body = course 
        ? { ...formData, modules: filteredModules, id: course._id }
        : { ...formData, modules: filteredModules };

      const response = await fetch('/api/courses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const savedCourse = await response.json();
        onSave(savedCourse);
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {course ? 'Edit Course' : 'Create New Course'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., JavaScript Fundamentals"
              />
            </div>

            {/* Course Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe what students will learn in this course..."
              />
            </div>

            {/* Course Modules */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Course Modules *
                </label>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  + Add Module
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.modules.map((module, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={module}
                        onChange={(e) => handleModuleChange(index, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Module ${index + 1} title`}
                      />
                    </div>
                    {formData.modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-500 border border-red-300 rounded-lg hover:border-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Add the modules/chapters that students will complete in this course
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>        
      </div>
    </div>
  );
}
