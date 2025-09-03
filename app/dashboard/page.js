'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/auth/signin'); // Not logged in
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

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
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            My Dashboard
          </h2>
          <p className="text-gray-600">
            Welcome to your learning dashboard. Here you can track your progress and manage your courses.
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              📚 My Courses
            </h3>
            <p className="text-gray-600 mb-4">
              View and manage your enrolled courses
            </p>
            <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
              Coming in Day 3: Course dashboard with enrollment system
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-green-600 mb-4">
              📊 Progress Tracking
            </h3>
            <p className="text-gray-600 mb-4">
              Monitor your learning progress
            </p>
            <div className="text-sm text-gray-500 bg-green-50 p-3 rounded-md">
              Coming in Day 3: Progress bars and completion tracking
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-purple-600 mb-4">
              🎯 Achievements
            </h3>
            <p className="text-gray-600 mb-4">
              View your learning milestones
            </p>
            <div className="text-sm text-gray-500 bg-purple-50 p-3 rounded-md">
              Coming in Day 6: Analytics and achievements system
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">🎯 Development Status</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">✅ Day 1 & 2 Complete:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ✅ User authentication system</li>
                <li>• ✅ Database models created</li>
                <li>• ✅ API routes functional</li>
                <li>• ✅ Dashboard structure ready</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🔄 Next (Day 3):</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 🔄 Course enrollment system</li>
                <li>• 🔄 Progress visualization</li>
                <li>• 🔄 Course detail pages</li>
                <li>• 🔄 Resource management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Developer Tools Section */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🔧 Developer Tools</h3>
          <p className="text-gray-600 mb-4">
            Tools for testing and development (will be hidden in production)
          </p>
          <Link 
            href="/test-api"
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            🧪 Test API Endpoints
          </Link>
        </div>
      </div>
    </div>
  );
}