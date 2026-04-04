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

// 1. Data Fetching (Server Side)
async function getJobs() {
  await connectToDatabase();
  // Fetching jobs through Mongoose Model
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
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job: any) => (
              <TableRow key={job._id.toString()}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.company || "N/A"}</TableCell>
                <TableCell className="text-right">
                  {/* Yahan humne dynamic ID pass ki hai */}
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