import { Card, CardContent } from '@/components/ui/card';
import { DeviceInfo } from '@/types/models';
import { Cpu, Layers, Smartphone } from 'lucide-react';
import { BooleanStatus, formatBytes, InfoRow, SectionHeader } from './DeviceOverviewTab';

interface DeviceHardwareTabProps {
    device: DeviceInfo;
}

export function DeviceHardwareTab({ device }: DeviceHardwareTabProps) {
    if (device.platform === 'ios' || device.deviceType === 'IosDeviceInfo') {
        return null; // Not shown for iOS
    }

    return (
        <Card>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <SectionHeader title="Device Info" icon={Smartphone} />
                    <InfoRow label="Model Name" value={device.modelName || device.modelInfo?.modelName} />
                    <InfoRow label="Product Name" value={device.productName || device.modelInfo?.productName} />
                    <InfoRow label="Manufacturer" value={device.manufacturer || device.modelInfo?.manufacturer} />
                    <InfoRow label="Model Number" value={device.modelNumber} />
                    <InfoRow label="Device Type" value={device.deviceType || device.modelInfo?.deviceType} />
                </div>

                <div className="space-y-4">
                    <SectionHeader title="Processor & Storage" icon={Cpu} />
                    <InfoRow label="CPU Architecture" value={device.cpuArch || device.cpu} />
                    <InfoRow label="Device Capacity" value={formatBytes(device.deviceCapacity || device.storageCapacity)} subValue={device.storageCapacity ? 'Total Storage' : undefined} />
                    <InfoRow label="RAM" value={formatBytes(device.ramCapacity || device.totalRam)} />
                </div>

                <div className="space-y-4">
                    <SectionHeader title="Hardware Features" icon={Layers} />
                    <BooleanStatus label="GPS" value={device.gpsStatus} />
                    <BooleanStatus label="Bluetooth" value={device.bluetooth} />
                    <BooleanStatus label="NFC" value={device.nfcStatus} />
                    <BooleanStatus label="Audio/Volume Control" value={device.volume !== undefined} />
                </div>
            </CardContent>
        </Card>
    );
}
