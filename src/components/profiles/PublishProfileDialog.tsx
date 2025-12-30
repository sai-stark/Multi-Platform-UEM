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
import { Send } from "lucide-react";
import { useState } from "react";

interface PublishProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfilePublished: () => void;
  profile: Profile | null;
}

export function PublishProfileDialog({
  open,
  onOpenChange,
  onProfilePublished,
  profile,
}: PublishProfileDialogProps) {
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
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
      // Publish profile with empty data (deviceIds and groupIds are optional)
      await ProfileService.publishProfile(profile.platform as Platform, profile.id, {});

      toast({
        title: "Profile Published",
        description: `Profile "${profile.name}" has been published successfully.`,
      });

      onProfilePublished();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to publish profile:", error);
      toast({
        title: "Error",
        description: "Failed to publish profile. Please try again.",
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
            <Send className="w-5 h-5" />
            Publish Profile
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to publish the profile{" "}
            <span className="font-semibold text-foreground">
              "{profile?.name}"
            </span>
            ? Once published, the profile will be available for deployment to devices.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePublish}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? "Publishing..." : "Publish Profile"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

