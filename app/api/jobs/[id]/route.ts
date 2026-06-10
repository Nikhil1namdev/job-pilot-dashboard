// Yeh dynamic API route /api/jobs/[id] par hone wale actions (Delete aur Update) ko handle karti hai.
// Yeh file ek Dynamic API Route Handler hai.

// Next.js mein jab hum kisi folder ka naam square brackets mein rakhte hain (jaise [id]), toh iska matlab hota hai ki yeh route dynamic hai aur isme job ki database id parameter ke roop mein aayegi.

// Example URL: /api/jobs/65abcd1234... (Yahan dynamic ID folder bracket [id] se retrieve hoti hai).
// Is single file ke andar do bade backend actions handle hote hain: DELETE aur PATCH.

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
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
      return NextResponse.json(
        { error: "Job not found in DB" },
        { status: 404 },
      );
    }
  } catch (error: any) {
    console.error("❌ Delete Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * ✏️ PATCH REQUEST HANDLER (Status Change)
 * PATCH method tab trigger hota hai jab hume pure database document ko bina chhede, uski kisi ek ya do settings (properties) ko edit karna ho.
 * ---------------------------------------
 * Jab JobDashboard component mein se status dropdown badla jata hai (Applied, Interviewing, etc.),
 * tab browser is Dynamic Route par ek PATCH request bhejta hai taaki full model update na karke
 * sirf ek 'status' property ko update kiya ja sake.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Dynamic parameters se ID nikalo
    const { id } = await params;

    // 2. DB connect karo
    await connectToDatabase();

    // 3. Request Body se data parse karo (status kya rakhna hai)
    const body = await req.json();
    const { status, notes } = body;

    console.log(
      `Updating Job ${id}... status: ${status}, notes length: ${notes?.length}`,
    );

    // Build update object based on what was provided
    // Yeh check karta hai ki body mein kya aaya hai. Agar sirf notes aaye hain, toh sirf notes save karega. Agar sirf status aaya hai, toh status update karega.
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // 4. MongoDB updates with findByIdAndUpdate:
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedJob) {
      return NextResponse.json(
        { error: "Job not found in DB" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error: any) {
    console.error("❌ Patch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}



//Is dynamic [id]/route.ts file ka kaam bohot straight-forward hai. Yeh sirf ek specific job (jiski ID URL mein aayi hai) par do bade actions perform karti hai:

// DELETE: Us specific job ko database se permanently delete kar dena.
// PATCH: Us specific job ke fields (jaise uski status ya uske notes) ko database mein jaakar update kar dena.