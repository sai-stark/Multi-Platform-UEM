import { DeviceService } from '@/api/services/devices';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DeviceSecurityInfo, DeviceSecurityInfoIos, DeviceSecurityInfoMacOs, Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    Activity,
    CheckCircle2,
    HardDrive as Chip,
    Lock,
    Server,
    Settings,
    Shield,
    ShieldAlert,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BooleanStatus } from './DeviceOverviewTab';

interface DeviceSecurityTabProps {
    platform: string;
    id: string;
}

function IosSecurityView({ info }: { info: DeviceSecurityInfoIos }) {
    return (
        <>
            {/* Quick Stats Row iOS */}
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl border bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70">Passcode</span>
                        </div>
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                            {info.passcodePresent ? 'Set' : 'Not Set'}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl border bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600/70">Compliance</span>
                        </div>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                            {info.passcodeCompliant ? 'Compliant' : 'Non-Compliant'}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl border bg-gradient-to-br from-violet-50/50 to-violet-100/30 dark:from-violet-950/20 dark:to-violet-900/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Chip className="w-4 h-4 text-violet-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600/70">Encryption</span>
                        </div>
                        <p className="text-sm font-bold text-violet-900 dark:text-violet-100">
                            Level {info.hardwareEncryptionCaps ?? '-'}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl border bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600/70">Enrollment</span>
                        </div>
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                            {info.IsUserEnrollment ? 'User' : 'Device'}
                        </p>
                    </div>
                </div>
            </CardContent>
            {/* Passcode & Authentication */}
            <Card className="border-t-4 border-t-blue-500 mt-6 shadow-sm border-x border-b">
                <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Lock className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Passcode & Authentication</h4>
                            <p className="text-xs text-muted-foreground">Passcode policies and compliance status</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-3">
                        <BooleanStatus label="Passcode Present" value={info.passcodePresent} />
                        <BooleanStatus label="Passcode Compliant" value={info.passcodeCompliant} />
                        <BooleanStatus label="Compliant with Profiles" value={info.passcodeCompliantWithProfiles} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                            <div className="p-2.5 rounded-lg bg-blue-500/10">
                                <Activity className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lock Grace Period</p>
                                <p className="text-lg font-bold text-foreground">{info.passcodeLockGracePeriod ?? '-'} <span className="text-sm font-normal text-muted-foreground">min</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                            <div className="p-2.5 rounded-lg bg-blue-500/10">
                                <Shield className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grace Period Enforced</p>
                                <p className="text-lg font-bold text-foreground">{info.passcodeLockGracePeriodEnforced ?? '-'} <span className="text-sm font-normal text-muted-foreground">min</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors md:col-span-2">
                            <div className="p-2.5 rounded-lg bg-blue-500/10">
                                <Settings className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Auto Lock Time</p>
                                <p className="text-lg font-bold text-foreground">{info.autoLockTime ?? '-'} <span className="text-sm font-normal text-muted-foreground">sec</span></p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Device Security Measures */}
            <Card className="border-t-4 border-t-violet-500 mt-6 shadow-sm border-x border-b">
                <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/10">
                            <Chip className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Device Security Measures</h4>
                            <p className="text-xs text-muted-foreground">Hardware encryption and enrollment type</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/10">
                                <Chip className="w-5 h-5 text-violet-500" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">Hardware Encryption</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-600 border-violet-500/30 px-3 py-1 font-semibold">
                            Level {info.hardwareEncryptionCaps ?? '-'}
                        </Badge>
                    </div>
                    <div className="p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                        <BooleanStatus label="Is User Enrollment" value={info.IsUserEnrollment} />
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

function MacOsSecurityView({ info }: { info: DeviceSecurityInfoMacOs }) {
    return (
        <>
            {/* Quick Stats Row MacOs */}
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl border bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70">FileVault</span>
                        </div>
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                            {info.fdeEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl border bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600/70">SIP</span>
                        </div>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                            {info.systemIntegrityProtectionEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl border bg-gradient-to-br from-violet-50/50 to-violet-100/30 dark:from-violet-950/20 dark:to-violet-900/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Server className="w-4 h-4 text-violet-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600/70">Secure Boot</span>
                        </div>
                        <p className="text-sm font-bold text-violet-900 dark:text-violet-100">
                            {info.secureBoot?.secureBootLevel ?? '-'}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl border bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600/70">DEP</span>
                        </div>
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                            {info.managementStatus?.enrolledViaDEP ? 'Enrolled' : 'Not Enrolled'}
                        </p>
                    </div>
                </div>
            </CardContent>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-6 pb-6">
                {/* Authentication & FileVault */}
                <Card className="border-t-4 border-t-blue-500 shadow-sm border-x border-b h-full">
                    <CardHeader className="pb-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Lock className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Authentication & Storage</h4>
                                <p className="text-xs text-muted-foreground">Disk encryption and boot state</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-3 p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                            <BooleanStatus label="FileVault Enabled" value={info.fdeEnabled} />
                            <BooleanStatus label="Auth Root Volume Enabled" value={info.authenticatedRootVolumeEnabled} />
                            <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                                <span className="text-sm text-muted-foreground font-medium">Bootstrap Token Allowed</span>
                                <span className="text-sm font-semibold text-foreground">{info.bootstrapTokenAllowedForAuthentication ?? '-'}</span>
                            </div>
                            <BooleanStatus label="Bootstrap Token Required (Kext)" value={info.bootstrapTokenRequiredForKernelExtensionApproval} />
                            <BooleanStatus label="Bootstrap Token Required (Updates)" value={info.bootstrapTokenRequiredForSoftwareUpdate} />
                        </div>
                    </CardContent>
                </Card>

                {/* System Integrity & Firewall */}
                <Card className="border-t-4 border-t-violet-500 shadow-sm border-x border-b h-full">
                    <CardHeader className="pb-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/10">
                                <Shield className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">System Integrity & Firewall</h4>
                                <p className="text-xs text-muted-foreground">System protection settings</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-3 p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                            <BooleanStatus label="SIP Enabled" value={info.systemIntegrityProtectionEnabled} />
                            <BooleanStatus label="Remote Desktop Enabled" value={info.remoteDesktopEnabled} />
                        </div>
                        {info.firewallSettings && (
                            <div className="space-y-3 p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                                <h5 className="text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Firewall Settings</h5>
                                <BooleanStatus label="Firewall Enabled" value={info.firewallSettings.firewallEnabled} />
                                <BooleanStatus label="Block All Incoming" value={info.firewallSettings.blockAllIncoming} />
                                <BooleanStatus label="Stealth Mode" value={info.firewallSettings.stealthMode} />
                                <BooleanStatus label="Allow Signed" value={info.firewallSettings.allowSigned} />
                                <BooleanStatus label="Allow Signed App" value={info.firewallSettings.allowSignedApp} />
                                <BooleanStatus label="Logging Enabled" value={info.firewallSettings.loggingEnabled} />
                                <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                                    <span className="text-sm text-muted-foreground">Logging Option</span>
                                    <span className="text-sm font-semibold">{info.firewallSettings.loggingOption ?? '-'}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Management Status */}
                <Card className="border-t-4 border-t-amber-500 shadow-sm border-x border-b h-full">
                    <CardHeader className="pb-3 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <User className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Management Status</h4>
                                <p className="text-xs text-muted-foreground">Enrollment and activation lock</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-3 p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                            <BooleanStatus label="Enrolled via DEP" value={info.managementStatus?.enrolledViaDEP} />
                            <BooleanStatus label="Activation Lock Manageable" value={info.managementStatus?.isActivationLockManageable} />
                            <BooleanStatus label="Is User Enrollment" value={info.managementStatus?.isUserEnrollment} />
                            <BooleanStatus label="User Approved Enrollment" value={info.managementStatus?.userApprovedEnrollment} />
                        </div>
                    </CardContent>
                </Card>

                {/* Secure Boot & Firmware */}
                <div className="flex flex-col gap-6 h-full">
                    <Card className="border-t-4 border-t-cyan-500 shadow-sm border-x border-b flex-grow">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/10">
                                    <Server className="w-5 h-5 text-cyan-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">Secure Boot Status</h4>
                                    <p className="text-xs text-muted-foreground">Hardware boot security</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-4 p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Secure Boot Level</span>
                                    <span className="text-base font-bold text-foreground">{info.secureBoot?.secureBootLevel ?? '-'}</span>
                                </div>
                                <div className="h-px bg-border" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">External Boot Level</span>
                                    <span className="text-base font-bold text-foreground">{info.secureBoot?.externalBootLevel ?? '-'}</span>
                                </div>
                                <div className="h-px bg-border" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Windows Boot Level</span>
                                    <span className="text-base font-bold text-foreground">{info.secureBoot?.windowsBootLevel ?? '-'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-emerald-500 shadow-sm border-x border-b flex-grow">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <ShieldAlert className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">Firmware Password</h4>
                                    <p className="text-xs text-muted-foreground">System firmware protection</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-3 p-4 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                                <BooleanStatus label="Allow Oroms" value={info.firmwarePasswordStatus?.allowOroms} />
                                <BooleanStatus label="Password Exists" value={info.firmwarePasswordStatus?.passwordExists} />
                                <BooleanStatus label="Change Pending" value={info.firmwarePasswordStatus?.changePending} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}


export function DeviceSecurityTab({ platform, id }: DeviceSecurityTabProps) {
    const { toast } = useToast();
    const [securityInfo, setSecurityInfo] = useState<DeviceSecurityInfo | null>(null);

    useEffect(() => {
        const loadSecurityInfo = async () => {
            if (!platform || !id) return;
            try {
                const sec = await DeviceService.getDeviceSecurityInfo(platform as Platform, id);
                setSecurityInfo(sec);
            } catch (e) {
                console.error("Failed to load security info", e);
                toast({
                    title: "Warning",
                    description: getErrorMessage(e, "Failed to load security information."),
                    variant: "destructive"
                });
            }
        };

        loadSecurityInfo();
    }, [platform, id, toast]);

    if (!securityInfo) {
        return <div className="animate-pulse bg-muted rounded-xl h-[400px]"></div>;
    }

    return (
        <div className="space-y-6 w-full">
            {/* Security Overview Header */}
            <Card className="border-t-4 border-t-emerald-500 overflow-hidden shadow-md">
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight text-foreground">Security Overview</h3>
                                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                        Device security posture and compliance status
                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                                            {securityInfo.osType === 'DeviceSecurityInfoMacOs' ? 'macOS' : 'iOS'}
                                        </Badge>
                                    </p>
                                </div>
                            </div>
                            {/* In real world, we might compute a global compliance state here for MacOs too. For now we just check fields if available */}
                            {securityInfo.osType === 'DeviceSecurityInfoIos' && (
                                <Badge className={cn(
                                    "text-sm px-4 py-1.5 font-semibold shadow-sm",
                                    securityInfo.passcodePresent && securityInfo.passcodeCompliant
                                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-500/25"
                                        : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-500/25"
                                )}>
                                    {securityInfo.passcodePresent && securityInfo.passcodeCompliant ? (
                                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Compliant</>
                                    ) : (
                                        <><ShieldAlert className="w-4 h-4 mr-2" /> Needs Attention</>
                                    )}
                                </Badge>
                            )}
                            {securityInfo.osType === 'DeviceSecurityInfoMacOs' && (
                                <Badge className={cn(
                                    "text-sm px-4 py-1.5 font-semibold shadow-sm",
                                    securityInfo.fdeEnabled && securityInfo.systemIntegrityProtectionEnabled
                                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-500/25"
                                        : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-500/25"
                                )}>
                                    {securityInfo.fdeEnabled && securityInfo.systemIntegrityProtectionEnabled ? (
                                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Compliant</>
                                    ) : (
                                        <><ShieldAlert className="w-4 h-4 mr-2" /> Needs Attention</>
                                    )}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                </div>

                {securityInfo.osType === 'DeviceSecurityInfoMacOs' ? (
                    <MacOsSecurityView info={securityInfo} />
                ) : (
                    <IosSecurityView info={securityInfo} />
                )}
            </Card>
        </div>
    );
}

