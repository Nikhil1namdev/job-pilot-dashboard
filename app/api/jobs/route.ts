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
import connectToDatabase from '@/lib/mongodb';
import Job from '@/models/Job';

// export async function POST(request: Request) {
//   try {
//     await connectToDatabase();
//     const body = await request.json();
//     console.log("Saving to DB:", body);

//     // Duplicate check + upsert
//   const job = await Job.findOneAndUpdate(
//   { title: body.title, company: body.company },
//   {
//     $set: {
//       title: body.title || "Untitled Position",
//       company: body.company || "Unknown Company",
//       score: body.score || 0,
//       applyLink: body.applyLink?.trim() || "",
//       source: body.source?.trim() || "n8n_automation",
//       postedAt: new Date(),
//     }
//   },
//   { upsert: true, returnDocument: 'after' }
// );

//     return NextResponse.json({ success: true, data: job }, { status: 201 });

//   } catch (error: any) {
//     console.error("DB Save Error:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Exact check
    // console.log("applyLink value:", body.applyLink);
    // console.log("applyLink type:", typeof body.applyLink);
    // console.log("applyLink length:", body.applyLink?.length);

    const job = await Job.findOneAndUpdate(
      { title: body.title, company: body.company },
      {
        $set: {
          title: body.title || "Untitled Position",
          company: body.company || "Unknown Company",
          score: Number(body.score) || 0,
          applyLink: String(body.applyLink || "").trim(),
          source: String(body.source || "n8n").trim(),
          postedAt: new Date(),
          location: String(body.location || "").trim(),
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log("Saved job:", job); // ← DB mein kya gaya

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}