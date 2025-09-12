'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CourseModal from "@/components/CourseModal";
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Simple admin check - in real app you'd check session.user.role
    fetchAdminData();
  }, [session, status, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all courses
      const coursesRes = await fetch('/api/courses');
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }

      // Fetch all enrollments with user data
      const enrollmentsRes = await fetch('/api/enrollments');
      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setEnrollments(enrollmentsData);
        
        // Extract unique students from enrollments
        const uniqueStudents = enrollmentsData.reduce((acc, enrollment) => {
          if (enrollment.userId && !acc.find(s => s._id === enrollment.userId._id)) {
            acc.push(enrollment.userId);
          }
          return acc;
        }, []);
        setStudents(uniqueStudents);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const response = await fetch(`/api/courses?id=${courseId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCourses(courses.filter(course => course._id !== courseId));
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const StatCard = ({ title, value, icon, color = "blue", description }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-2`}>{value}</p>
          {description && <p className="text-gray-500 text-xs mt-1">{description}</p>}
        </div>
        <div className={`text-3xl p-4 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const TabButton = ({ tabId, children }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tabId
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalEnrollments = enrollments.length;
  const averageProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl">🚀</Link>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-500"
              >
                👤 Student View
              </Link>
              <span className="text-gray-700">
                {session?.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
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
            Admin Control Panel
          </h2>
          <p className="text-gray-600">
            Manage courses, students, and monitor platform activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon="👥"
            color="blue"
            description="Enrolled students"
          />
          <StatCard
            title="Total Courses"
            value={totalCourses}
            icon="📚"
            color="green"
            description="Active courses"
          />
          <StatCard
            title="Enrollments"
            value={totalEnrollments}
            icon="🎯"
            color="purple"
            description="Student enrollments"
          />
          <StatCard
            title="Avg Progress"
            value={`${averageProgress}%`}
            icon="📊"
            color="orange"
            description="Student completion"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <TabButton tabId="overview">📊 Overview</TabButton>
          <TabButton tabId="courses">📚 Manage Courses</TabButton>
          <TabButton tabId="students">👥 Student Progress</TabButton>
          <TabButton tabId="resources">📎 Resources</TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {enrollments.slice(0, 5).map((enrollment, index) => (
                  <div key={enrollment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {enrollment.userId?.name?.[0] || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {enrollment.userId?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Enrolled in {enrollment.courseId?.title || 'Unknown Course'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {enrollment.progress || 0}% complete
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Course Management Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Manage Courses</h3>
              <button
                onClick={() => setShowCourseModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ Add New Course
              </button>
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Course</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Modules</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Enrollments</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {courses.map((course) => {
                      const courseEnrollments = enrollments.filter(e => e.courseId?._id === course._id);
                      return (
                        <tr key={course._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{course.title}</p>
                              <p className="text-sm text-gray-600 truncate max-w-xs">
                                {course.description}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {course.modules?.length || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {courseEnrollments.length}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingCourse(course);
                                  setShowCourseModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteCourse(course._id)}
                                className="text-red-600 hover:text-red-500 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Student Progress</h3>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Courses</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Avg Progress</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => {
                      const studentEnrollments = enrollments.filter(e => e.userId?._id === student._id);
                      const avgProgress = studentEnrollments.length > 0
                        ? Math.round(studentEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / studentEnrollments.length)
                        : 0;
                      
                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {student.name?.[0] || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-600">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {studentEnrollments.length}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${avgProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {avgProgress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              avgProgress >= 80 ? 'bg-green-100 text-green-800' :
                              avgProgress >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {avgProgress >= 80 ? 'Excellent' : avgProgress >= 50 ? 'Good' : 'Needs Help'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resource Management</h3>
            <p className="text-gray-600 mb-4">
              Coming in Day 5 expansion: Upload and manage course resources
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                🔧 This section will include:
              </p>
              <ul className="text-blue-700 text-sm mt-2 space-y-1">
                <li>• Upload PDF documents</li>
                <li>• Add YouTube video links</li>
                <li>• Manage external resources</li>
                <li>• Organize by course and module</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Course Modal */}
      <CourseModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setEditingCourse(null);
        }}
        course={editingCourse}
        onSave={handleSaveCourse}
      />
    </div>
  );
}