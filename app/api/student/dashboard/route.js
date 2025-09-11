import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import User from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get any user as test student
    let student = await User.findOne({});
    
    if (!student) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    // Get enrollments with FULL course data populated
    let enrollments = await Enrollment.find({ userId: student._id })
      .populate({
        path: 'courseId',
        select: 'title description modules createdAt isActive',
        match: { isActive: { $ne: false } }
      })
      .sort({ enrolledAt: -1 });

    // Filter out enrollments where course was deleted
    enrollments = enrollments.filter(enrollment => enrollment.courseId);

    // If no enrollments, create sample data
    if (enrollments.length === 0) {
      console.log('Creating sample courses and enrollments...');
      
      // Create sample courses
      const sampleCourses = await Course.create([
        {
          title: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript programming language',
          modules: ['Variables & Data Types', 'Functions', 'Objects & Arrays', 'DOM Manipulation', 'Event Handling'],
          createdBy: student._id,
          isActive: true
        },
        {
          title: 'React Development',
          description: 'Build modern web applications with React framework',
          modules: ['Components', 'State Management', 'React Hooks', 'Routing', 'Context API'],
          createdBy: student._id,
          isActive: true
        },
        {
          title: 'Node.js Backend',
          description: 'Create server-side applications with Node.js',
          modules: ['Express Setup', 'Database Integration', 'API Development', 'Authentication', 'Deployment'],
          createdBy: student._id,
          isActive: true
        }
      ]);

      // Create sample enrollments
      for (let i = 0; i < sampleCourses.length; i++) {
        const course = sampleCourses[i];
        const progress = [75, 45, 20][i];
        const completedModules = [];
        
        const completedCount = Math.floor((progress / 100) * course.modules.length);
        for (let j = 0; j < completedCount; j++) {
          completedModules.push({
            moduleIndex: j,
            completedAt: new Date(Date.now() - (completedCount - j) * 24 * 60 * 60 * 1000)
          });
        }

        await Enrollment.create({
          userId: student._id,
          courseId: course._id,
          progress: progress,
          completedModules: completedModules,
          status: progress >= 100 ? 'completed' : 'active',
          enrolledAt: new Date(Date.now() - (3 - i) * 7 * 24 * 60 * 60 * 1000)
        });
      }

      // Re-fetch with populated data
      enrollments = await Enrollment.find({ userId: student._id })
        .populate({
          path: 'courseId',
          select: 'title description modules createdAt isActive'
        })
        .sort({ enrolledAt: -1 });
    }

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