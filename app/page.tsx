import connectToDatabase from "@/lib/mongodb";
import Job from "@/models/Job";
import DeleteJobButton from "@/components/jobs/DeleteJobButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getJobs() {
  await connectToDatabase();
  const jobs = await Job.find({}).sort({ postedAt: -1 }).lean();
  return jobs;
}

export default async function Home() {
  const jobs = await getJobs();

  return (
    <div className="p-10 bg-zinc-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🚀 Job Pilot Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Apply</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job: any) => (
              <TableRow key={job._id.toString()}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.location || "N/A"}</TableCell>
                <TableCell>{job.company || "N/A"}</TableCell>
                
                {/* Score with color */}
                <TableCell>
                  <span className={`font-bold ${
                    job.score >= 80 ? "text-green-600" : 
                    job.score >= 50 ? "text-yellow-600" : 
                    "text-red-500"
                  }`}>
                    {job.score || 0}
                  </span>
                </TableCell>

                {/* Apply Link */}
                <TableCell>
                  {job.applyLink ? (
                    <a 
                      href={job.applyLink} 
                      target="_blank"
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Apply ✅
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">No Link</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <DeleteJobButton id={job._id.toString()} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}