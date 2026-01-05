import { ProfileService } from "@/api/services/profiles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAssetUrl } from "@/config/env";
import { toast } from "@/hooks/use-toast";
import { Platform, Profile, ProfileType } from "@/types/models";
import { Pencil } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: () => void;
  profile: Profile | null;
}

// Validation constants from OpenAPI spec
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;
const NAME_PATTERN = /^[a-zA-Z0-9\- ]{3,30}$/;

const DESC_MIN_LENGTH = 5;
const DESC_MAX_LENGTH = 100;
const DESC_PATTERN = /^[a-zA-Z0-9\- ]{5,100}$/;

// Platform configuration with asset images
const PLATFORM_CONFIG: Record<string, { label: string; image: string }> = {
  android: {
    label: "Android",
    image: getAssetUrl("/Assets/android.png"),
  },
  ios: {
    label: "iOS",
    image: getAssetUrl("/Assets/apple.png"),
  },
  windows: {
    label: "Windows",
    image: getAssetUrl("/Assets/microsoft.png"),
  },
};

interface FormErrors {
  name?: string;
  description?: string;
}

interface FormData {
  name: string;
  description: string;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  onProfileUpdated,
  profile,
}: EditProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Store original values for comparison
  const originalValues = useMemo(
    () => ({
      name: profile?.name || "",
      description: profile?.description || "",
    }),
    [profile]
  );

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return (
      formData.name !== originalValues.name ||
      formData.description !== originalValues.description
    );
  }, [formData, originalValues]);

  // Sync form data when profile changes or dialog opens
  useEffect(() => {
    if (open && profile) {
      setFormData({
        name: profile.name || "",
        description: profile.description || "",
      });
      setErrors({});
      setTouched({});
    }
  }, [open, profile]);

  const validateName = (value: string): string | undefined => {
    if (!value || value.trim() === "") {
      return "Profile name is required";
    }
    if (value.length < NAME_MIN_LENGTH) {
      return `Name must be at least ${NAME_MIN_LENGTH} characters`;
    }
    if (value.length > NAME_MAX_LENGTH) {
      return `Name must be at most ${NAME_MAX_LENGTH} characters`;
    }
    if (!NAME_PATTERN.test(value)) {
      return "Name can only contain letters, numbers, hyphens, and spaces";
    }
    return undefined;
  };

  const validateDescription = (value: string): string | undefined => {
    if (!value || value.trim() === "") {
      return "Description is required";
    }
    if (value.length < DESC_MIN_LENGTH) {
      return `Description must be at least ${DESC_MIN_LENGTH} characters`;
    }
    if (value.length > DESC_MAX_LENGTH) {
      return `Description must be at most ${DESC_MAX_LENGTH} characters`;
    }
    if (!DESC_PATTERN.test(value)) {
      return "Description can only contain letters, numbers, hyphens, and spaces";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateName(formData.name || ""),
      description: validateDescription(formData.description || ""),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched({ ...touched, [field]: true });

    // Validate the specific field on blur
    if (field === "name") {
      setErrors({ ...errors, name: validateName(formData.name || "") });
    } else if (field === "description") {
      setErrors({
        ...errors,
        description: validateDescription(formData.description || ""),
      });
    }
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    if (touched.name) {
      setErrors({ ...errors, name: validateName(value) });
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
    if (touched.description) {
      setErrors({ ...errors, description: validateDescription(value) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, description: true });

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!hasChanges) {
      toast({
        title: "No Changes",
        description: "No changes were made to the profile.",
      });
      return;
    }

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
      // Map platform to profileType for API payload
      const profileTypeMap: Record<string, ProfileType> = {
        android: "AndroidProfile",
        ios: "IosProfile",
      };

      // Construct full Profile object as required by API
      const updatedProfile: Profile = {
        ...profile,
        name: formData.name,
        description: formData.description,
        profileType: profileTypeMap[profile.platform] || profile.profileType,
      };

      await ProfileService.updateProfile(
        profile.platform as Platform,
        profile.id!,
        updatedProfile
      );

      toast({
        title: "Profile Updated",
        description: `Profile "${formData.name}" has been updated successfully.`,
      });

      onProfileUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setErrors({});
      setTouched({});
    }
    onOpenChange(isOpen);
  };

  const platformConfig = PLATFORM_CONFIG[profile?.platform || "android"];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update the profile name and description. Platform cannot be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="flex items-center gap-1">
              Profile Name
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </Label>
            <Input
              id="edit-name"
              placeholder="e.g., Corporate Android Policy"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => handleBlur("name")}
              aria-invalid={touched.name && !!errors.name}
              aria-describedby={errors.name ? "edit-name-error" : "edit-name-hint"}
              className={
                touched.name && errors.name
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              maxLength={NAME_MAX_LENGTH}
            />
            <div className="flex justify-between items-center">
              {touched.name && errors.name ? (
                <p
                  id="edit-name-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.name}
                </p>
              ) : (
                <p id="edit-name-hint" className="text-xs text-muted-foreground">
                  {NAME_MIN_LENGTH}-{NAME_MAX_LENGTH} characters, alphanumeric
                  with hyphens and spaces
                </p>
              )}
              <span className="text-xs text-muted-foreground">
                {formData.name?.length || 0}/{NAME_MAX_LENGTH}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">Platform</Label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-muted/50 cursor-not-allowed">
              {platformConfig && (
                <>
                  <img
                    src={platformConfig.image}
                    alt={platformConfig.label}
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-muted-foreground">
                    {platformConfig.label}
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                (Cannot be changed)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="flex items-center gap-1">
              Description
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Describe the purpose of this profile..."
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={() => handleBlur("description")}
              aria-invalid={touched.description && !!errors.description}
              aria-describedby={
                errors.description ? "edit-description-error" : "edit-description-hint"
              }
              className={
                touched.description && errors.description
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              rows={3}
              maxLength={DESC_MAX_LENGTH}
            />
            <div className="flex justify-between items-center">
              {touched.description && errors.description ? (
                <p
                  id="edit-description-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.description}
                </p>
              ) : (
                <p
                  id="edit-description-hint"
                  className="text-xs text-muted-foreground"
                >
                  {DESC_MIN_LENGTH}-{DESC_MAX_LENGTH} characters, alphanumeric
                  with hyphens and spaces
                </p>
              )}
              <span className="text-xs text-muted-foreground">
                {formData.description?.length || 0}/{DESC_MAX_LENGTH}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !hasChanges}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

