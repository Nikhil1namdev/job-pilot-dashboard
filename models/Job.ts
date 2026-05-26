import mongoose, { Schema, model, models } from "mongoose";

/**
 * 📋 JOB BLUEPRINT (SCHEMA)
 * -------------------------
 * Schema MongoDB collection ka ek blueprint ya structure hota hai.
 * Yeh batata hai ki ek "Job" object ke paas kaun-kaun se fields honge
 * aur unka data type (String, Number, Date) kya hoga.
 */
// const JobSchema = new Schema({
//   title: { type: String, required: true }, // Job ka Title (Jaise Software Engineer) - Yeh required hai!
//   company: { type: String, default: "Unknown" }, // Company ka naam (default "Unknown")
//   score: { type: Number, default: 0 }, // AI ya matching fit score (default 0)
//   source: { type: String, default: "n8n" }, // Kahan se data aaya (Jaise n8n automation)
//   postedAt: { type: Date, default: Date.now }, // Kis date aur time par document banaya gaya (default abhi ka time)
//   applyLink: { type: String, default: "" }, // Job apply karne ka URL link
//   location: { type: String, default: "" }, // Job ka Location (Jaise Remote ya Noida)
//   salary: { type: String, default: "Not mentioned" }, // Salary pack (default "Not mentioned")
//   postedDate: { type: String, default: "Unknown" }, // Kab post hui thi (Jaise 2 days ago)
//   status: {
//     type: String,
//     default: "Not Applied",
//     // enum ka matlab sirf inhi niche diye gaye options mein se koi ek value save ho sakti hai!
//     enum: ["Not Applied", "Applied", "Interviewing", "Offer", "Rejected"]
//   },
// });
// const JobSchema = new Schema({
//   title: { type: String, required: true },

//   company: { type: String, default: "Unknown" },

//   score: { type: Number, default: 0 },

//   reason: { type: String, default: "" },

//   source: { type: String, default: "n8n" },

//   postedAt: { type: Date, default: Date.now },

//   applyLink: { type: String, default: "" },

//   location: { type: String, default: "" },

//   salary: { type: String, default: "Not mentioned" },

//   postedDate: { type: String, default: "Unknown" },

//   job_id: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },

//   status: {
//     type: String,
//     default: "Not Applied",
//     enum: ["Not Applied", "Applied", "Interviewing", "Offer", "Rejected"],
//   },
// });



const JobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Position",
    },

    company: {
      type: String,
      default: "Unknown Company",
      trim: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    reason: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "n8n",
      trim: true,
    },

    applyLink: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "Anywhere",
    },

    salary: {
      type: String,
      default: "Not mentioned",
    },

    // Human readable value from SerpAPI: "2 days ago", "15 hours ago"
    postedDate: {
      type: String,
      default: "Unknown",
    },

    // Actual DB insert time
    postedAt: {
      type: Date,
      default: Date.now,
    },

    job_id: {
      type: String,
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      default: "Not Applied",
      enum: ["Not Applied", "Applied", "Interviewing", "Offer", "Rejected"],
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 📦 MODEL REGISTER/GET
 * ---------------------
 * Next.js har page click par hot-reloads karta hai. Agar hum direct model('Job', JobSchema) likhenge,
 * toh database kahega "Job model pehle se bana hai, dobara nahi bana sakte!".
 * Isliye 'models.Job' pehle check karta hai ki kya model bana hua hai?
 * Agar haan, toh use reuse karo, nahi toh model('Job', JobSchema) se naya banao.
 */
const Job = models.Job || model("Job", JobSchema);

export default Job;
