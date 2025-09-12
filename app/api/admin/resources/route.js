import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Resource from '@/models/Resource';
import Course from '@/models/Course';

// GET /api/admin/resources - Get all resources for admin
export async function GET(request) {
  try {
    await dbConnect();
    
    const resources = await Resource.find({})
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Get admin resources error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/admin/resources - Create multiple resources for a course
export async function POST(request) {
  try {
    await dbConnect();
    
    const { courseId, resources } = await request.json();
    
    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Create resources
    const createdResources = [];
    for (const resourceData of resources) {
      const resource = await Resource.create({
        courseId,
        title: resourceData.title,
        url: resourceData.url,
        type: resourceData.type,
        description: resourceData.description || '',
        moduleIndex: resourceData.moduleIndex || 0,
        order: resourceData.order || 0,
      });
      
      await resource.populate('courseId', 'title');
      createdResources.push(resource);
    }
    
    return NextResponse.json(createdResources, { status: 201 });
  } catch (error) {
    console.error('Create resources error:', error);
    return NextResponse.json(
      { error: 'Failed to create resources' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/resources - Delete a resource
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
    
    const resource = await Resource.findByIdAndDelete(id);
    
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