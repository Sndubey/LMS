import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  lectureCompleted: []   // lectureCompleted: [{ type: String }]
}, { minimize: false });  // letting mongoose store empty objects in db

export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);