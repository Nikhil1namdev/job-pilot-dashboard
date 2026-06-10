// Yeh file humare /dashboard route ka Main Server Component entry point ha

import connectToDatabase from "@/lib/mongodb";
import Job from "@/models/Job";
import JobDashboard from "@/components/jobs/JobDashboard";

// 3. force-dynamic Kyun? Next.js default roop se build time par pages ko static cache kar leta hai.
// Kyunki humare database mein jobs continuously (n8n automation se) change ho rahi hain, 
// isliye cache bypass karke har request par direct live DB data fetch karne ke liye iski need hai.
export const dynamic = "force-dynamic";

async function getJobs() {
  await connectToDatabase();

  // 1. .lean() Kyun? Mongoose ke heavy documents ki jagah plain lightweight JavaScript objects return karta hai.
  // Isse query execution super fast ho jati hai aur memory consumption bohot low ho jata hai.
  const rawJobs = await Job.find({}).lean();

  // 2. Mapping (.map) Kyun? Next.js mein Server Component se Client Component (JobDashboard) mein 
  // data pass karte waqt objects fully serializable (plain strings/numbers) hone chahiye.
  // MongoDB ka '_id' (ObjectId class instance) aur 'postedAt' (native Date object) objects hain. 
  // Inko direct pass karne par Next.js runtime error dega, isliye id ko .toString() aur date ko .toISOString() kiya hai.
  const jobs = rawJobs.map((job: any) => ({
    ...job,
    _id: job._id.toString(),
    postedAt: job.postedAt ? job.postedAt.toISOString() : null,
  }));

  return {
    jobs,
  };
}

export default async function DashboardPage() {
  const { jobs } = await getJobs();

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950 min-h-screen">
      <JobDashboard initialJobs={jobs} />
    </div>
  );
}
