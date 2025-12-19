import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Smartphone, Monitor, Apple } from 'lucide-react';

type Platform = 'all' | 'android' | 'ios' | 'windows';

interface AddApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: Platform;
}

export function AddApplicationDialog({ open, onOpenChange, platform }: AddApplicationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    packageName: '',
    version: '',
    category: '',
    description: '',
    // Android specific
    apkUrl: '',
    minSdkVersion: '',
    // iOS specific
    bundleId: '',
    appStoreUrl: '',
    // Windows specific
    msiUrl: '',
    silentInstall: false,
  });

  const getPlatformIcon = () => {
    switch (platform) {
      case 'android':
        return <Smartphone className="w-5 h-5 text-success" />;
      case 'ios':
        return <Apple className="w-5 h-5 text-muted-foreground" />;
      case 'windows':
        return <Monitor className="w-5 h-5 text-info" />;
      default:
        return <Smartphone className="w-5 h-5 text-primary" />;
    }
  };

  const getPlatformTitle = () => {
    switch (platform) {
      case 'android':
        return 'Android Application';
      case 'ios':
        return 'iOS Application';
      case 'windows':
        return 'Windows Application';
      default:
        return 'Application';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Submitting:', { platform, ...formData });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPlatformIcon()}
            Add {getPlatformTitle()}
          </DialogTitle>
          <DialogDescription>
            {platform === 'all' 
              ? 'Add a new application to your managed catalog.'
              : `Configure a new ${getPlatformTitle()} for deployment.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Application Name</Label>
              <Input
                id="name"
                placeholder="e.g., Microsoft Teams"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="e.g., 1.0.0"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Specific Fields */}
          {(platform === 'android' || platform === 'all') && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-success" />
                Android Configuration
              </h4>
              <div className="space-y-2">
                <Label htmlFor="packageName">Package Name</Label>
                <Input
                  id="packageName"
                  placeholder="com.example.app"
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apkUrl">APK URL</Label>
                  <Input
                    id="apkUrl"
                    placeholder="https://..."
                    value={formData.apkUrl}
                    onChange={(e) => setFormData({ ...formData, apkUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minSdk">Min SDK Version</Label>
                  <Input
                    id="minSdk"
                    placeholder="21"
                    value={formData.minSdkVersion}
                    onChange={(e) => setFormData({ ...formData, minSdkVersion: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {(platform === 'ios' || platform === 'all') && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Apple className="w-4 h-4" />
                iOS Configuration
              </h4>
              <div className="space-y-2">
                <Label htmlFor="bundleId">Bundle ID</Label>
                <Input
                  id="bundleId"
                  placeholder="com.example.app"
                  value={formData.bundleId}
                  onChange={(e) => setFormData({ ...formData, bundleId: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appStoreUrl">App Store URL</Label>
                <Input
                  id="appStoreUrl"
                  placeholder="https://apps.apple.com/..."
                  value={formData.appStoreUrl}
                  onChange={(e) => setFormData({ ...formData, appStoreUrl: e.target.value })}
                />
              </div>
            </div>
          )}

          {(platform === 'windows' || platform === 'all') && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Monitor className="w-4 h-4 text-info" />
                Windows Configuration
              </h4>
              <div className="space-y-2">
                <Label htmlFor="msiUrl">MSI/EXE URL</Label>
                <Input
                  id="msiUrl"
                  placeholder="https://..."
                  value={formData.msiUrl}
                  onChange={(e) => setFormData({ ...formData, msiUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="silentInstall"
                  checked={formData.silentInstall}
                  onChange={(e) => setFormData({ ...formData, silentInstall: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="silentInstall" className="text-sm font-normal">
                  Enable silent installation
                </Label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the application..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
