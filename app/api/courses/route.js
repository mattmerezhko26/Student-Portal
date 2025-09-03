import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';

// GET /api/courses - Get all courses
export async function GET(request) {
  try {
    await dbConnect();
    
    const courses = await Course.find({ isActive: true })
      .populate('createdBy', 'name email')
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
    
    // For now, we'll use a default admin user ID
    // First, let's try to find any user to use as creator
    let adminUser = await User.findOne({ role: 'admin' });
    
    // If no admin exists, use any user
    if (!adminUser) {
      adminUser = await User.findOne({});
    }
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'No user found. Please create a user account first.' },
        { status: 400 }
      );
    }
    
    const course = await Course.create({
      title,
      description,
      modules,
      createdBy: adminUser._id,
    });
    
    await course.populate('createdBy', 'name email');
    
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Failed to create course', details: error.message },
      { status: 500 }
    );
  }
}