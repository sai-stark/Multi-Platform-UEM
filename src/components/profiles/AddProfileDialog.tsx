import { ProfileService } from '@/api/services/profiles';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Platform, Profile } from '@/types/models';
import { Apple, Layout, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface AddProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProfileAdded: () => void;
}

export function AddProfileDialog({ open, onOpenChange, onProfileAdded }: AddProfileDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Profile>>({
        name: '',
        description: '',
        platform: 'android',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.platform) return;

        setLoading(true);
        try {
            await ProfileService.createProfile(formData.platform, formData as Profile);
            onProfileAdded();
            onOpenChange(false);
            setFormData({ name: '', description: '', platform: 'android' }); // Reset
        } catch (error) {
            console.error('Failed to create profile:', error);
            // Ideally show a toast here
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-background">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layout className="w-5 h-5" />
                        Create New Profile
                    </DialogTitle>
                    <DialogDescription>
                        Create a new device profile to apply policies and configurations.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Profile Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Corporate Android Policy"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <Select
                            value={formData.platform}
                            onValueChange={(v) => setFormData({ ...formData, platform: v as Platform })}
                        >
                            <SelectTrigger id="platform">
                                <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                <SelectItem value="android">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-success" />
                                        Android
                                    </div>
                                </SelectItem>
                                <SelectItem value="ios">
                                    <div className="flex items-center gap-2">
                                        <Apple className="w-4 h-4 text-muted-foreground" />
                                        iOS
                                    </div>
                                </SelectItem>
                                <SelectItem value="windows">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="w-4 h-4 text-info" />
                                        Windows
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the purpose of this profile..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Profile'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
