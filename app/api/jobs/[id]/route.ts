import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Job from "@/models/Job"; // Mongoose Model use karenge

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // 1. URL se ID nikalo
    const { id } = await params; 

    // 2. Database connect karo
    await connectToDatabase();

    console.log("🗑️ Deleting Job with ID:", id);

    // 3. Mongoose ka magic: Ye apne aap String ID ko ObjectId mein badal deta hai
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