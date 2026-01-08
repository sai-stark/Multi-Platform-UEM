import { ProfileService } from "@/api/services/profiles";
import { LoadingAnimation } from "@/components/common/LoadingAnimation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAssetUrl } from "@/config/env";
import { toast } from "@/hooks/use-toast";
import { Platform, Profile, ProfileType } from "@/types/models";
import { Layout } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Platform configuration with asset images
const PLATFORM_CONFIG = {
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
    disabled: true,
  },
};

interface AddProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileAdded: () => void;
  defaultPlatform?: "android" | "ios";
}

// Validation constants from OpenAPI spec
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;
const NAME_PATTERN = /^[a-zA-Z0-9\- ]{3,30}$/;

const DESC_MIN_LENGTH = 5;
const DESC_MAX_LENGTH = 100;
const DESC_PATTERN = /^[a-zA-Z0-9\- ]{5,100}$/;

// Map platform to profileType as per OpenAPI spec
const PROFILE_TYPE_MAP: Record<string, ProfileType> = {
  android: "AndroidProfile",
  ios: "IosProfile",
};

interface FormErrors {
  name?: string;
  description?: string;
  platform?: string;
}

interface FormData {
  name: string;
  description: string;
  platform: "android" | "ios";
}

// Constants for profile readiness polling
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 500; // 500ms between attempts, max ~5 seconds total

export function AddProfileDialog({
  open,
  onOpenChange,
  onProfileAdded,
  defaultPlatform = "android",
}: AddProfileDialogProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    platform: defaultPlatform,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Poll the profile API until it returns valid data
  const waitForProfileReady = useCallback(
    async (platform: string, profileId: string): Promise<boolean> => {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        try {
          const profile = await ProfileService.getProfile(
            platform as Platform,
            profileId
          );
          if (profile && profile.id) {
            return true;
          }
        } catch {
          // Profile not ready yet, continue polling
        }
        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
      // Timeout reached - navigate anyway after max attempts
      return false;
    },
    []
  );

  // Sync platform with defaultPlatform when dialog opens
  useEffect(() => {
    if (open) {
      setFormData((prev) => ({ ...prev, platform: defaultPlatform }));
    }
  }, [open, defaultPlatform]);

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
      platform: !formData.platform ? "Platform is required" : undefined,
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
    setTouched({ name: true, description: true, platform: true });

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Build the profile payload with profileType as per OpenAPI spec
      const profileType = PROFILE_TYPE_MAP[formData.platform];
      const profilePayload: Profile = {
        name: formData.name,
        description: formData.description,
        profileType: profileType,
      };

      const createdProfile = await ProfileService.createProfile(
        formData.platform,
        profilePayload
      );

      toast({
        title: "Profile Created",
        description: `Profile "${formData.name}" has been created successfully.`,
      });

      onProfileAdded();
      setLoading(false);

      // Navigate to edit policies page for the newly created profile
      if (createdProfile?.id) {
        // Show preparing state while waiting for profile to be ready
        setPreparing(true);

        // Wait for profile to be available in the API
        await waitForProfileReady(formData.platform, createdProfile.id);

        setPreparing(false);
        onOpenChange(false);
        resetForm();

        navigate(
          `/profiles/${formData.platform}/${createdProfile.id}`
        );
      } else {
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      setPreparing(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", platform: defaultPlatform });
    setErrors({});
    setTouched({});
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  // Prevent closing dialog while preparing
  const handleDialogOpenChange = (isOpen: boolean) => {
    if (preparing) return; // Prevent closing during preparation
    handleOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        {preparing ? (
          <div className="py-4">
            <LoadingAnimation message="Preparing profile..." />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Create New Profile
              </DialogTitle>
              <DialogDescription>
                Create a new device profile to apply policies and configurations.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1">
              Profile Name
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Corporate Android Policy"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => handleBlur("name")}
              aria-invalid={touched.name && !!errors.name}
              aria-describedby={errors.name ? "name-error" : "name-hint"}
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
                  id="name-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.name}
                </p>
              ) : (
                <p id="name-hint" className="text-xs text-muted-foreground">
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
            <Label htmlFor="platform" className="flex items-center gap-1">
              Platform
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </Label>
            <Select
              value={formData.platform}
              onValueChange={(v) =>
                setFormData({ ...formData, platform: v as "android" | "ios" })
              }
            >
              <SelectTrigger id="platform" aria-describedby="platform-hint">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="android">
                  <div className="flex items-center gap-2">
                    <img
                      src={PLATFORM_CONFIG.android.image}
                      alt={PLATFORM_CONFIG.android.label}
                      className="w-5 h-5 object-contain"
                    />
                    {PLATFORM_CONFIG.android.label}
                  </div>
                </SelectItem>
                <SelectItem value="ios">
                  <div className="flex items-center gap-2">
                    <img
                      src={PLATFORM_CONFIG.ios.image}
                      alt={PLATFORM_CONFIG.ios.label}
                      className="w-5 h-5 object-contain"
                    />
                    {PLATFORM_CONFIG.ios.label}
                  </div>
                </SelectItem>
                <SelectItem value="windows" disabled>
                  <div className="flex items-center gap-2">
                    <img
                      src={PLATFORM_CONFIG.windows.image}
                      alt={PLATFORM_CONFIG.windows.label}
                      className="w-5 h-5 object-contain opacity-50"
                    />
                    {PLATFORM_CONFIG.windows.label}
                    <span className="text-xs text-muted-foreground ml-1">
                      (Coming soon)
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p id="platform-hint" className="text-xs text-muted-foreground">
              Select the target device platform
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              Description
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only">(required)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this profile..."
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={() => handleBlur("description")}
              aria-invalid={touched.description && !!errors.description}
              aria-describedby={
                errors.description ? "description-error" : "description-hint"
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
                  id="description-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.description}
                </p>
              ) : (
                <p
                  id="description-hint"
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
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
