'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [courseData, setCourseData] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (courseId && session) {
      fetchCourseData();
    }
  }, [courseId, session]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      if (courseResponse.ok) {
        const course = await courseResponse.json();
        setCourseData(course);
      }

      // Fetch user's enrollment for this course
      const enrollmentResponse = await fetch(`/api/enrollments?courseId=${courseId}`);
      if (enrollmentResponse.ok) {
        const enrollments = await enrollmentResponse.json();
        const userEnrollment = enrollments.find(e => e.userId._id === session.user.id);
        setEnrollment(userEnrollment);
      }

      // Fetch course resources
      const resourcesResponse = await fetch(`/api/resources?courseId=${courseId}`);
      if (resourcesResponse.ok) {
        const courseResources = await resourcesResponse.json();
        setResources(courseResources);
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markModuleComplete = async (moduleIndex) => {
    if (!enrollment || updating) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: enrollment._id,
          moduleIndex,
          progress: Math.round(((moduleIndex + 1) / courseData.modules.length) * 100)
        })
      });

      if (response.ok) {
        const updatedEnrollment = await response.json();
        setEnrollment(updatedEnrollment);
      }
    } catch (error) {
      console.error('Error updating module completion:', error);
    } finally {
      setUpdating(false);
    }
  };

  const ProgressBar = ({ progress, className = "" }) => (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
      <div 
        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  const ResourceIcon = ({ type }) => {
    const icons = {
      video: '🎥',
      pdf: '📄',
      link: '🔗',
      document: '📝',
      image: '🖼️'
    };
    return <span className="text-2xl">{icons[type] || '📁'}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Course not found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Course Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Main Course Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Course Header */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                <h1 className="text-3xl font-bold mb-4">{courseData.title}</h1>
                <p className="text-blue-100 text-lg">{courseData.description}</p>
                
                {enrollment && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-blue-100">Your Progress</span>
                      <span className="text-white font-bold text-lg">
                        {enrollment.progress}%
                      </span>
                    </div>
                    <ProgressBar progress={enrollment.progress} />
                  </div>
                )}
              </div>
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Modules</h2>
              
              <div className="space-y-4">
                {courseData.modules.map((module, index) => {
                  const isCompleted = enrollment?.completedModules.some(
                    cm => cm.moduleIndex === index
                  );
                  const isCurrentModule = !isCompleted && 
                    (index === 0 || enrollment?.completedModules.some(cm => cm.moduleIndex === index - 1));
                  
                  return (
                    <div
                      key={index}
                      className={`p-6 border-2 rounded-xl transition-all ${
                        isCompleted 
                          ? 'border-green-200 bg-green-50' 
                          : isCurrentModule
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            isCompleted 
                              ? 'bg-green-500' 
                              : isCurrentModule
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Module {index + 1}: {module}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {isCompleted ? 'Completed' : isCurrentModule ? 'Ready to start' : 'Locked'}
                            </p>
                          </div>
                        </div>
                        
                        {enrollment && (
                          <div className="flex gap-2">
                            {isCurrentModule && !isCompleted && (
                              <button
                                onClick={() => markModuleComplete(index)}
                                disabled={updating}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                {updating ? '⏳' : 'Mark Complete'}
                              </button>
                            )}
                            
                            {isCompleted && (
                              <span className="text-green-600 font-semibold">
                                ✅ Completed
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Module Resources */}
                      <div className="mt-4">
                        <div className="flex gap-2 flex-wrap">
                          {resources
                            .filter(resource => resource.moduleIndex === index)
                            .map(resource => (
                              <a
                                key={resource._id}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                              >
                                <ResourceIcon type={resource.type} />
                                <span className="text-sm font-medium">{resource.title}</span>
                              </a>
                            ))
                          }
                          {resources.filter(resource => resource.moduleIndex === index).length === 0 && (
                            <span className="text-sm text-gray-500">No resources yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Course Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Total Modules</span>
                  <p className="font-semibold">{courseData.modules.length}</p>
                </div>
                
                {enrollment && (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Completed Modules</span>
                      <p className="font-semibold text-green-600">
                        {enrollment.completedModules.length} / {courseData.modules.length}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Status</span>
                      <p className={`font-semibold capitalize ${
                        enrollment.status === 'completed' ? 'text-green-600' :
                        enrollment.status === 'active' ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        {enrollment.status}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Enrolled</span>
                      <p className="font-semibold">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* All Resources */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Resources</h3>
              
              <div className="space-y-3">
                {resources.length > 0 ? (
                  resources.map(resource => (
                    <a
                      key={resource._id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <ResourceIcon type={resource.type} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{resource.title}</p>
                        <p className="text-sm text-gray-600">Module {resource.moduleIndex + 1}</p>
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No resources available yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}