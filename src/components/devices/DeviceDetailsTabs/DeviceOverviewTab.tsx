import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { DeviceInfo } from '@/types/models';
import {
    Barcode,
    Battery,
    BatteryCharging,
    Bluetooth,
    HardDrive as Chip,
    Database,
    FileText,
    Gauge,
    Globe,
    Layers,
    Network,
    ScanBarcode,
    Shield,
    Smartphone,
    Wifi
} from 'lucide-react';
import React from 'react';

// Common components needed for the Overview Tab
export const SectionHeader = ({ title, icon: Icon }: { title: string, icon: React.ElementType }) => (
    <div className="flex items-center gap-2">
        <div className="p-2 rounded-md bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold">{title}</h3>
    </div>
);

export const BooleanStatus = ({ label, value, trueLabel = "Enabled", falseLabel = "Disabled", invertColor = false }: { label: string, value?: boolean, trueLabel?: string, falseLabel?: string, invertColor?: boolean }) => {
    const isTrue = !!value;
    const isPositive = invertColor ? !isTrue : isTrue;

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <span className="text-sm font-medium">{label}</span>
            <Badge variant={isPositive ? "default" : "secondary"} className={cn(
                "font-normal",
                isPositive ? "bg-success/15 text-success hover:bg-success/25 border-success/30" : "bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/30"
            )}>
                {isTrue ? trueLabel : falseLabel}
            </Badge>
        </div>
    );
};

export const InfoRow = ({ label, value, className, icon: Icon, subValue, copyable }: { label: string, value: React.ReactNode, className?: string, icon?: React.ElementType, subValue?: string, copyable?: boolean }) => (
    <div className={cn("flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors", className)}>
        {Icon && (
            <div className="mt-1 p-2 rounded-md bg-primary/10 shrink-0">
                <Icon className="w-4 h-4 text-primary" />
            </div>
        )}
        <div className="flex flex-col gap-0.5 overflow-hidden w-full">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground truncate block" title={typeof value === 'string' ? value : undefined}>
                    {value}
                    {value === undefined || value === null || value === '' ? '-' : ''}
                </span>
                {copyable && value && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                            navigator.clipboard.writeText(String(value));
                            // Optional: add toast notification here
                        }}
                    >
                        <FileText className="h-3 w-3" />
                    </Button>
                )}
            </div>
            {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
        </div>
    </div>
);

// Helpers
export const formatBytes = (bytes?: number | string) => {
    if (bytes === undefined || bytes === null || bytes === '') return '-';
    let num = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (isNaN(num)) return bytes.toString();

    // Sometimes values come as GB instead of bytes. Assuming if it's less than 1000 it's probably already GB.
    // However, keeping standard byte conversion to match original logic.
    if (num < 1000 && num > 0) {
        // Just formatting the number + GB if it's already in GB (a rough heuristic, adjust based on actual data)
        return `${num.toFixed(2)} GB`;
    }

    if (num === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getBatteryColor = (level?: number) => {
    if (level === undefined || level < 0) return 'text-muted-foreground';
    if (level <= 20) return 'text-destructive';
    if (level <= 50) return 'text-warning';
    return 'text-success';
};

interface DeviceOverviewTabProps {
    device: DeviceInfo;
}

export function DeviceOverviewTab({ device }: DeviceOverviewTabProps) {
    const isIos = device.platform === 'ios' || device.deviceType === 'IosDeviceInfo';

    // Android storage calculations
    let storagePercent = 0;
    if (!isIos) {
        const usedStorage = Number(device.storageUsed || device.usedStorage || 0);
        const totalStorage = Number(device.storageCapacity || device.totalStorage || device.deviceCapacity || 0);
        storagePercent = totalStorage > 0 ? Math.min(100, (usedStorage / totalStorage) * 100) : 0;
    }

    // Android RAM calculations
    let ramPercent = 0;
    if (!isIos) {
        const usedRam = Number(device.ramUsed || device.usedRam || 0);
        const totalRam = Number(device.ramCapacity || device.totalRam || 0);
        ramPercent = totalRam > 0 ? Math.min(100, (usedRam / totalRam) * 100) : 0;
    }

    if (isIos) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Device Information & Software */}
                <Card className="col-span-1 md:col-span-2 border-t-4 border-t-primary">
                    <CardHeader>
                        <SectionHeader title="Device Information & Software" icon={Smartphone} />
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <span className="text-sm font-medium">Device Name</span>
                            <Badge variant="secondary" className="font-normal max-w-[50%] truncate">{device.deviceName || '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <span className="text-sm font-medium">Model Name</span>
                            <Badge variant="secondary" className="font-normal max-w-[50%] truncate">{device.modelName || '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <span className="text-sm font-medium">Model Number</span>
                            <Badge variant="secondary" className="font-normal max-w-[50%] truncate">{device.model || '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <span className="text-sm font-medium">Product Name</span>
                            <Badge variant="secondary" className="font-normal max-w-[50%] truncate">{device.productName || '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <span className="text-sm font-medium">Serial Number</span>
                            <Badge variant="secondary" className="font-normal font-mono max-w-[50%] truncate">{device.serialNo || '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <span className="text-sm font-medium">UDID</span>
                            <Badge variant="secondary" className="font-normal font-mono max-w-[50%] truncate" title={device.udid}>{device.udid || '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <span className="text-sm font-medium">OS Version</span>
                            <Badge variant="secondary" className="font-normal">{device.osVersion || '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <span className="text-sm font-medium">Build Version</span>
                            <Badge variant="secondary" className="font-normal">{device.buildVersion || '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <span className="text-sm font-medium">Modem Firmware</span>
                            <Badge variant="secondary" className="font-normal">{device.modemFirmwareVersion || '-'}</Badge>
                        </div>
                        <BooleanStatus label="Awaiting Config" value={device.awaitingConfiguration} trueLabel="Yes" falseLabel="No" />
                        <BooleanStatus label="iTunes Account Active" value={device.iTunesStoreAccountIsActive} trueLabel="Yes" falseLabel="No" />
                    </CardContent>
                </Card>

                {/* Storage & Battery stacked in one column */}
                <div className="col-span-1 flex flex-col gap-6">
                    {/* Storage */}
                    <Card className="border-t-4 border-t-success flex-1">
                        <CardHeader>
                            <SectionHeader title="Storage" icon={Database} />
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const capacity = device.deviceCapacity || 0;
                                const available = device.availableDeviceCapacity || 0;
                                const used = capacity > 0 ? capacity - available : 0;
                                const percent = capacity > 0 ? Math.min(100, (used / capacity) * 100) : 0;

                                return (
                                    <>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 rounded-md bg-primary/10">
                                                <Database className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="text-2xl font-bold">{used.toFixed(2)} GB</span>
                                            <span className="text-sm text-muted-foreground">/ {capacity.toFixed(2)} GB</span>
                                        </div>
                                        <Progress value={percent} className="h-2 mb-3" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Used: {percent.toFixed(1)}%</span>
                                            <span>Free: {available.toFixed(2)} GB</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>

                    {/* Battery */}
                    <Card className="border-t-4 border-t-warning flex-1">
                        <CardHeader>
                            <SectionHeader title="Battery" icon={Battery} />
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const raw = device.batteryLevel;
                                const normalized = (raw !== undefined && raw !== null && raw >= 0)
                                    ? (raw <= 1 ? Number((raw * 100).toFixed(2)) : Number(raw.toFixed(2)))
                                    : -1;
                                return (
                                    <>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 rounded-md bg-warning/10">
                                                <Battery className="w-5 h-5 text-warning" />
                                            </div>
                                            <div className={cn("text-2xl font-bold", getBatteryColor(normalized))}>
                                                {normalized >= 0 ? normalized : '-'}%
                                            </div>
                                        </div>
                                        <Progress value={normalized >= 0 ? normalized : 0} className="h-2 mb-3" />
                                        <div className="text-xs text-muted-foreground">
                                            {normalized >= 0 ? (normalized > 50 ? 'Good' : normalized > 20 ? 'Low' : 'Critical') : 'Unknown'}
                                        </div>
                                    </>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>

                {/* Status & Compliance */}
                <Card className="col-span-1 md:col-span-2 border-t-4 border-t-warning">
                    <CardHeader>
                        <SectionHeader title="Status & Compliance" icon={Shield} />
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <BooleanStatus label="Supervised" value={device.isSupervised} />
                        <BooleanStatus label="Shared Device" value={device.isMultiUser} />
                        <BooleanStatus label="Device Locator" value={device.isDeviceLocatorServiceEnabled} />
                        <BooleanStatus label="Do Not Disturb" value={device.isDoNotDisturbInEffect} />
                        <BooleanStatus label="Cloud Backup" value={device.isCloudBackupEnabled} />
                        <BooleanStatus label="MDM Lost Mode" value={device.isMDMLostModeEnabled} invertColor />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Battery Status */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Battery className="w-4 h-4" /> Battery
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(() => {
                        const raw = device.batteryLevel;
                        const normalized = (raw !== undefined && raw !== null && raw >= 0)
                            ? (raw <= 1 ? Math.round(raw * 100) : Math.round(raw))
                            : -1;
                        return (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className={cn("text-4xl font-bold", getBatteryColor(normalized))}>
                                        {normalized >= 0 ? normalized : '-'}%
                                    </div>
                                    <div className="space-y-1">
                                        {device.isBatteryCharging && (
                                            <Badge variant="outline" className="gap-1 text-success bg-success/10 border-success/30">
                                                <BatteryCharging className="w-3 h-3" /> Charging
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Progress value={normalized >= 0 ? normalized : 0} className="mt-4 h-2" />
                            </>
                        );
                    })()}
                </CardContent>
            </Card>

            {/* Storage */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Database className="w-4 h-4" /> Storage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-baseline mb-2">
                        <span className="text-2xl font-bold">{formatBytes(device.storageUsed || device.usedStorage)}</span>
                        <span className="text-sm text-muted-foreground">of {formatBytes(device.storageCapacity || device.totalStorage || device.deviceCapacity)}</span>
                    </div>
                    <Progress value={storagePercent} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Used: {storagePercent.toFixed(2)}%</span>
                        <span>Free: {formatBytes(device.freeStorage || (device.availableDeviceCapacity))}</span>
                    </div>
                </CardContent>
            </Card>

            {/* RAM (Android mainly) */}
            {(device.ramCapacity || device.totalRam) && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Gauge className="w-4 h-4" /> RAM
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-2xl font-bold">{formatBytes(device.ramUsed || device.usedRam)}</span>
                            <span className="text-sm text-muted-foreground">of {formatBytes(device.ramCapacity || device.totalRam)}</span>
                        </div>
                        <Progress value={ramPercent} className="h-2 mb-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Used: {Math.round(ramPercent)}%</span>
                            <span>Free: {formatBytes(device.freeRam)}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <SectionHeader title="Identity" icon={Smartphone} />
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <InfoRow label="Serial Number" value={device.serialNo} icon={Barcode} copyable />
                        <InfoRow label="IMEI" value={device.imei || (Array.isArray(device.imeis) ? device.imeis.map(i => i.imei).join(', ') : '')} icon={ScanBarcode} copyable />
                        <InfoRow label="UDID / ID" value={device.udid || device.id} icon={Chip} copyable />
                        <InfoRow label="Model Identifier" value={device.model} icon={Smartphone} />
                        <InfoRow label="Manufacturer" value={device.manufacturer || device.modelInfo?.manufacturer} icon={Layers} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <SectionHeader title="Network Summary" icon={Wifi} />
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <InfoRow label="Wi-Fi MAC" value={device.wifiMAC || device.wifiInfo?.macId || device.macAddress} icon={Network} copyable />
                        <InfoRow label="Bluetooth MAC" value={device.bluetoothMAC} icon={Bluetooth} copyable />
                        <InfoRow label="IP Address" value={device.ipAddress || device.wifiInfo?.ipAddress || (device.simInfos && device.simInfos[0]?.ipAddress)} icon={Globe} />
                        {device.wifiInfo && (
                            <InfoRow label="Connected SSID" value={device.wifiInfo.ssid} icon={Wifi} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
