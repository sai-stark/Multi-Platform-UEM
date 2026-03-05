import { DeviceService } from '@/api/services/devices';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DeviceSecurityInfo, Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    Activity,
    CheckCircle2,
    HardDrive as Chip,
    Lock,
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

    return (
        <div className="space-y-6">
            {/* Security Overview Header */}
            <Card className="border-t-4 border-t-emerald-500 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                                    <Shield className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Security Overview</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">Device security posture and compliance status</p>
                                </div>
                            </div>
                            {securityInfo && (
                                <Badge className={cn(
                                    "text-sm px-3 py-1",
                                    securityInfo.passcodePresent && securityInfo.passcodeCompliant
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20"
                                )}>
                                    {securityInfo.passcodePresent && securityInfo.passcodeCompliant ? (
                                        <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Compliant</>
                                    ) : (
                                        <><ShieldAlert className="w-4 h-4 mr-1.5" /> Needs Attention</>
                                    )}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                </div>

                {/* Quick Stats Row */}
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl border bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70">Passcode</span>
                            </div>
                            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                {securityInfo?.passcodePresent ? 'Set' : 'Not Set'}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl border bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600/70">Compliance</span>
                            </div>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                {securityInfo?.passcodeCompliant ? 'Compliant' : 'Non-Compliant'}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl border bg-gradient-to-br from-violet-50/50 to-violet-100/30 dark:from-violet-950/20 dark:to-violet-900/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Chip className="w-4 h-4 text-violet-500" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600/70">Encryption</span>
                            </div>
                            <p className="text-sm font-bold text-violet-900 dark:text-violet-100">
                                Level {securityInfo?.hardwareEncryptionCaps ?? '-'}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl border bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600/70">Enrollment</span>
                            </div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
                                {securityInfo?.IsUserEnrollment ? 'User' : 'Device'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Passcode & Authentication */}
            <Card className="border-t-4 border-t-blue-500">
                <CardHeader className="pb-3">
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
                <CardContent className="space-y-3">
                    <BooleanStatus label="Passcode Present" value={securityInfo?.passcodePresent} />
                    <BooleanStatus label="Passcode Compliant" value={securityInfo?.passcodeCompliant} />
                    <BooleanStatus label="Compliant with Profiles" value={securityInfo?.passcodeCompliantWithProfiles} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Activity className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Lock Grace Period</p>
                                <p className="text-sm font-semibold">{securityInfo?.passcodeLockGracePeriod ?? '-'} min</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Shield className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Grace Period Enforced</p>
                                <p className="text-sm font-semibold">{securityInfo?.passcodeLockGracePeriodEnforced ?? '-'} min</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Device Security Measures */}
            <Card className="border-t-4 border-t-violet-500">
                <CardHeader className="pb-3">
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
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/10">
                                <Chip className="w-4 h-4 text-violet-500" />
                            </div>
                            <span className="text-sm font-medium">Hardware Encryption</span>
                        </div>
                        <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/30">
                            Level {securityInfo?.hardwareEncryptionCaps ?? '-'}
                        </Badge>
                    </div>
                    <BooleanStatus label="Is User Enrollment" value={securityInfo?.IsUserEnrollment} />
                </CardContent>
            </Card>

            {/* MacOS Encryption (conditional) */}
            {securityInfo?.FDE_Enabled !== undefined && (
                <Card className="border-t-4 border-t-cyan-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/10">
                                <Lock className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold">MacOS Encryption</h4>
                                <p className="text-xs text-muted-foreground">FileVault disk encryption status</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <BooleanStatus label="FileVault Enabled" value={securityInfo?.FDE_Enabled} />
                        <BooleanStatus label="Institutional Recovery Key" value={securityInfo?.FDE_HasInstitutionalRecoveryKey} />
                        <BooleanStatus label="Personal Recovery Key" value={securityInfo?.FDE_HasPersonalRecoveryKey} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
