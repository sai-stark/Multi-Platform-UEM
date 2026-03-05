import { Card, CardContent } from '@/components/ui/card';
import { DeviceInfo } from '@/types/models';
import { AppWindow, FileText, Globe, MapPin, RefreshCw } from 'lucide-react';
import { InfoRow, SectionHeader } from './DeviceOverviewTab';

interface DeviceSystemTabProps {
    device: DeviceInfo;
}

export function DeviceSystemTab({ device }: DeviceSystemTabProps) {
    if (device.platform === 'ios' || device.deviceType === 'IosDeviceInfo') {
        return null; // Hide for iOS
    }

    return (
        <Card>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <SectionHeader title="Operating System" icon={AppWindow} />
                    <InfoRow label="OS Details" value={device.opSysInfo?.fullVersion || `${device.opSysInfo?.name || ''} ${device.opSysInfo?.version || ''}`} />
                    <InfoRow label="Version" value={device.osVersion || device.androidVersion} />
                    <InfoRow label="Build Version" value={device.buildVersion} />
                    <InfoRow label="Supplemental Build" value={device.supplementalBuildVersion} />
                    <InfoRow label="Kernel/Baseband" value={device.modemFirmwareVersion} />
                </div>

                <div className="space-y-4">
                    <SectionHeader title="Time & Location" icon={Globe} />
                    <InfoRow label="Timezone" value={device.timeZone} />
                    <InfoRow label="Creation Time" value={device.creationTime} icon={FileText} />
                    <InfoRow label="Enrollment Time" value={device.enrollmentTime} icon={FileText} />
                    <InfoRow label="Last Sync" value={device.lastSyncTime} icon={RefreshCw} />
                    <InfoRow label="Deployed Location" value={device.deployedLocation} icon={MapPin} />
                </div>
            </CardContent>
        </Card>
    );
}
