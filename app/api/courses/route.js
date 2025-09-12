import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';

// GET /api/courses - Get all courses
export async function GET(request) {
  try {
    await dbConnect();
    
    const courses = await Course.find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 });
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request) {
  try {
    await dbConnect();
    
    const { title, description, modules } = await request.json();
    
    let user = await User.findOne({});
    
    if (!user) {
      return NextResponse.json(
        { error: 'No user found. Please create a user account first.' },
        { status: 400 }
      );
    }
    
    const course = await Course.create({
      title,
      description,
      modules,
      createdBy: user._id,
      isActive: true
    });
    
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Failed to create course', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/courses - Delete a course
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    const course = await Course.findByIdAndDelete(id);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}