'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's enrollments
      const enrollmentsRes = await fetch(`/api/enrollments?userId=${session.user.id}`);
      const enrollmentsData = enrollmentsRes.ok ? await enrollmentsRes.json() : [];
      
      // Fetch all courses
      const coursesRes = await fetch('/api/courses');
      const coursesData = coursesRes.ok ? await coursesRes.json() : [];
      
      setEnrollments(enrollmentsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateOverallProgress = () => {
    if (!enrollments || enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0);
    return Math.round(totalProgress / enrollments.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-600">Welcome back, {session.user.name || session.user.email}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/courses" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Browse Courses
              </Link>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <div className="flex items-center">
                <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2 text-sm font-medium text-gray-500">Dashboard</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{enrollments?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{calculateOverallProgress()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments?.filter(e => e.progress === 100).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/courses" 
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Browse Courses</p>
                <p className="text-sm text-gray-500">Find new courses</p>
              </div>
            </Link>

            <Link 
              href="/resources" 
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Resources</p>
                <p className="text-sm text-gray-500">Access materials</p>
              </div>
            </Link>

            <Link 
              href="/dashboard/progress" 
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">View Progress</p>
                <p className="text-sm text-gray-500">Track your learning</p>
              </div>
            </Link>

            <button 
              onClick={fetchDashboardData}
              className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Refresh Data</p>
                <p className="text-sm text-gray-500">Update progress</p>
              </div>
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
            <Link 
              href="/courses" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Courses →
            </Link>
          </div>

          {!enrollments || enrollments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course.</p>
              <Link 
                href="/courses" 
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => {
                const course = courses.find(c => c._id === enrollment.courseId);
                if (!course) return null;

                return (
                  <div key={enrollment._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200">
                    {/* Course Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="text-center text-white">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <p className="text-sm font-medium">{course.title}</p>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          enrollment.progress === 100 
                            ? 'bg-green-100 text-green-800' 
                            : enrollment.progress > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.progress === 100 ? 'Completed' : enrollment.progress > 0 ? 'In Progress' : 'Not Started'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {course.description || 'No description available.'}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span className="font-medium">Progress</span>
                          <span className="font-bold">{enrollment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(enrollment.progress)}`}
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>{course.modules?.length || 0} modules</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Updated {new Date(course.updatedAt || course.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link 
                        href={`/courses/${course._id}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors text-center block font-medium"
                      >
                        {enrollment.progress === 100 ? 'Review Course' : enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link href="/dashboard/progress" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            {enrollments && enrollments.length > 0 ? (
              enrollments.slice(0, 5).map((enrollment, index) => {
                const course = courses.find(c => c._id === enrollment.courseId);
                return (
                  <div key={enrollment._id} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        enrollment.progress === 100 ? 'bg-green-100' : enrollment.progress > 0 ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          enrollment.progress === 100 ? 'text-green-600' : enrollment.progress > 0 ? 'text-yellow-600' : 'text-blue-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                            enrollment.progress === 100 
                              ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              : enrollment.progress > 0 
                              ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                          } />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {enrollment.progress === 100 ? 'Completed' : enrollment.progress > 0 ? 'Working on' : 'Enrolled in'} 
                        <span className="ml-1 font-bold">{course?.title || 'Unknown Course'}</span>
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div 
                            className={`h-1.5 rounded-full ${getProgressColor(enrollment.progress)}`}
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {enrollment.progress}% complete
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link 
                        href={`/courses/${course?._id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-gray-500 text-sm">No recent activity</p>
                <p className="text-gray-400 text-xs mt-1">Start learning to see your progress here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}