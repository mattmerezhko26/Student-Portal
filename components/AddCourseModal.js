'use client';

import { useState } from 'react';

export default function AddCourseModal({ isOpen, onClose, onCourseAdded }) {
  const [formData, setFormData] = useState({
    courseName: '',
    totalClasses: '',
    completedClasses: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalClasses = parseInt(formData.totalClasses);
      const completedClasses = parseInt(formData.completedClasses);

      if (completedClasses > totalClasses) {
        alert('Completed classes cannot be more than total classes');
        setLoading(false);
        return;
      }

      // Create course modules based on total classes
      const modules = [];
      for (let i = 1; i <= totalClasses; i++) {
        modules.push(`Class ${i}: ${formData.courseName} - Part ${i}`);
      }

      // Create the course
      const courseResponse = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.courseName,
          description: formData.description || `Learn ${formData.courseName} in ${totalClasses} classes`,
          modules: modules
        })
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to create course');
      }

      const newCourse = await courseResponse.json();

      // Create enrollment with progress
      const progress = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;
      
      // Get current user (simplified for now)
      const userResponse = await fetch('/api/student/dashboard');
      const userData = await userResponse.json();
      const userId = userData.student.id;

      // Create completed modules list
      const completedModules = [];
      for (let i = 0; i < completedClasses; i++) {
        completedModules.push({
          moduleIndex: i,
          completedAt: new Date(Date.now() - (completedClasses - i) * 24 * 60 * 60 * 1000) // Stagger dates
        });
      }

      // Create enrollment
      const enrollmentResponse = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          courseId: newCourse._id
        })
      });

      if (enrollmentResponse.ok) {
        const enrollment = await enrollmentResponse.json();
        
        // Update enrollment with progress and completed modules
        await fetch('/api/enrollments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId: enrollment._id,
            progress: progress,
            completedModules: completedModules
          })
        });
      }

      // Reset form and close modal
      setFormData({
        courseName: '',
        totalClasses: '',
        completedClasses: '',
        description: ''
      });

      onCourseAdded();
      onClose();

    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Add New Course
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name *
              </label>
              <input
                type="text"
                required
                value={formData.courseName}
                onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Advanced Mathematics"
              />
            </div>

            {/* Course Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the course (optional)"
              />
            </div>

            {/* Total Classes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Classes *
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={formData.totalClasses}
                onChange={(e) => setFormData(prev => ({ ...prev, totalClasses: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
            </div>

            {/* Completed Classes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classes Already Completed *
              </label>
              <input
                type="number"
                required
                min="0"
                max={formData.totalClasses || "50"}
                value={formData.completedClasses}
                onChange={(e) => setFormData(prev => ({ ...prev, completedClasses: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3"
              />
              <p className="text-sm text-gray-500 mt-1">
                How many classes have you already completed?
              </p>
            </div>

            {/* Progress Preview */}
            {formData.totalClasses && formData.completedClasses && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Progress Preview:</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.round((parseInt(formData.completedClasses) / parseInt(formData.totalClasses)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-blue-800">
                    {Math.round((parseInt(formData.completedClasses) / parseInt(formData.totalClasses)) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {formData.completedClasses} of {formData.totalClasses} classes completed
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
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
                {loading ? 'Adding Course...' : 'Add Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}