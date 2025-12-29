
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


    return (
        <>
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
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={() => onSave(data)}>Save Changes</Button>
            </CardFooter>
        </>
    );
}
