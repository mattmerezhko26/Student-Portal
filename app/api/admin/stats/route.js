import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Resource from '@/models/Resource';

// GET /api/admin/stats - Get comprehensive admin statistics
export async function GET(request) {
  try {
    await dbConnect();
    
    // Get basic counts
    const [
      totalUsers,
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalResources,
      recentEnrollments,
      courseStats
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: { $ne: 'admin' } }),
      Course.countDocuments({ isActive: { $ne: false } }),
      Enrollment.countDocuments({}),
      Resource.countDocuments({ isActive: { $ne: false } }),
      
      // Recent enrollments with populated data
      Enrollment.find({})
        .populate('userId', 'name email')
        .populate('courseId', 'title')
        .sort({ enrolledAt: -1 })
        .limit(10),
      
      // Course enrollment statistics
      Enrollment.aggregate([
        {
          $group: {
            _id: '$courseId',
            enrollmentCount: { $sum: 1 },
            averageProgress: { $avg: '$progress' },
            completedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'course'
          }
        },
        {
          $unwind: '$course'
        },
        {
          $project: {
            courseTitle: '$course.title',
            enrollmentCount: 1,
            averageProgress: { $round: ['$averageProgress', 0] },
            completedCount: 1,
            completionRate: {
              $round: [
                { $multiply: [{ $divide: ['$completedCount', '$enrollmentCount'] }, 100] },
                1
              ]
            }
          }
        },
        { $sort: { enrollmentCount: -1 } }
      ])
    ]);
    
    // Calculate overall platform statistics
    const allEnrollments = await Enrollment.find({}).select('progress status');
    const averageProgress = allEnrollments.length > 0
      ? Math.round(allEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / allEnrollments.length)
      : 0;
    
    const completedCourses = allEnrollments.filter(e => e.status === 'completed').length;
    const overallCompletionRate = allEnrollments.length > 0
      ? Math.round((completedCourses / allEnrollments.length) * 100)
      : 0;
    
    // Student activity over time (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentActivity = await Enrollment.aggregate([
      {
        $match: {
          enrolledAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$enrolledAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return NextResponse.json({
      overview: {
        totalUsers,
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalResources,
        averageProgress,
        overallCompletionRate
      },
      courseStats,
      recentEnrollments,
      recentActivity,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}