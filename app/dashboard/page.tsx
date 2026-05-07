import connectToDatabase from "@/lib/mongodb";
import Job from "@/models/Job";
import JobDashboard from "@/components/jobs/JobDashboard";

/**
 * 🔍 PAGINATED & FILTERED SERVER-SIDE DATA FETCHING (getJobs)
 * -----------------------------------------------------------
 * Server par chalne wala function jo MongoDB database se exact paginated data fetch karta hai.
 * Skip aur Limit ka use karke hum sirf current page ke 8 items bejte hain na ki saare jobs.
 * MongoDB Aggregation Pipeline ka use karke global dashboard stats dynamically calculate hote hain.
 */
async function getJobs(
  page: number,
  limit: number,
  search?: string,
  status?: string,
  score?: string
) {
  await connectToDatabase();

  const query: any = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "All") {
    query.status = status;
  }

  if (score && score !== "all") {
    if (score === "high") {
      query.score = { $gte: 80 };
    } else if (score === "medium") {
      query.score = { $gte: 50, $lt: 80 };
    } else if (score === "low") {
      query.score = { $lt: 50 };
    }
  }

  const skip = (page - 1) * limit;

  // Parallel executing multiple queries using Promise.all for high-end SaaS speed
  const [rawJobs, totalJobs, topMatches, appliedCount, avgScoreGroup] = await Promise.all([
    Job.find(query)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(query),
    Job.countDocuments({ ...query, score: { $gte: 90 } }),
    Job.countDocuments({ ...query, status: "Applied" }),
    // Dynamic database average score aggregation
    Job.aggregate([
      { $match: query },
      { $group: { _id: null, avg: { $avg: "$score" } } }
    ])
  ]);

  const totalPages = Math.ceil(totalJobs / limit);
  const avgScore = avgScoreGroup.length > 0 ? Math.round(avgScoreGroup[0].avg || 0) : 0;

  // Serialization step
  const jobs = rawJobs.map((job: any) => ({
    ...job,
    _id: job._id.toString(),
    postedAt: job.postedAt ? job.postedAt.toISOString() : null,
  }));

  return {
    jobs,
    totalJobs,
    totalPages,
    stats: {
      total: totalJobs,
      topMatches,
      applied: appliedCount,
      avgScore
    }
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; score?: string }> | { page?: string; search?: string; status?: string; score?: string };
}) {
  const resolvedParams = await searchParams;
  
  const currentPage = parseInt(resolvedParams.page || "1", 10);
  const search = resolvedParams.search || "";
  const status = resolvedParams.status || "All";
  const score = resolvedParams.score || "all";

  const limit = 8;

  const { jobs, totalJobs, totalPages, stats } = await getJobs(
    currentPage,
    limit,
    search,
    status,
    score
  );

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950 min-h-screen">
      <JobDashboard 
        initialJobs={jobs} 
        totalJobs={totalJobs}
        totalPages={totalPages}
        currentPage={currentPage}
        limit={limit}
        stats={stats}
      />
    </div>
  );
}
