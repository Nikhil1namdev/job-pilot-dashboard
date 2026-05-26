"use client";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DeleteJobButton = ({ id, title }: { id: string; title?: string }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Delete function banaya
  const handleDelete = async () => {
    const displayName = title ? `"${title}"` : "job";
    if (!confirm(`Are you sure you want to delete this ${displayName}?`)) return;
    
    setLoading(true);
    const toastId = toast.loading(`Deleting ${displayName}...`);

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("API failed");

      // Professional way: Bina reload kiye server component data refresh karna
      router.refresh();

      // Distinct neutral toast feedback on successful removal (Instead of Green)
      toast.dismiss(toastId);
      toast(`${title ? `"${title}"` : "Job"} successfully deleted`, {
        description: "Item has been removed.",
        icon: "🗑️"
      });
    } catch (error) {
      console.error("Delete failed:", error);
      // Error RED toast on real failure
      toast.dismiss(toastId);
      toast.error(`Failed to delete ${displayName}`, {
        description: "Please refresh and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. UI return karo (Shadcn Button + Lucide Icon)
  return (
    <Button
      variant="destructive" 
      size="icon" 
      onClick={handleDelete} 
      disabled={loading}
    >
      {loading ? (
        <span className="animate-spin">🌀</span> // Chota loading indicator
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
};

export default DeleteJobButton