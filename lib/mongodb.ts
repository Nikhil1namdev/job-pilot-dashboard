import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Pehle .env file mein MONGODB_URI dalo!");
}

async function connectToDatabase() {
  // Agar pehle se connected hai toh kuch mat karo
  if (mongoose.connection.readyState >= 1) return;

  try {
    // OPTIONS KO EKDOM KHALI RAKHO (Koi job_pilot_db nahi)
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}

export default connectToDatabase;