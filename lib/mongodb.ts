import mongoose from 'mongoose';

// 1. '.env' file mein se MONGODB_URI ka password aur address nikalna
const MONGODB_URI = process.env.MONGODB_URI || "";

// Agar '.env' file mein key missing hai toh error throw karo taaki developer ko pata chal sake
if (!MONGODB_URI) {
  throw new Error("Pehle .env file mein MONGODB_URI dalo!");
}

/**
 * 🔌 DATABASE CONNECTION FUNCTION
 * ------------------------------
 * Next.js serverless architecture par chalta hai, jahan baar-baar server functions
 * open aur close hote hain. Har page click par naya database connection na bane,
 * isliye hum pehle se connected mongoose instance ko reuse karte hain.
 */
async function connectToDatabase() {
  // connection.readyState agar:
  // 0 = Disconnected, 1 = Connected, 2 = Connecting, 3 = Disconnecting.
  // Agar readyState >= 1 hai (yani connected ya connecting), toh naya connection mat banao, wahin se return ho jao!
  if (mongoose.connection.readyState >= 1) return;

  try {
    // Mongoose ke through MongoDB database se connect karo
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}

export default connectToDatabase;