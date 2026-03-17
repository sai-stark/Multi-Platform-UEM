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
import { Textarea } from "@/components/ui/textarea";
import { getAssetUrl } from "@/config/env";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { Platform, Profile } from "@/types/models";
import { getErrorMessage } from "@/utils/errorUtils";
import { Copy } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Platform configuration with asset images
const PLATFORM_CONFIG: Record<string, { label: string; image: string }> = {
  android: {
    label: "Android",
    image: getAssetUrl("/Assets/android.svg"),
  },
  ios: {
    label: "iOS",
    image: getAssetUrl("/Assets/apple.svg"),
  },
  windows: {
    label: "Windows",
    image: getAssetUrl("/Assets/microsoft.svg"),
  },
};

interface CloneProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileCloned: () => void;
  profile: Profile | null;
}

// Validation constants from OpenAPI spec
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 30;
const NAME_PATTERN = /^[a-zA-Z0-9\- ]{3,30}$/;

const DESC_MIN_LENGTH = 5;
const DESC_MAX_LENGTH = 100;
const DESC_PATTERN = /^[a-zA-Z0-9\- ]{5,100}$/;

interface FormErrors {
  name?: string;
  description?: string;
}

interface FormData {
  name: string;
  description: string;
}

// Constants for profile readiness polling
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 500;

export function CloneProfileDialog({
  open,
  onOpenChange,
  onProfileCloned,
  profile,
}: CloneProfileDialogProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Poll the profile API until it returns valid data
  const waitForProfileReady = useCallback(
    async (platform: string, profileId: string): Promise<boolean> => {
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        try {
          const fetchedProfile = await ProfileService.getProfile(
            platform as Platform,
            profileId
          );
          if (fetchedProfile && fetchedProfile.id) {
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

  // Initialize form with profile data when dialog opens
  useEffect(() => {
    if (open && profile) {
      setFormData({
        name: `${profile.name} Clone`.substring(0, NAME_MAX_LENGTH),
        description: `${profile.description} Clone`.substring(0, DESC_MAX_LENGTH),
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
      description: validateDescription(formData.description),
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
        description: validateDescription(formData.description),
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

    if (!profile) return;

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

    setLoading(true);
    try {
      const clonedProfile = await ProfileService.cloneProfile(
        profile.platform as Platform,
        profile.id!,
        {
          name: formData.name,
          description: formData.description,
        }
      );

      toast({
        title: "Profile Cloned",
        description: `Profile "${formData.name}" has been cloned successfully.`,
      });

      onProfileCloned();
      setLoading(false);

      // Navigate to the cloned profile
      if (clonedProfile?.id) {
        // Show preparing state while waiting for profile to be ready
        setPreparing(true);

        // Wait for profile to be available in the API
        await waitForProfileReady(profile.platform!, clonedProfile.id);

        setPreparing(false);
        onOpenChange(false);
        resetForm();

        navigate(`/profiles/${profile.platform}/${clonedProfile.id}`);
      } else {
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to clone profile:", error);
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to clone profile. Please try again."),
        variant: "destructive",
      });
      setLoading(false);
      setPreparing(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
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

  const platformConfig = profile?.platform
    ? PLATFORM_CONFIG[profile.platform.toLowerCase()]
    : null;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        {preparing ? (
          <div className="py-4">
            <LoadingAnimation message="Preparing cloned profile..." />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5" />
                {t('profiles.clone.title')}
              </DialogTitle>
              <DialogDescription>
                {t('profiles.clone.description')} "{profile?.name}"
              </DialogDescription>
            </DialogHeader>

            {/* Platform indicator */}
            {platformConfig && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <img
                  src={platformConfig.image}
                  alt={platformConfig.label}
                  className="w-5 h-5 object-contain"
                />
                <span className="text-sm text-muted-foreground">
                  {platformConfig.label} Profile
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="clone-name" className="flex items-center gap-1">
                  {t('profiles.clone.newName')}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only">({t('common.required')})</span>
                </Label>
                <Input
                  id="clone-name"
                  placeholder={t('profiles.add.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={() => handleBlur("name")}
                  aria-invalid={touched.name && !!errors.name}
                  aria-describedby={errors.name ? "clone-name-error" : "clone-name-hint"}
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
                      id="clone-name-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.name}
                    </p>
                  ) : (
                    <p id="clone-name-hint" className="text-xs text-muted-foreground">
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
                <Label htmlFor="clone-description" className="flex items-center gap-1">
                  {t('profiles.add.profileDescription')}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only">({t('common.required')})</span>
                </Label>
                <Textarea
                  id="clone-description"
                  placeholder={t('profiles.add.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  onBlur={() => handleBlur("description")}
                  aria-invalid={touched.description && !!errors.description}
                  aria-describedby={
                    errors.description ? "clone-description-error" : "clone-description-hint"
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
                      id="clone-description-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.description}
                    </p>
                  ) : (
                    <p
                      id="clone-description-hint"
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
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('profiles.clone.cloning') : t('profiles.clone.clone')}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
