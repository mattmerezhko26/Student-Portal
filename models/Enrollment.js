import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  courseId: { 
    type: String, 
    required: true 
  },
  progress: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  enrolledAt: { 
    type: Date, 
    default: Date.now 
  },
  lastAccessed: { 
    type: Date, 
    default: Date.now 
  }
});

// Create compound index to prevent duplicate enrollments
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Update lastAccessed when progress is updated
EnrollmentSchema.pre('save', function(next) {
  if (this.isModified('progress')) {
    this.lastAccessed = Date.now();
  }
  next();
});

export default mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);