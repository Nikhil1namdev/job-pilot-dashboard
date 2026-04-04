import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job'; // Apna Job model import karo

export async function POST(req: Request) {
  try {
    // 1. Database se connect karo
    await connectToDatabase();

    // 2. n8n se aane wala data lo
    const jobData = await req.json();

    // 3. SEEDHA MODEL USE KARO (Ye sabse clean tarika hai)
    // Ye apne aap "jobs" collection mein data insert karega
    const result = await Job.create({
      ...jobData,
      status: 'Pending',
      createdAt: new Date()
    });

    console.log("✅ Job Saved via Webhook:", result._id);
    
    return NextResponse.json({ 
      message: "Success", 
      id: result._id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ 
      error: "Failed to save job", 
      details: error.message 
    }, { status: 500 });
  }
}