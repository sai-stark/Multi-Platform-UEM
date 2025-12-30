import { ProfileService } from "@/api/services/profiles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Platform, Profile } from "@/types/models";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileDeleted: () => void;
  profile: Profile | null;
}

export function DeleteProfileDialog({
  open,
  onOpenChange,
  onProfileDeleted,
  profile,
}: DeleteProfileDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!profile?.id || !profile?.platform) {
      toast({
        title: "Error",
        description: "Profile information is missing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await ProfileService.deleteProfile(profile.platform as Platform, profile.id);

      toast({
        title: "Profile Deleted",
        description: `Profile "${profile.name}" has been deleted successfully.`,
      });

      onProfileDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Delete Profile
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the profile{" "}
            <span className="font-semibold text-foreground">
              "{profile?.name}"
            </span>
            ? This action cannot be undone. The profile will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {loading ? "Deleting..." : "Delete Profile"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
