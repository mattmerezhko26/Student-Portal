import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['video', 'pdf', 'link', 'document', 'image'],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  moduleIndex: {
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);