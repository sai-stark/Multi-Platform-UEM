import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DeviceInfo } from '@/types/models';
import { Signal, Wifi } from 'lucide-react';
import { BooleanStatus, InfoRow, SectionHeader } from './DeviceOverviewTab';

interface DeviceNetworkTabProps {
    device: DeviceInfo;
}

export function DeviceNetworkTab({ device }: DeviceNetworkTabProps) {
    if ((device.platform === 'ios' || device.deviceType === 'IosDeviceInfo') && device.osType !== 'MacosDeviceInfo' && device.platform !== 'macos') {
        return null; // Not shown for iOS
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <SectionHeader title="Wi-Fi Information" icon={Wifi} />
                </CardHeader>
                <CardContent className="grid gap-2">
                    <BooleanStatus label="Wi-Fi Enabled" value={device.wifi} />
                    <InfoRow label="MAC Address" value={device.wifiMAC || device.wifiInfo?.macId} />
                    {device.wifiInfo && (
                        <>
                            <InfoRow label="SSID" value={device.wifiInfo.ssid} />
                            <InfoRow label="IP Address" value={device.wifiInfo.ipAddress} />
                            <InfoRow label="Signal Strength (RSSI)" value={device.wifiInfo.rssi} />
                            <InfoRow label="Link Speed" value={device.wifiInfo.linkSpeed} subValue="Mbps" />
                            <InfoRow label="Frequency" value={device.wifiInfo.frequency} subValue="MHz" />
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <SectionHeader title="Cellular" icon={Signal} />
                </CardHeader>
                <CardContent className="space-y-4">
                    <BooleanStatus label="Mobile Data" value={device.mobileData} />
                    {/* Android SIMs */}
                    {Array.isArray(device.simInfos) && device.simInfos.map((sim, idx) => (
                        <div key={idx} className="p-4 rounded-lg bg-muted/20 border">
                            <p className="font-semibold text-sm mb-2">SIM Slot {idx + 1}</p>
                            <div className="grid grid-cols-1 gap-2">
                                <InfoRow label="Carrier" value={sim.carrierNetwork} />
                                <InfoRow label="Phone" value={sim.phoneNumber} />
                                <InfoRow label="IMEI" value={sim.imei} />
                                <InfoRow label="Roaming" value={sim.isRoaming ? 'Yes' : 'No'} />
                                <InfoRow label="Data Active" value={sim.isDataTxOn ? 'Yes' : 'No'} />
                            </div>
                        </div>
                    ))}

                    {(!device.simInfos?.length) && (
                        <p className="text-muted-foreground text-sm italic">No cellular information available.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
