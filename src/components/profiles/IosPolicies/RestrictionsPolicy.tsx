
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    ConnectivityRestriction,
    LocationRestriction,
    MiscellaneousRestriction,
    SecurityRestriction,
    SyncStorageRestriction
} from '@/types/models';
import { Ban, Edit } from 'lucide-react';
import { useState } from 'react';

// Composite interface for the editor
export interface RestrictionsComposite {
    security?: SecurityRestriction;
    connectivity?: ConnectivityRestriction;
    storage?: SyncStorageRestriction;
    location?: LocationRestriction;
    misc?: MiscellaneousRestriction;
}

interface RestrictionsPolicyProps {
    profileId: string;
    initialData?: RestrictionsComposite;
    onSave: (data: RestrictionsComposite) => void;
    onCancel: () => void;
}

export function RestrictionsPolicy({ profileId, initialData, onSave, onCancel }: RestrictionsPolicyProps) {
    // If we have an ID or any set data, start in view mode.
    // However, RestrictionsComposite doesn't have an ID itself. We check if initialData is provided.
    // Let's assume if initialData is provided, it's view mode.
    const [isEditing, setIsEditing] = useState(!initialData);
    const [data, setData] = useState<RestrictionsComposite>(
        initialData || {
            security: { allowCamera: true, allowScreenCapture: true },
            connectivity: { allowBluetooth: true },
            storage: { allowUsbMassStorage: true },
            location: { forceGps: false },
            misc: { allowFactoryReset: false },
        }
    );

    const updateSecurity = (field: keyof SecurityRestriction, value: boolean) => {
        setData(prev => ({
            ...prev,
            security: { ...prev.security, [field]: value }
        }));
    };

    const updateConnectivity = (value: boolean) => {
        setData(prev => ({
            ...prev,
            connectivity: { ...prev.connectivity, allowBluetooth: value }
        }));
    };

    const updateStorage = (value: boolean) => {
        setData(prev => ({
            ...prev,
            storage: { ...prev.storage, allowUsbMassStorage: value }
        }));
    };
    const updateLocation = (value: boolean) => {
        setData(prev => ({
            ...prev,
            location: { ...prev.location, forceGps: value }
        }));
    };

    const updateMisc = (value: boolean) => {
        setData(prev => ({
            ...prev,
            misc: { ...prev.misc, allowFactoryReset: value }
        }));
    };


    const handleCancelClick = () => {
        if (isEditing && initialData) {
            setIsEditing(false);
            setData(initialData); // Reset
        } else {
            onCancel();
        }
    };

    const renderView = () => (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 rounded-full">
                        <Ban className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Device Restrictions</h3>
                        <p className="text-sm text-muted-foreground">
                            Control device features and functionality
                        </p>
                    </div>
                </div>
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Restrictions
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl border bg-card space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider border-b pb-2">Security</h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span>Camera</span>
                            <span className={data.security?.allowCamera ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                {data.security?.allowCamera ? 'Allowed' : 'Blocked'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Screen Capture</span>
                            <span className={data.security?.allowScreenCapture ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                {data.security?.allowScreenCapture ? 'Allowed' : 'Blocked'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider border-b pb-2">Connectivity</h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span>Bluetooth</span>
                            <span className={data.connectivity?.allowBluetooth ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                {data.connectivity?.allowBluetooth ? 'Allowed' : 'Blocked'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>USB Storage</span>
                            <span className={data.storage?.allowUsbMassStorage ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                {data.storage?.allowUsbMassStorage ? 'Allowed' : 'Blocked'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-card space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider border-b pb-2">System</h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span>Force GPS</span>
                            <span className={data.location?.forceGps ? 'text-success font-medium' : 'text-muted-foreground'}>
                                {data.location?.forceGps ? 'Yes' : 'No'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Factory Reset</span>
                            <span className={data.misc?.allowFactoryReset ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                {data.misc?.allowFactoryReset ? 'Allowed' : 'Blocked'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onCancel}>Close</Button>
            </div>
        </div>
    );

    if (!isEditing) {
        return renderView();
    }

    return (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 rounded-full">
                        <Edit className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Edit Restrictions</h3>
                        <p className="text-sm text-muted-foreground">
                            Configure allowed features and limitations
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 py-4">
                <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground border-b pb-2">Security</h3>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="camera" className="flex flex-col gap-1">
                            <span>Allow Camera</span>
                            <span className="font-normal text-xs text-muted-foreground">Enable device camera usage</span>
                        </Label>
                        <Switch
                            id="camera"
                            checked={data.security?.allowCamera}
                            onCheckedChange={(c) => updateSecurity('allowCamera', c)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="screenCapture" className="flex flex-col gap-1">
                            <span>Allow Screen Capture</span>
                            <span className="font-normal text-xs text-muted-foreground">Enable screenshots and recording</span>
                        </Label>
                        <Switch
                            id="screenCapture"
                            checked={data.security?.allowScreenCapture}
                            onCheckedChange={(c) => updateSecurity('allowScreenCapture', c)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground border-b pb-2">Connectivity & Storage</h3>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="bluetooth" className="flex flex-col gap-1">
                            <span>Allow Bluetooth</span>
                            <span className="font-normal text-xs text-muted-foreground">Enable Bluetooth radios</span>
                        </Label>
                        <Switch
                            id="bluetooth"
                            checked={data.connectivity?.allowBluetooth}
                            onCheckedChange={updateConnectivity}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="usb" className="flex flex-col gap-1">
                            <span>Allow USB Mass Storage</span>
                            <span className="font-normal text-xs text-muted-foreground">Enable USB file transfer</span>
                        </Label>
                        <Switch
                            id="usb"
                            checked={data.storage?.allowUsbMassStorage}
                            onCheckedChange={updateStorage}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground border-b pb-2">System</h3>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="gps" className="flex flex-col gap-1">
                            <span>Force GPS On</span>
                            <span className="font-normal text-xs text-muted-foreground">Prevent turning off location</span>
                        </Label>
                        <Switch
                            id="gps"
                            checked={data.location?.forceGps}
                            onCheckedChange={updateLocation}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="reset" className="flex flex-col gap-1">
                            <span>Allow Factory Reset</span>
                            <span className="font-normal text-xs text-muted-foreground">Allow user to factory reset</span>
                        </Label>
                        <Switch
                            id="reset"
                            checked={data.misc?.allowFactoryReset}
                            onCheckedChange={updateMisc}
                        />
                    </div>
                </div>
            </div>
            <CardFooter className="flex justify-between px-0">
                <Button variant="outline" onClick={handleCancelClick}>
                    Cancel
                </Button>
                <Button onClick={() => onSave(data)}>Save Changes</Button>
            </CardFooter>
        </div>
    );
}
