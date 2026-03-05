import { Card, CardContent } from '@/components/ui/card';
import { DeviceInfo } from '@/types/models';
import { Layers, Tablet, User } from 'lucide-react';
import { BooleanStatus, InfoRow, SectionHeader, formatBytes } from './DeviceOverviewTab';

interface DeviceUserTabProps {
    device: DeviceInfo;
}

export function DeviceUserTab({ device }: DeviceUserTabProps) {
    return (
        <Card>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <SectionHeader title="User Info" icon={User} />
                    <InfoRow label="User Email" value={device.userEmail} />
                    <InfoRow label="Device User Name" value={device.deviceUser} />
                    <InfoRow label="Organization" value={device.organizationName} icon={Layers} />
                    <InfoRow label="Assigned User" value={device.deviceUser} />
                </div>

                <div className="space-y-4">
                    <SectionHeader title="Shared Device (iPad)" icon={Tablet} />
                    <BooleanStatus label="Shared Device" value={device.isMultiUser} />
                    <InfoRow label="Resident Users" value={device.residentUsers} />
                    <InfoRow label="Quota Size" value={formatBytes(Number(device.quotaSize) * 1024 * 1024)} subValue={device.quotaSize ? 'Calculated from MB' : undefined} />
                    <InfoRow label="Grace Period" value={device.onlineAuthenticationGracePeriod} subValue="Days" />
                </div>
            </CardContent>
        </Card>
    );
}
