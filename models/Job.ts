import mongoose, { Schema, model, models } from 'mongoose';

const JobSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, default: "Unknown" },
  score: { type: Number, default: 0 },
  source: { type: String, default: "n8n" },
  postedAt: { type: Date, default: Date.now }
});

// Agar model pehle se bana hai toh wahi use karo, nahi toh naya banao
const Job = models.Job || model('Job', JobSchema);

export default Job;