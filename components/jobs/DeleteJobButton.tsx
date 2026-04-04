"use client";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DeleteJobButton = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Delete function banaya
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Professional way: Bina reload kiye data refresh karna
        router.refresh(); 
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Kuch gadbad ho gayi!");
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