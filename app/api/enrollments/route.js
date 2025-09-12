import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import User from '@/models/User';

// GET /api/enrollments - Get enrollments (with filters)
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    
    let query = {};
    if (userId) query.userId = userId;
    if (courseId) query.courseId = courseId;
    
    const enrollments = await Enrollment.find(query)
      .populate('userId', 'name email')
      .populate('courseId', 'title description modules')
      .sort({ enrolledAt: -1 });
    
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }
    
    const enrollment = await Enrollment.findByIdAndDelete(id);
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    );
  }
}
// POST /api/enrollments - Create a new enrollment
export async function POST(request) {
  try {
    await dbConnect();
    
    const { userId, courseId } = await request.json();
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'User is already enrolled in this course' },
        { status: 400 }
      );
    }
    
    const enrollment = await Enrollment.create({
      userId,
      courseId,
    });
    
    await enrollment.populate('userId', 'name email');
    await enrollment.populate('courseId', 'title description');
    
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error('Create enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}

// PUT /api/enrollments - Update enrollment progress
export async function PUT(request) {
  try {
    await dbConnect();
    
    const { enrollmentId, moduleIndex, progress } = await request.json();
    
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }
    
    // Add completed module if provided
    if (moduleIndex !== undefined) {
      const existingModule = enrollment.completedModules.find(
        m => m.moduleIndex === moduleIndex
      );
      
      if (!existingModule) {
        enrollment.completedModules.push({
          moduleIndex,
          completedAt: new Date(),
        });
      }
    }
    
    // Update progress if provided
    if (progress !== undefined) {
      enrollment.progress = Math.max(0, Math.min(100, progress));
      
      // Update status based on progress
      if (enrollment.progress >= 100) {
        enrollment.status = 'completed';
      } else if (enrollment.progress > 0) {
        enrollment.status = 'active';
      }
    }
    
    await enrollment.save();
    await enrollment.populate('courseId', 'title modules');
    
    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Update enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}