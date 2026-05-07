import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Job from "@/models/Job"; // Mongoose Model use karenge

/**
 * 🗑️ DELETE REQUEST HANDLER (Permanent Delete)
 * -------------------------------------------
 * Jab JobDashboard component mein se koi Delete button press karta hai,
 * tab Next.js is Dynamic Route ([id]) ke 'DELETE' function ko call karta hai.
 * Path URL kuch aisa hota hai: `/api/jobs/65f1234abcd...`
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // 1. Next.js router automatic parameter se dynamic 'id' nikalta hai (await params)
    const { id } = await params; 

    // 2. Database connect karo taaki operation chal sake
    await connectToDatabase();

    console.log("🗑️ Deleting Job with ID:", id);

    // 3. Mongoose findByIdAndDelete use karke string ID ko automatic ObjectId mein badal kar doc delete kar deta hai
    const result = await Job.findByIdAndDelete(id);

    if (result) {
      console.log("✅ Job Deleted Successfully");
      return NextResponse.json({ message: "Deleted successfully" });
    } else {
      return NextResponse.json({ error: "Job not found in DB" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("❌ Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  } 
}

/**
 * ✏️ PATCH REQUEST HANDLER (Status Change)
 * ---------------------------------------
 * Jab JobDashboard component mein se status dropdown badla jata hai (Applied, Interviewing, etc.),
 * tab browser is Dynamic Route par ek PATCH request bhejta hai taaki full model update na karke
 * sirf ek 'status' property ko update kiya ja sake.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // 1. Dynamic parameters se ID nikalo
    const { id } = await params;
    
    // 2. DB connect karo
    await connectToDatabase();
    
    // 3. Request Body se data parse karo (status kya rakhna hai)
    const body = await req.json();
    const { status } = body;

    console.log(`Updating Job ${id} status to:`, status);

    // 4. MongoDB updates with findByIdAndUpdate:
    // - $set: { status } se sirf status field change hoga baaki sab same rahega
    // - { new: true } se humein purane ki jagah updated new document return hoga
    // - { runValidators: true } se ensure hoga ki new status humare Schema enum values mein se hi hai!
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found in DB" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error: any) {
    console.error("❌ Patch Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}