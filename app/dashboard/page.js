'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/student/dashboard');
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data:', data); // Debug log
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const ProgressBar = ({ progress, className = "" }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${progress || 0}%` }}
      ></div>
    </div>
  );

  const StatCard = ({ title, value, icon, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center">
        <div className={`text-2xl mr-4 p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl">🚀</Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Student Portal
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                Welcome, {session.user.name}!
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            My Learning Dashboard
          </h2>
          <p className="text-gray-600">
            Track your progress and continue your learning journey
          </p>
        </div>

        {/* Stats Grid */}
        {dashboardData && (
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <StatCard
              title="Enrolled Courses"
              value={dashboardData.stats?.totalCourses || 0}
              icon="📚"
              color="blue"
            />
            <StatCard
              title="Completed Courses"
              value={dashboardData.stats?.completedCourses || 0}
              icon="🏆"
              color="green"
            />
            <StatCard
              title="Average Progress"
              value={`${dashboardData.stats?.averageProgress || 0}%`}
              icon="📊"
              color="purple"
            />
          </div>
        )}

        {/* My Courses Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h3>
          
          {dashboardData && dashboardData.enrollments && dashboardData.enrollments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {dashboardData.enrollments.map((enrollment) => {
                // Safety checks
                const courseTitle = enrollment.courseId?.title || 'Course Title';
                const courseDescription = enrollment.courseId?.description || 'Course description not available';
                const modules = enrollment.courseId?.modules || [];
                const completedModules = enrollment.completedModules || [];
                const progress = enrollment.progress || 0;
                const courseId = enrollment.courseId?._id || enrollment.courseId;

                return (
                  <div
                    key={enrollment._id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Course Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                      <h4 className="text-xl font-bold mb-2">
                        {courseTitle}
                      </h4>
                      <p className="text-blue-100 text-sm">
                        {modules.length} modules
                      </p>
                    </div>

                    {/* Course Body */}
                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {courseDescription}
                      </p>

                      {/* Progress Section */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-bold text-blue-600">
                            {progress}%
                          </span>
                        </div>
                        <ProgressBar progress={progress} />
                      </div>

                      {/* Modules Progress */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          {completedModules.length} of {modules.length} modules completed
                        </p>
                        <div className="space-y-1">
                          {modules.slice(0, 3).map((module, index) => {
                            const isCompleted = completedModules.some(
                              cm => cm.moduleIndex === index
                            );
                            return (
                              <div key={index} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                                <span className={`text-xs ${
                                  isCompleted ? 'text-green-700' : 'text-gray-500'
                                }`}>
                                  {module || `Module ${index + 1}`}
                                </span>
                              </div>
                            );
                          })}
                          {modules.length > 3 && (
                            <p className="text-xs text-gray-400">
                              +{modules.length - 3} more modules
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {courseId && (
                          <>
                            <Link 
                              href={`/courses/${courseId}`}
                              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
                            >
                              Continue Learning
                            </Link>
                            <Link
                              href={`/courses/${courseId}`}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                              📄
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="px-6 pb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        enrollment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : enrollment.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {enrollment.status === 'completed' ? '✅ Completed' : 
                         enrollment.status === 'active' ? '🔄 In Progress' : '⏸️ Paused'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">No courses yet</h4>
              <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
              <button 
                onClick={fetchDashboardData}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Load Sample Courses
              </button>
            </div>
          )}
        </div>

        {/* Developer Tools Section */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🔧 Developer Tools</h3>
          <div className="flex gap-4">
            <Link 
              href="/test-api"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              🧪 Test APIs
            </Link>
            <button 
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}