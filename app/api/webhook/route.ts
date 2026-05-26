import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job'; // Apna Job model import karo

/**
 * 🔗 WEBHOOK API ROUTE (POST REQUEST)
 * ----------------------------------
 * Webhook ek automatic feature hai. Jab n8n automation LinkedIn se nayi job dhundhta hai,
 * tab n8n is URL par ek 'POST' request ke sath data bhejta hai.
 * Yeh function us incoming data ko receive karke MongoDB database mein save karta hai.
 */
export async function POST(req: Request) {
  try {
    // 1. Database se connect karo taaki hum data save kar sakein
    await connectToDatabase();

    // 2. n8n automation se aane wala incoming JSON data read karo (req.json())
    const jobData = await req.json();

    // 3. Job.create() ke jariye data ko direct 'jobs' collection mein naye document ke roop mein insert karo
    const result = await Job.create({
      ...jobData,        // Saara incoming data copy karo (title, company, score, location etc.)
      status: 'Pending', // Default status abhi ke liye Pending set kiya
      createdAt: new Date() // Create karne ka date-time stamp lagaya
    });

    console.log("✅ Job Saved via Webhook:", result._id);
    
    // 4. Client ya Caller (n8n) ko feedback do ki data save ho gaya (Status 201 = Created)
    return NextResponse.json({ 
      message: "Success", 
      id: result._id 
    }, { status: 201 });

  } catch (error: any) {
    // Agar beech mein koi error aata hai, toh use console mein print karo aur client ko error message bhej do
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ 
      error: "Failed to save job", 
      details: error.message 
    }, { status: 500 });
  }
}