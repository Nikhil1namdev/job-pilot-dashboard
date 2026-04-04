// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     console.log("n8n Data Received:", body);
    
//     // Yahan tum apna MongoDB wala logic likhoge baad mein
    
//     // Abhi ke liye hum success bhej rahe hain test karne ke liye
    
//     return NextResponse.json({ 
//       success: true, 
//       message: "Job received successfully!",
//       receivedData: body 
//     }, { status: 201 });
    
//   } catch (error) {
//     return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
//   }
// }

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb'; // Check karo tumhara path yahi hai na
import Job from '@/models/Job';

export async function POST(request: Request) {
  try {
    // 1. Database Connect karo
    await connectToDatabase();


    // 2. n8n se aane wala data read karo
    const body = await request.json();
    console.log("Saving to DB:", body);

    // 3. Data ko sanitize karo (AI kabhi kabhi null bhej sakta hai)
    const newJob = await Job.create({
      title: body.title || "Untitled Position",
      company: body.company || "Unknown Company",
      score: body.score || 0,
      source: body.source || "n8n_automation",
      postedAt: new Date(), // Sorting ke liye zaroori hai
    });

    // 4. Success Response bhejo
    return NextResponse.json({ 
      success: true, 
      data: newJob 
    }, { status: 201 });

  } catch (error: any) {
    console.error("DB Save Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}