import { PolicyService } from '@/api/services/IOSpolicies';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { IosMdmConfiguration } from '@/types/ios';
import { getErrorMessage } from '@/utils/errorUtils';
import { Edit, Server, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface MdmPolicyProps {
    profileId: string;
    initialData?: IosMdmConfiguration;
    onSave: () => void;
    onCancel: () => void;
}

const defaultMdmConfig: Partial<IosMdmConfiguration> = {
    policyType: 'IosMdmConfiguration',
    identityCertificateUUID: '',
    topic: 'com.apple.mgmt.',
    serverURL: 'https://',
    checkInURL: '',
    signMessage: false,
    accessRights: 8191,
    useDevelopmentAPNS: false,
    pinningRevocationCheckRequired: false,
};

export function MdmPolicy({ profileId, initialData, onSave, onCancel }: MdmPolicyProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    // If we have an ID, start in view mode. Otherwise, start in edit mode.
    const [isEditing, setIsEditing] = useState(!initialData?.id);
    const [formData, setFormData] = useState<Partial<IosMdmConfiguration>>(
        initialData || defaultMdmConfig
    );
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleChange = <K extends keyof IosMdmConfiguration>(field: K, value: IosMdmConfiguration[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.identityCertificateUUID?.trim()) {
            toast({ title: "Validation Error", description: "Identity Certificate UUID is required", variant: "destructive" });
            return;
        }
        if (!formData.topic?.trim() || !formData.topic.startsWith('com.apple.mgmt.')) {
            toast({ title: "Validation Error", description: "Topic must begin with 'com.apple.mgmt.'", variant: "destructive" });
            return;
        }
        if (!formData.serverURL?.trim() || !formData.serverURL.startsWith('https://')) {
            toast({ title: "Validation Error", description: "Server URL is required and must use HTTPS", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            // Use update if policy already has an ID (editing), otherwise create
            if (initialData?.id) {
                await PolicyService.updateMdmPolicy(profileId, formData as IosMdmConfiguration);
                toast({ title: "Success", description: "MDM configuration updated successfully" });
            } else {
                await PolicyService.createMdmPolicy(profileId, formData as IosMdmConfiguration);
                toast({ title: "Success", description: "MDM configuration created successfully" });
            }
            onSave();
        } catch (error) {
            console.error("Failed to save MDM policy", error);
            toast({ title: "Error", description: getErrorMessage(error, "Failed to save MDM configuration"), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;

        setLoading(true);
        try {
            await PolicyService.deleteMdmPolicy(profileId);
            toast({ title: "Success", description: "MDM configuration deleted successfully" });
            onSave(); // Refresh the parent
        } catch (error) {
            console.error("Failed to delete MDM policy", error);
            toast({ title: "Error", description: getErrorMessage(error, "Failed to delete MDM configuration"), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = () => {
        if (isEditing && initialData?.id) {
            setIsEditing(false);
            setFormData(initialData); // Reset to initial
        } else {
            onCancel();
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/20 rounded-full border border-muted-foreground/20">
                        <Server className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">MDM Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                            {formData.serverURL ? `Server: ${formData.serverURL}` : 'Configure MDM Server'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    {initialData?.id && (
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="p-4 rounded-xl border bg-card space-y-4 shadow-sm">
                        <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                            <Server className="w-4 h-4" /> Server Details
                        </h4>
                        <div className="grid grid-cols-1 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs">Server URL</span>
                                <span className="font-medium break-all">{formData.serverURL || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Topic</span>
                                <span className="font-medium">{formData.topic || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs">Identity Cert UUID</span>
                                <span className="font-medium font-mono text-xs break-all">{formData.identityCertificateUUID || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-4 rounded-xl border bg-card space-y-4 shadow-sm">
                        <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                            Advanced Config
                        </h4>
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="text-muted-foreground block text-xs">Sign Message</span>
                                    <span className="font-medium">{formData.signMessage ? 'Yes' : 'No'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">Development APNS</span>
                                    <span className="font-medium">{formData.useDevelopmentAPNS ? 'Yes' : 'No'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">Revocation Check</span>
                                    <span className="font-medium">{formData.pinningRevocationCheckRequired ? 'Yes' : 'No'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">Access Rights</span>
                                    <span className="font-medium">{formData.accessRights || '-'}</span>
                                </div>
                            </div>
                            {formData.checkInURL && (
                                <div className="mt-2 pt-2 border-t border-dashed">
                                    <span className="text-muted-foreground block text-xs">Check-in URL</span>
                                    <span className="font-medium break-all">{formData.checkInURL}</span>
                                </div>
                            )}
                            {formData.enrollmentMode && (
                                <div className="mt-2 pt-2 border-t border-dashed">
                                    <span className="text-muted-foreground block text-xs">Enrollment Mode</span>
                                    <span className="font-medium">{formData.enrollmentMode}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onCancel}>{t('common.close')}</Button>
            </div>
        </div>
    );

    if (!isEditing) {
        return renderView();
    }

    return (
        <div className="space-y-6 max-w-4xl mt-6 pb-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/20 rounded-full border border-muted-foreground/20">
                        <Edit className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit MDM Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                            Update Apple MDM Server settings
                        </p>
                    </div>
                </div>
            </div>

            {/* Basic Settings */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Required Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="serverURL">Server URL <span className="text-destructive">*</span></Label>
                        <Input
                            id="serverURL"
                            type="url"
                            placeholder="https://mdm.company.com/server"
                            value={formData.serverURL || ''}
                            onChange={(e) => handleChange('serverURL', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">The URL that the device contacts to retrieve device management instructions (must use HTTPS).</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="topic">Topic <span className="text-destructive">*</span></Label>
                        <Input
                            id="topic"
                            placeholder="com.apple.mgmt."
                            value={formData.topic || ''}
                            onChange={(e) => handleChange('topic', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Must begin with 'com.apple.mgmt.'</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="identityCertificateUUID">Identity Certificate UUID <span className="text-destructive">*</span></Label>
                        <Input
                            id="identityCertificateUUID"
                            placeholder="e.g. 52A50130-976E-4011-8FC8-1A011110CC5E"
                            value={formData.identityCertificateUUID || ''}
                            onChange={(e) => handleChange('identityCertificateUUID', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">UUID of the certificate payload for the device's identity.</p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Advanced Settings Toggle */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Advanced Settings</h3>
                    <Checkbox
                        id="showAdvanced"
                        checked={showAdvanced}
                        onCheckedChange={(checked) => setShowAdvanced(checked as boolean)}
                    />
                    <Label htmlFor="showAdvanced" className="cursor-pointer text-sm">Show Advanced Options</Label>
                </div>

                {showAdvanced && (
                    <div className="space-y-4 pl-4 border-l-2 border-muted animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="checkInURL">Check-In URL</Label>
                                <Input
                                    id="checkInURL"
                                    type="url"
                                    placeholder="https://mdm.company.com/checkin"
                                    value={formData.checkInURL || ''}
                                    onChange={(e) => handleChange('checkInURL', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="accessRights">Access Rights (Bitmask)</Label>
                                    <Input
                                        id="accessRights"
                                        type="number"
                                        min={1}
                                        max={8191}
                                        value={formData.accessRights || 8191}
                                        onChange={(e) => handleChange('accessRights', parseInt(e.target.value) || undefined)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="enrollmentMode">Enrollment Mode</Label>
                                    <Select
                                        value={formData.enrollmentMode || 'none'}
                                        onValueChange={(val) => handleChange('enrollmentMode', val === 'none' ? undefined : val as 'BYOD' | 'ADDE')}
                                    >
                                        <SelectTrigger id="enrollmentMode">
                                            <SelectValue placeholder="Select mode..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="BYOD">BYOD (Bring Your Own Device)</SelectItem>
                                            <SelectItem value="ADDE">ADDE (Account-Driven Enrollment)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formData.enrollmentMode === 'ADDE' && (
                                <div className="space-y-2">
                                    <Label htmlFor="assignedManagedAppleID">Assigned Managed Apple ID</Label>
                                    <Input
                                        id="assignedManagedAppleID"
                                        placeholder="user@managed.apple.com"
                                        value={formData.assignedManagedAppleID || ''}
                                        onChange={(e) => handleChange('assignedManagedAppleID', e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-2 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="signMessage"
                                        checked={formData.signMessage ?? false}
                                        onCheckedChange={(checked) => handleChange('signMessage', checked as boolean)}
                                    />
                                    <Label htmlFor="signMessage" className="cursor-pointer">
                                        Sign Messages (adds Mdm-Signature header)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="useDevelopmentAPNS"
                                        checked={formData.useDevelopmentAPNS ?? false}
                                        onCheckedChange={(checked) => handleChange('useDevelopmentAPNS', checked as boolean)}
                                    />
                                    <Label htmlFor="useDevelopmentAPNS" className="cursor-pointer">
                                        Use Development APNS Server
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pinningRevocationCheckRequired"
                                        checked={formData.pinningRevocationCheckRequired ?? false}
                                        onCheckedChange={(checked) => handleChange('pinningRevocationCheckRequired', checked as boolean)}
                                    />
                                    <Label htmlFor="pinningRevocationCheckRequired" className="cursor-pointer">
                                        Require Pinning Certificate Revocation Check
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <CardFooter className="flex justify-end gap-2 px-0 pt-6">
                <Button variant="outline" onClick={handleCancelClick} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save MDM Configuration'}
                </Button>
            </CardFooter>
        </div>
    );
}
