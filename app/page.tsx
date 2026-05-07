import connectToDatabase from "@/lib/mongodb";
import Job from "@/models/Job";
import JobDashboard from "@/components/jobs/JobDashboard";

/**
 * 🔍 YEH HAI EK SERVER FUNCTION (getJobs)
 * ---------------------------------------
 * Yeh function seedhe server par chalta hai. Iska kaam hai database se jobs fetch karna.
 * Isme 'async/await' isliye hai kyunki database se connection aur data fetch hone mein thoda time lagta hai.
 */
async function getJobs() {
  // 1. Pehle MongoDB database se connection establish karo
  await connectToDatabase();
  
  // 2. Job model se saare jobs nikalo (find({}))
  // - sort({ postedAt: -1 }) se nayi jobs sabse upar dikhengi
  // - .lean() use karne se data lightweight dynamic JavaScript object mein badal jata hai (faster performance)
  const rawJobs = await Job.find({}).sort({ postedAt: -1 }).lean();
  
  // 3. SERIALIZATION (Sabse important step!):
  // - MongoDB apne IDs ko 'ObjectId' object aur dates ko 'Date' object ke roop mein rakhta hai.
  // - Next.js humein complex JS objects ko direct Server Component se Client Component (browser) par bejne nahi deta.
  // - Isliye hum har ek job ke '_id' aur 'postedAt' ko map() ke jariye plain string mein convert kar rahe hain.
  const jobs = rawJobs.map((job: any) => ({
    ...job,
    _id: job._id.toString(), // Complex ObjectId ko normal text (String) banaya
    postedAt: job.postedAt ? job.postedAt.toISOString() : null, // Date object ko ISO string banaya
  }));
  
  return jobs;
}

/**
 * 🚀 YEH HAI HOME PAGE (SERVER COMPONENT)
 * ---------------------------------------
 * Next.js mein by default saare pages Server Components hote hain.
 * Server Component ka fayda yeh hai ki yeh database se seedhe aur jaldi connect hota hai,
 * aur security bani rehti hai kyunki yeh code browser par nahi dikhta.
 */
export default async function Home() {
  // Page load hote hi server par database se jobs fetch karo
  const jobs = await getJobs();

  return (
    // Hum initial jobs ko Client Component (<JobDashboard />) mein prop ke roop mein bhej rahe hain
    <div className="bg-zinc-50/50 dark:bg-zinc-950 min-h-screen">
      <JobDashboard initialJobs={jobs} />
    </div>
  );
}