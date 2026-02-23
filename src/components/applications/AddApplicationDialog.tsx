import { ApplicationService } from "@/api/services/applications";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Platform } from "@/types/models";
import { getErrorMessage } from "@/utils/errorUtils";
import { Package, Upload, X, FileArchive, Link, Store, Clock } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface AddApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplicationAdded: () => void;
  platform: Platform;
}

type UploadType = 'apkFile' | 'apkUrl' | 'playStoreUrl';

interface FormData {
  file: File | null;
  apkUrl: string;
  playStoreUrl: string;
  uploadType: UploadType;
}

interface FormErrors {
  file?: string;
  apkUrl?: string;
  playStoreUrl?: string;
}

export function AddApplicationDialog({
  open,
  onOpenChange,
  onApplicationAdded,
  platform,
}: AddApplicationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    file: null,
    apkUrl: "",
    playStoreUrl: "",
    uploadType: 'apkFile',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File | null): string | undefined => {
    if (!file) {
      return "Please select an APK file to upload";
    }
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size must be less than 500MB";
    }
    return undefined;
  };

  const validateUrl = (url: string, type: 'apk' | 'playStore'): string | undefined => {
    if (!url || url.trim() === "") {
      return type === 'apk' ? "APK URL is required" : "Play Store URL is required";
    }
    try {
      new URL(url);
    } catch {
      return "Please enter a valid URL";
    }
    if (type === 'playStore' && !url.includes('play.google.com')) {
      return "Please enter a valid Google Play Store URL";
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.uploadType === 'apkFile') {
      newErrors.file = validateFile(formData.file);
    } else if (formData.uploadType === 'apkUrl') {
      newErrors.apkUrl = validateUrl(formData.apkUrl, 'apk');
    } else if (formData.uploadType === 'playStoreUrl') {
      newErrors.playStoreUrl = validateUrl(formData.playStoreUrl, 'playStore');
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched({ ...touched, [field]: true });

    if (field === "apkUrl") {
      setErrors({ ...errors, apkUrl: validateUrl(formData.apkUrl, 'apk') });
    } else if (field === "playStoreUrl") {
      setErrors({ ...errors, playStoreUrl: validateUrl(formData.playStoreUrl, 'playStore') });
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setFormData({ ...formData, file });
      setErrors({ ...errors, file: undefined });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeFile = () => {
    setFormData({ ...formData, file: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ file: true, apkUrl: true, playStoreUrl: true });

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
      let uploadData: FormData | Record<string, any>;

      if (formData.uploadType === 'apkFile') {
        // File upload
        const formDataObj = new FormData();
        if (formData.file) {
          formDataObj.append('apkFile', formData.file);
        }
        uploadData = formDataObj as any;
      } else if (formData.uploadType === 'apkUrl') {
        // APK URL
        uploadData = {
          apkUrl: formData.apkUrl,
        };
      } else {
        // Play Store URL
        uploadData = {
          playStoreUrl: formData.playStoreUrl,
        };
      }

      await ApplicationService.createApplication(platform, uploadData as any);

      toast({
        title: "Application Added",
        description: "Application has been added successfully.",
      });

      onApplicationAdded();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to add application:", error);
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to add application. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      file: null,
      apkUrl: "",
      playStoreUrl: "",
      uploadType: 'apkFile',
    });
    setErrors({});
    setTouched({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show "Coming Soon" for non-Android platforms
  if (platform !== 'android') {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[450px] bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Add Application
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-12 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Application upload for {platform.charAt(0).toUpperCase() + platform.slice(1)} is not yet available.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Currently only Android applications are supported.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add Android Application
          </DialogTitle>
          <DialogDescription>
            Upload an APK file, provide a URL, or add from Play Store.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Upload Type Tabs */}
          <Tabs 
            value={formData.uploadType} 
            onValueChange={(v) => setFormData({ ...formData, uploadType: v as UploadType })}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="apkFile" className="gap-2">
                <Upload className="w-4 h-4" />
                APK File
              </TabsTrigger>
              <TabsTrigger value="apkUrl" className="gap-2">
                <Link className="w-4 h-4" />
                APK URL
              </TabsTrigger>
              <TabsTrigger value="playStoreUrl" className="gap-2">
                <Store className="w-4 h-4" />
                Play Store
              </TabsTrigger>
            </TabsList>

            {/* APK File Upload */}
            <TabsContent value="apkFile" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  APK File
                  <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                
                {!formData.file ? (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                      touched.file && errors.file && "border-destructive"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Drag & drop your APK or AAB file here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse (max 500MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".apk,.aab"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                    <FileArchive className="w-10 h-10 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{formData.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(formData.file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {touched.file && errors.file && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.file}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Application name and details will be extracted from the APK.
                </p>
              </div>
            </TabsContent>

            {/* APK URL */}
            <TabsContent value="apkUrl" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="apk-url" className="flex items-center gap-1">
                  APK Download URL
                  <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <Input
                  id="apk-url"
                  type="url"
                  placeholder="https://example.com/app.apk"
                  value={formData.apkUrl}
                  onChange={(e) => setFormData({ ...formData, apkUrl: e.target.value })}
                  onBlur={() => handleBlur("apkUrl")}
                  aria-invalid={touched.apkUrl && !!errors.apkUrl}
                  className={touched.apkUrl && errors.apkUrl ? "border-destructive" : ""}
                />
                {touched.apkUrl && errors.apkUrl && (
                  <p className="text-sm text-destructive" role="alert">{errors.apkUrl}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Direct URL to the APK file. The server will download and extract app details.
                </p>
              </div>
            </TabsContent>

            {/* Play Store URL */}
            <TabsContent value="playStoreUrl" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="playstore-url" className="flex items-center gap-1">
                  Google Play Store URL
                  <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <Input
                  id="playstore-url"
                  type="url"
                  placeholder="https://play.google.com/store/apps/details?id=com.example.app"
                  value={formData.playStoreUrl}
                  onChange={(e) => setFormData({ ...formData, playStoreUrl: e.target.value })}
                  onBlur={() => handleBlur("playStoreUrl")}
                  aria-invalid={touched.playStoreUrl && !!errors.playStoreUrl}
                  className={touched.playStoreUrl && errors.playStoreUrl ? "border-destructive" : ""}
                />
                {touched.playStoreUrl && errors.playStoreUrl && (
                  <p className="text-sm text-destructive" role="alert">{errors.playStoreUrl}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  App metadata will be fetched automatically from the Play Store.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>Adding...</>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Add Application
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
