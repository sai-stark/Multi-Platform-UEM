import { PolicyService } from '@/api/services/policies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PasscodeRestrictionPolicy } from '@/types/models';
import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';

interface PasscodePolicyProps {
    profileId: string;
    initialData?: PasscodeRestrictionPolicy;
    onSave: () => void;
    onCancel: () => void;
}

export function PasscodePolicy({ profileId, initialData, onSave, onCancel }: PasscodePolicyProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<PasscodeRestrictionPolicy>({
        minLength: 4,
        requireAlphanumeric: false,
        maxFailedAttempts: 10,
        ...initialData // Override defaults with initialData if present
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                // If we have an ID, it implies update, but PolicyService usually updates by profileId and policy type endpoint
                // checking services: updatePasscodeRestriction(profileId, policy)
                await PolicyService.updatePasscodeRestriction(profileId, formData);
            } else {
                await PolicyService.createPasscodeRestriction(profileId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save passcode policy:', error);
            // Toast here
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Passcode Settings</h3>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="minLength" className="text-right">
                            Min Length
                        </Label>
                        <Input
                            id="minLength"
                            type="number"
                            min={4}
                            max={16}
                            value={formData.minLength}
                            onChange={(e) => setFormData({ ...formData, minLength: parseInt(e.target.value) || 4 })}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maxFailedAttempts" className="text-right">
                            Max Failed Attempts
                        </Label>
                        <Input
                            id="maxFailedAttempts"
                            type="number"
                            min={0}
                            max={10}
                            value={formData.maxFailedAttempts}
                            onChange={(e) => setFormData({ ...formData, maxFailedAttempts: parseInt(e.target.value) || 0 })}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="requireAlphanumeric" className="text-right">
                            Alphanumeric
                        </Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Switch
                                id="requireAlphanumeric"
                                checked={formData.requireAlphanumeric}
                                onCheckedChange={(checked) => setFormData({ ...formData, requireAlphanumeric: checked })}
                            />
                            <Label htmlFor="requireAlphanumeric" className="font-normal text-muted-foreground">
                                Require both letters and numbers
                            </Label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Policy
                </Button>
            </div>
        </form>
    );
}
