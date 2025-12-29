
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IosWiFiConfiguration } from '@/types/models';
import { useState } from 'react';

// Reusing IosWiFiConfiguration for now as a generic WiFi config
interface WifiPolicyProps {
    profileId: string;
    initialData?: IosWiFiConfiguration;
    onSave: (data: IosWiFiConfiguration) => void;
    onCancel: () => void;
}

export function WifiPolicy({ profileId, initialData, onSave, onCancel }: WifiPolicyProps) {
    const [formData, setFormData] = useState<IosWiFiConfiguration>(
        initialData || {
            ssid: '',
            securityType: 'WPA2', // Default
            password: '',
        }
    );

    const handleChange = (field: keyof IosWiFiConfiguration, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        // Validation could go here
        onSave(formData);
    };

    return (
        <>
            <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="ssid">SSID (Network Name)</Label>
                    <Input
                        id="ssid"
                        placeholder="e.g. Corp-Wifi"
                        value={formData.ssid}
                        onChange={(e) => handleChange('ssid', e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="security">Security Type</Label>
                    <Select
                        value={formData.securityType}
                        onValueChange={(val) => handleChange('securityType', val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select security type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NONE">None (Open)</SelectItem>
                            <SelectItem value="WEP">WEP</SelectItem>
                            <SelectItem value="WPA">WPA</SelectItem>
                            <SelectItem value="WPA2">WPA2 (Personal)</SelectItem>
                            <SelectItem value="ANY">Any</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {formData.securityType !== 'NONE' && (
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter WiFi password"
                            value={formData.password || ''}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                    </div>
                )}
            </div>
            <CardFooter className="flex justify-between px-0">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </>
    );
}
