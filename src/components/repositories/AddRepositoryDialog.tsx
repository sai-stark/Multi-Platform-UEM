import { RepositoryService } from "@/api/services/repository";
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
import { toast } from "@/hooks/use-toast";
import { Platform, CustomRepository, RepoType } from "@/types/models";
import { useEffect, useState } from "react";

interface AddRepositoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRepositoryAdded: () => void;
  defaultPlatform?: Platform;
}

interface FormErrors {
  name?: string;
  components?: string;
  architectures?: string;
}

interface FormData {
  name: string;
  components: string[];
  architectures: string[];
  componentInput: string;
  architectureInput: string;
}

// Map platform to repository type
const PLATFORM_TO_REPO_TYPE: Record<Platform, RepoType> = {
  android: "CustomAndroidFileRepo",
  windows: "CustomWindowsRepo",
  linux: "CustomUbuntuRepo", // Default for Linux, can be changed to CustomRpmRepo
  macos: "CustomMacOsFileRepo",
  ios: "CustomCommonFileRepo", // Not used but for completeness
};

const COMPONENT_OPTIONS = ["main", "restricted", "universe", "multiverse"];
const ARCHITECTURE_OPTIONS = ["amd64", "arm64", "i386", "armhf"];

export function AddRepositoryDialog({
  open,
  onOpenChange,
  onRepositoryAdded,
  defaultPlatform = "linux",
}: AddRepositoryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<Platform>(defaultPlatform);
  const [repoType, setRepoType] = useState<RepoType>(
    PLATFORM_TO_REPO_TYPE[defaultPlatform]
  );
  const [formData, setFormData] = useState<FormData>({
    name: "",
    components: [],
    architectures: [],
    componentInput: "",
    architectureInput: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setPlatform(defaultPlatform);
      setRepoType(PLATFORM_TO_REPO_TYPE[defaultPlatform]);
      setFormData({
        name: "",
        components: [],
        architectures: [],
        componentInput: "",
        architectureInput: "",
      });
      setErrors({});
    }
  }, [open, defaultPlatform]);

  // Update repoType when platform changes
  useEffect(() => {
    if (platform === "linux") {
      // Default to Ubuntu for Linux, user can change
      setRepoType("CustomUbuntuRepo");
    } else {
      setRepoType(PLATFORM_TO_REPO_TYPE[platform]);
    }
  }, [platform]);

  const validateName = (value: string): string | undefined => {
    if (!value || value.trim() === "") {
      return "Repository name is required";
    }
    if (value.trim().length < 3) {
      return "Repository name must be at least 3 characters";
    }
    if (value.trim().length > 100) {
      return "Repository name must be less than 100 characters";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const nameError = validateName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    // Validate Ubuntu-specific fields
    if (repoType === "CustomUbuntuRepo") {
      if (formData.components.length === 0) {
        newErrors.components = "At least one component is required";
      }
      if (formData.architectures.length === 0) {
        newErrors.architectures = "At least one architecture is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddComponent = () => {
    if (
      formData.componentInput &&
      !formData.components.includes(formData.componentInput)
    ) {
      setFormData({
        ...formData,
        components: [...formData.components, formData.componentInput],
        componentInput: "",
      });
      setErrors({ ...errors, components: undefined });
    }
  };

  const handleRemoveComponent = (component: string) => {
    setFormData({
      ...formData,
      components: formData.components.filter((c) => c !== component),
    });
  };

  const handleAddArchitecture = () => {
    if (
      formData.architectureInput &&
      !formData.architectures.includes(formData.architectureInput)
    ) {
      setFormData({
        ...formData,
        architectures: [...formData.architectures, formData.architectureInput],
        architectureInput: "",
      });
      setErrors({ ...errors, architectures: undefined });
    }
  };

  const handleRemoveArchitecture = (arch: string) => {
    setFormData({
      ...formData,
      architectures: formData.architectures.filter((a) => a !== arch),
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const repository: CustomRepository = {
        repoType,
        name: formData.name.trim(),
      };

      // Add platform-specific data
      if (repoType === "CustomUbuntuRepo") {
        repository.customUbuntuRepo = {
          id: "", // Will be generated by backend
          name: formData.name.trim(),
          components: formData.components,
          architectures: formData.architectures,
        };
      } else if (repoType === "CustomRpmRepo") {
        repository.customRpmRepo = {
          id: "", // Will be generated by backend
          name: formData.name.trim(),
        };
      }

      await RepositoryService.createCustomRepository(platform, repository);

      toast({
        title: "Repository Created",
        description: `Repository "${formData.name}" has been created successfully.`,
      });

      onOpenChange(false);
      onRepositoryAdded();
    } catch (error: any) {
      console.error("Error creating repository:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to create repository. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isUbuntuRepo = repoType === "CustomUbuntuRepo";
  const isRpmRepo = repoType === "CustomRpmRepo";
  const showLinuxOptions = platform === "linux";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Repository</DialogTitle>
          <DialogDescription>
            Add a new custom software repository for your devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">
              Platform <span className="text-destructive">*</span>
            </Label>
            <Select
              value={platform}
              onValueChange={(value) => setPlatform(value as Platform)}
            >
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="windows">Windows</SelectItem>
                <SelectItem value="linux">Linux</SelectItem>
                <SelectItem value="macos">macOS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Repository Type (only for Linux) */}
          {showLinuxOptions && (
            <div className="space-y-2">
              <Label htmlFor="repoType">
                Repository Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={repoType}
                onValueChange={(value) => setRepoType(value as RepoType)}
              >
                <SelectTrigger id="repoType">
                  <SelectValue placeholder="Select repository type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CustomUbuntuRepo">Ubuntu (APT)</SelectItem>
                  <SelectItem value="CustomRpmRepo">RPM (YUM/DNF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Repository Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Repository Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Corporate Software Repository"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              onBlur={() => {
                const error = validateName(formData.name);
                if (error) {
                  setErrors({ ...errors, name: error });
                }
              }}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          {/* Ubuntu-specific fields */}
          {isUbuntuRepo && (
            <>
              {/* Components */}
              <div className="space-y-2">
                <Label htmlFor="components">
                  Components <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.componentInput}
                    onValueChange={(value) =>
                      setFormData({ ...formData, componentInput: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select component" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPONENT_OPTIONS.map((comp) => (
                        <SelectItem key={comp} value={comp}>
                          {comp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddComponent}
                    disabled={!formData.componentInput}
                  >
                    Add
                  </Button>
                </div>
                {formData.components.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.components.map((comp) => (
                      <span
                        key={comp}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
                      >
                        {comp}
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(comp)}
                          className="hover:text-destructive"
                          aria-label={`Remove ${comp}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.components && (
                  <p className="text-sm text-destructive">{errors.components}</p>
                )}
              </div>

              {/* Architectures */}
              <div className="space-y-2">
                <Label htmlFor="architectures">
                  Architectures <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.architectureInput}
                    onValueChange={(value) =>
                      setFormData({ ...formData, architectureInput: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select architecture" />
                    </SelectTrigger>
                    <SelectContent>
                      {ARCHITECTURE_OPTIONS.map((arch) => (
                        <SelectItem key={arch} value={arch}>
                          {arch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddArchitecture}
                    disabled={!formData.architectureInput}
                  >
                    Add
                  </Button>
                </div>
                {formData.architectures.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.architectures.map((arch) => (
                      <span
                        key={arch}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
                      >
                        {arch}
                        <button
                          type="button"
                          onClick={() => handleRemoveArchitecture(arch)}
                          className="hover:text-destructive"
                          aria-label={`Remove ${arch}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.architectures && (
                  <p className="text-sm text-destructive">
                    {errors.architectures}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
