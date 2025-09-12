'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();

  // If user is logged in, show a different view
  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header with Sign Out */}
          <div className="flex justify-between items-center mb-8">
            <div></div> {/* Empty div for spacing */}
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              🚪 Sign Out
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🚀 Student Portal
            </h1>
            <p className="text-xl text-gray-700">
              Welcome back, {session.user.name}!
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Link href="/dashboard" className="group">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">My Dashboard</h3>
                <p className="text-gray-600">View your courses and progress</p>
              </div>
            </Link>

            <Link href="/admin" className="group">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h3>
                <p className="text-gray-600">Manage courses and students</p>
              </div>
            </Link>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">My Progress</h3>
              <p className="text-gray-600">Track your learning journey</p>
            </div>
          </div>

          
        </div>
      </div>
    );
  }

  // If user is not logged in, show welcome/signup view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Student Portal
          </h1>
          <p className="text-lg text-gray-600">
            A modern learning management system
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Get Started
              </h2>
            </div>
            
            <div className="space-y-3">
              <Link 
                href="/auth/signup"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                📝 Create Account
              </Link>
              
              <Link 
                href="/auth/signin"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                🔑 Sign In
              </Link>
            </div>
            
            

            <div className="mt-4 text-center">
              <Link 
                href="/test-api" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                🧪 View API Tests
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        
      </div>
    </div>
  );
}