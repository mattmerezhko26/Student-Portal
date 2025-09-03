import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Resource from '@/models/Resource';
import Course from '@/models/Course';

// GET /api/resources - Get resources (filtered by course)
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const moduleIndex = searchParams.get('moduleIndex');
    
    let query = { isActive: true };
    if (courseId) query.courseId = courseId;
    if (moduleIndex !== null) query.moduleIndex = parseInt(moduleIndex);
    
    const resources = await Resource.find(query)
      .populate('courseId', 'title')
      .sort({ moduleIndex: 1, order: 1 });
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create a new resource
export async function POST(request) {
  try {
    await dbConnect();
    
    const { courseId, title, url, type, description, moduleIndex, order } = await request.json();
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    const resource = await Resource.create({
      courseId,
      title,
      url,
      type,
      description: description || '',
      moduleIndex: moduleIndex || 0,
      order: order || 0,
    });
    
    await resource.populate('courseId', 'title');
    
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Create resource error:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

// PUT /api/resources - Update a resource
export async function PUT(request) {
  try {
    await dbConnect();
    
    const { id, title, url, type, description, moduleIndex, order } = await request.json();
    
    const resource = await Resource.findByIdAndUpdate(
      id,
      {
        title,
        url,
        type,
        description,
        moduleIndex,
        order,
      },
      { new: true, runValidators: true }
    ).populate('courseId', 'title');
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Update resource error:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/resources - Delete a resource (soft delete)
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }
    
    const resource = await Resource.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}