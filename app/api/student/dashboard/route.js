import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

export async function GET(request) {
  try {
    await dbConnect();
    
    const student = await User.findOne({});
    
    if (!student) {
      return NextResponse.json({
        student: { id: 'test', name: 'Test User', email: 'test@example.com' },
        enrollments: [],
        stats: { totalCourses: 0, completedCourses: 0, averageProgress: 0 }
      });
    }

    // Just get existing enrollments - DON'T create new ones
    const enrollments = await Enrollment.find({ userId: student._id })
      .populate('courseId')
      .sort({ enrolledAt: -1 });

    const stats = {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      averageProgress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
        : 0,
    };

    return NextResponse.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
      },
      enrollments,
      stats,
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}