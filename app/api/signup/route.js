import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    console.log('Signup API called');
    const { name, email, password } = await request.json();
    console.log('Request data:', { name, email, password: '***' });
    
    await dbConnect();
    console.log('Database connected');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Hash password
    const passwordHash = bcrypt.hashSync(password, 12);
    console.log('Password hashed');
    
    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'student',
    });
    console.log('User created:', user._id);
    
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong', 
      details: error.message 
    }, { status: 500 });
  }
}