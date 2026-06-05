import connectToDatabase from "@/lib/mongodb";
import Job from "@/models/Job";
import JobDashboard from "@/components/jobs/JobDashboard";

export const dynamic = "force-dynamic";

async function getJobs() {
  await connectToDatabase();

  const rawJobs = await Job.find({}).lean();

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
