import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DeviceInfo } from '@/types/models';
import { Lock, Sun, User } from 'lucide-react';
import { BooleanStatus, SectionHeader } from './DeviceOverviewTab';

interface DeviceSettingsTabProps {
    device: DeviceInfo;
}

export function DeviceSettingsTab({ device }: DeviceSettingsTabProps) {
    if ((device.platform === 'ios' || device.deviceType === 'IosDeviceInfo') && device.osType !== 'MacosDeviceInfo' && device.platform !== 'macos') {
        return null; // Not shown for iOS
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <SectionHeader title="Display & Sound" icon={Sun} />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Brightness</span>
                            <span>{device.brightness ?? '-'}%</span>
                        </div>
                        <Progress value={device.brightness || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Volume</span>
                            <span>{device.volume ?? '-'}%</span>
                        </div>
                        <Progress value={device.volume || 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Ring Volume</span>
                            <span>{device.ringVolume ?? '-'}%</span>
                        </div>
                        <Progress value={device.ringVolume || 0} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <SectionHeader title="Security & Restrictions" icon={Lock} />
                </CardHeader>
                <CardContent className="space-y-2">
                    <BooleanStatus label="Keyguard/Passcode" value={device.isKeyguardEnabled} />
                    <BooleanStatus label="USB Storage" value={device.isUsbStorageEnabled} />
                    <BooleanStatus label="Kiosk Mode" value={device.kioskMode} />
                    <BooleanStatus label="MDM Mode" value={device.mdmMode} />
                    <BooleanStatus label="Supervised" value={device.isSupervised} />
                    <BooleanStatus label="Activation Lock (Supervised)" value={device.activationLockAllowedWhileSupervised} />
                    <BooleanStatus label="Do Not Disturb" value={device.isDoNotDisturbInEffect} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <SectionHeader title="Accessibility" icon={User} />
                </CardHeader>
                <CardContent className="space-y-2">
                    <BooleanStatus label="VoiceOver" value={device.voiceOverEnabled} />
                    <BooleanStatus label="Zoom" value={device.zoomEnabled} />
                    <BooleanStatus label="Invert Colors" value={device.increaseContrastEnabled} />
                    <BooleanStatus label="Bold Text" value={device.boldTextEnabled} />
                    <BooleanStatus label="Reduce Motion" value={device.reduceMotionEnabled} />
                </CardContent>
            </Card>
        </div>
    );
}
