import { DeviceService } from '@/api/services/devices';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import {
    AppWindow,
    Building2,
    CheckCircle2,
    Cpu,
    Download,
    Eye,
    FileText, Globe,
    Key,
    LayoutDashboard,
    Link2,
    ListChecks,
    Lock,
    Mail,
    MessagesSquare,
    Network,
    Package,
    Palette,
    RefreshCw, Settings, Shield,
    ShieldAlert,
    Sliders,
    Smartphone, Wifi
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BooleanStatus, InfoRow } from './DeviceOverviewTab';

interface DeviceEffectiveProfileTabProps {
    platform: string;
    id: string;
}

export function DeviceEffectiveProfileTab({ platform, id }: DeviceEffectiveProfileTabProps) {
    const { toast } = useToast();
    const [effectiveProfile, setEffectiveProfile] = useState<any>(null);
    const [selectedEffectivePolicy, setSelectedEffectivePolicy] = useState<{ type: string, data: any, displayInfo?: any } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadEffectiveProfile = async () => {
            if (!platform || !id) return;
            try {
                setLoading(true);
                const ep = await DeviceService.getEffectiveProfile(platform as Platform, id);
                setEffectiveProfile(ep);
            } catch (e) {
                console.error("Failed to load effective profile", e);
                setEffectiveProfile(null);
                toast({
                    title: "Warning",
                    description: getErrorMessage(e, "Failed to load effective profile."),
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        loadEffectiveProfile();
    }, [platform, id, toast]);

    if (loading) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                    <p>Loading effective profile...</p>
                </CardContent>
            </Card>
        );
    }

    if (!effectiveProfile) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p>No effective profile data available.</p>
                </CardContent>
            </Card>
        );
    }

    const ep = effectiveProfile;
    const policyCount = [
        ep.passCodePolicy ? 1 : 0, ep.scepPolicy ? 1 : 0, ep.mdmPolicy ? 1 : 0,
        ep.wifiPolicy ? 1 : 0, ep.lockScreenPolicy ? 1 : 0,
        (ep.applicationPolicies?.length || 0), (ep.webClipPolicies?.length || 0),
        (ep.notificationPolicies?.length || 0), (ep.rootCertPolicies?.length || 0),
        (ep.pkcs12Policies?.length || 0), (ep.pemPolicies?.length || 0),
        (ep.pkcs1Policies?.length || 0),
        ep.mailPolicy ? 1 : 0, ep.acmePolicy ? 1 : 0, ep.iosRelayPolicy ? 1 : 0,
        ep.iosGlobalHttpProxyPolicy ? 1 : 0, ep.iosWebContentFilterPolicy ? 1 : 0,
        ep.iosVpnPolicy ? 1 : 0, ep.iosPerDomainVpnPolicy ? 1 : 0,
        ep.iosPerAppVpnPolicy ? 1 : 0, ep.iosHomeScreenLayoutPolicy ? 1 : 0,
        ep.iosAppLockPolicy ? 1 : 0, ep.iosDeviceRestrictionsPolicy ? 1 : 0,
        ep.iosManagedDomainsPolicy ? 1 : 0, ep.iosCertificateTransparencyPolicy ? 1 : 0,
        ep.iosCertificatePreferencePolicy ? 1 : 0, ep.iosDeviceSettingsPolicy ? 1 : 0,
        ep.commonSettingsPolicy ? 1 : 0, ep.deviceThemePolicy ? 1 : 0,
        ep.enrollmentPolicy ? 1 : 0, (ep.webApplicationPolicies?.length || 0),
        ep.restrictions ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    const genericPolicies = [
        { key: 'mailPolicy', title: 'Mail Policy', icon: Mail, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-t-rose-500' },
        { key: 'acmePolicy', title: 'ACME Configuration', icon: Key, color: 'text-yellow-600', bg: 'bg-yellow-500/10', border: 'border-t-yellow-600' },
        { key: 'iosRelayPolicy', title: 'Relay Policy', icon: Link2, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-t-blue-400' },
        { key: 'iosGlobalHttpProxyPolicy', title: 'Global HTTP Proxy', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-t-indigo-500' },
        { key: 'iosWebContentFilterPolicy', title: 'Web Content Filter', icon: FileText, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-t-orange-400' },
        { key: 'iosVpnPolicy', title: 'VPN Policy', icon: Network, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-t-violet-500' },
        { key: 'iosPerDomainVpnPolicy', title: 'Per-Domain VPN', icon: Network, color: 'text-violet-600', bg: 'bg-violet-600/10', border: 'border-t-violet-600' },
        { key: 'iosPerAppVpnPolicy', title: 'Per-App VPN', icon: Network, color: 'text-violet-700', bg: 'bg-violet-700/10', border: 'border-t-violet-700' },
        { key: 'iosHomeScreenLayoutPolicy', title: 'Home Screen Layout', icon: LayoutDashboard, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-t-emerald-500' },
        { key: 'iosAppLockPolicy', title: 'App Lock Policy', icon: AppWindow, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-t-pink-500' },
        { key: 'iosDeviceRestrictionsPolicy', title: 'Device Restrictions', icon: Sliders, color: 'text-slate-600', bg: 'bg-slate-600/10', border: 'border-t-slate-600' },
        { key: 'iosManagedDomainsPolicy', title: 'Managed Domains', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-t-blue-600' },
        { key: 'iosCertificateTransparencyPolicy', title: 'Certificate Transparency', icon: Eye, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-t-teal-500' },
        { key: 'iosCertificatePreferencePolicy', title: 'Certificate Preference', icon: FileText, color: 'text-teal-600', bg: 'bg-teal-600/10', border: 'border-t-teal-600' },
        { key: 'iosDeviceSettingsPolicy', title: 'Device Settings', icon: Cpu, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-t-slate-500' },
        { key: 'commonSettingsPolicy', title: 'Common Settings', icon: Sliders, color: 'text-zinc-600', bg: 'bg-zinc-600/10', border: 'border-t-zinc-600' },
        { key: 'deviceThemePolicy', title: 'Device Theme', icon: Palette, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-t-fuchsia-500' },
        { key: 'enrollmentPolicy', title: 'Enrollment Policy', icon: ListChecks, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-t-sky-500' },
        { key: 'restrictions', title: 'Android Restrictions', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-t-red-500' }
    ];

    const renderGenericValue = (val: any): React.ReactNode => {
        if (typeof val === 'boolean') return val ? 'Enabled' : 'Disabled';
        if (Array.isArray(val)) return `Array (${val.length} items)`;
        if (typeof val === 'object' && val !== null) return '{...}';
        return String(val);
    };

    return (
        <div className="space-y-6">
            {/* Profile Header Card */}
            <Card className="border-t-4 border-t-primary overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <FileText className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{ep.name || 'Unnamed Profile'}</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">{ep.description || 'No description'}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className={ep.status === 'PUBLISHED' ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> {ep.status || 'Unknown'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground">Profile Type</p>
                        <p className="text-sm font-semibold mt-1">{ep.profileType || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground">Version</p>
                        <p className="text-sm font-semibold mt-1">{ep.version || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground">Device Count</p>
                        <p className="text-sm font-semibold mt-1">{ep.deviceCount ?? '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                        <p className="text-xs text-muted-foreground">Total Policies</p>
                        <p className="text-sm font-semibold mt-1">{policyCount}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Policy Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Passcode Policy */}
                {ep.passCodePolicy && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-amber-500" onClick={() => setSelectedEffectivePolicy({ type: 'passcode', data: ep.passCodePolicy })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                                <div className="p-1.5 rounded-lg bg-amber-500/10"><Lock className="w-4 h-4 text-amber-500" /></div>
                                Passcode Policy
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{ep.passCodePolicy.name || ep.passCodePolicy.policyType}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">Active</Badge>
                                <p className="text-xs text-muted-foreground">Min length: {ep.passCodePolicy.minLength || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* SCEP Policy */}
                {ep.scepPolicy && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-cyan-500" onClick={() => setSelectedEffectivePolicy({ type: 'scep', data: ep.scepPolicy })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-cyan-600">
                                <div className="p-1.5 rounded-lg bg-cyan-500/10"><Shield className="w-4 h-4 text-cyan-500" /></div>
                                SCEP Configuration
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{ep.scepPolicy.scepName || ep.scepPolicy.policyType}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">Active</Badge>
                                <p className="text-xs text-muted-foreground truncate max-w-[120px]">{ep.scepPolicy.url || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* MDM Configuration */}
                {ep.mdmPolicy && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-violet-500" onClick={() => setSelectedEffectivePolicy({ type: 'mdm', data: ep.mdmPolicy })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-violet-600">
                                <div className="p-1.5 rounded-lg bg-violet-500/10"><Settings className="w-4 h-4 text-violet-500" /></div>
                                MDM Configuration
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{ep.mdmPolicy.policyType || 'MDM Policy'}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">Active</Badge>
                                <p className="text-xs text-muted-foreground truncate max-w-[120px]">{ep.mdmPolicy.serverURL || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Wi-Fi Policy */}
                {ep.wifiPolicy && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-blue-500" onClick={() => setSelectedEffectivePolicy({ type: 'wifi', data: ep.wifiPolicy })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-blue-600">
                                <div className="p-1.5 rounded-lg bg-blue-500/10"><Wifi className="w-4 h-4 text-blue-500" /></div>
                                Wi-Fi Configuration
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{ep.wifiPolicy.ssid || 'Wi-Fi Policy'}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">Active</Badge>
                                <p className="text-xs text-muted-foreground">{ep.wifiPolicy.encryptionType || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Lock Screen Message */}
                {ep.lockScreenPolicy && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-pink-500" onClick={() => setSelectedEffectivePolicy({ type: 'lockscreen', data: ep.lockScreenPolicy })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-pink-600">
                                <div className="p-1.5 rounded-lg bg-pink-500/10"><Smartphone className="w-4 h-4 text-pink-500" /></div>
                                Lock Screen Message
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">Lock screen customization</p>
                        </CardHeader>
                        <CardContent>
                            <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">Active</Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Application Policies */}
                {Array.isArray(ep.applicationPolicies) && ep.applicationPolicies.length > 0 && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-emerald-500" onClick={() => setSelectedEffectivePolicy({ type: 'applications', data: ep.applicationPolicies })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-emerald-600">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10"><Download className="w-4 h-4 text-emerald-500" /></div>
                                Application Policies
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{ep.applicationPolicies.length} app(s) configured</p>
                        </CardHeader>
                        <CardContent>
                            <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">{ep.applicationPolicies.length} Active</Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Web Clips */}
                {Array.isArray(ep.webClipPolicies) && ep.webClipPolicies.length > 0 && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-orange-500" onClick={() => setSelectedEffectivePolicy({ type: 'webclips', data: ep.webClipPolicies })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-orange-600">
                                <div className="p-1.5 rounded-lg bg-orange-500/10"><Globe className="w-4 h-4 text-orange-500" /></div>
                                Web Clips
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{ep.webClipPolicies.length} web clip(s)</p>
                        </CardHeader>
                        <CardContent>
                            <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">{ep.webClipPolicies.length} Active</Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Notification Policies */}
                {Array.isArray(ep.notificationPolicies) && ep.notificationPolicies.length > 0 && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-rose-500" onClick={() => setSelectedEffectivePolicy({ type: 'notifications', data: ep.notificationPolicies })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-rose-600">
                                <div className="p-1.5 rounded-lg bg-rose-500/10"><MessagesSquare className="w-4 h-4 text-rose-500" /></div>
                                Notification Settings
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{ep.notificationPolicies.length} rule(s)</p>
                        </CardHeader>
                        <CardContent>
                            <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">{ep.notificationPolicies.length} Active</Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Certificate Policies */}
                {((ep.rootCertPolicies?.length > 0) || (ep.pkcs12Policies?.length > 0) || (ep.pemPolicies?.length > 0) || (ep.pkcs1Policies?.length > 0)) && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-teal-500" onClick={() => setSelectedEffectivePolicy({ type: 'certificates', data: { rootCertPolicies: ep.rootCertPolicies, pkcs12Policies: ep.pkcs12Policies, pemPolicies: ep.pemPolicies, pkcs1Policies: ep.pkcs1Policies } })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-teal-600">
                                <div className="p-1.5 rounded-lg bg-teal-500/10"><FileText className="w-4 h-4 text-teal-500" /></div>
                                Certificate Policies
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {(ep.rootCertPolicies?.length || 0) + (ep.pkcs12Policies?.length || 0) + (ep.pemPolicies?.length || 0) + (ep.pkcs1Policies?.length || 0)} certificate(s)
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">Active</Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Web Application Policies */}
                {Array.isArray(ep.webApplicationPolicies) && ep.webApplicationPolicies.length > 0 && (
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-t-4 border-t-orange-600" onClick={() => setSelectedEffectivePolicy({ type: 'webApplicationPolicies', data: ep.webApplicationPolicies })}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-orange-600">
                                <div className="p-1.5 rounded-lg bg-orange-600/10"><Globe className="w-4 h-4 text-orange-600" /></div>
                                Web App Policies
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{ep.webApplicationPolicies.length} web app(s)</p>
                        </CardHeader>
                        <CardContent>
                            <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">{ep.webApplicationPolicies.length} Active</Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Generic Cards Implementation */}
                {genericPolicies.map(gp => {
                    const data = ep[gp.key];
                    if (!data) return null;
                    const Icon = gp.icon;
                    return (
                        <Card key={gp.key} className={`cursor-pointer hover:shadow-lg transition-all border-t-4 ${gp.border}`} onClick={() => setSelectedEffectivePolicy({ type: gp.key, data, displayInfo: gp })}>
                            <CardHeader className="pb-2">
                                <CardTitle className={`text-base flex items-center gap-2 ${gp.color}`}>
                                    <div className={`p-1.5 rounded-lg ${gp.bg}`}><Icon className={`w-4 h-4 ${gp.color}`} /></div>
                                    {gp.title}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">Configured</p>
                            </CardHeader>
                            <CardContent>
                                <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/30">Active</Badge>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* View-Only Policy Dialog */}
            <Dialog open={!!selectedEffectivePolicy} onOpenChange={(open) => !open && setSelectedEffectivePolicy(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl",
                                selectedEffectivePolicy?.type === 'passcode' ? 'bg-amber-500/10' :
                                    selectedEffectivePolicy?.type === 'scep' ? 'bg-cyan-500/10' :
                                        selectedEffectivePolicy?.type === 'mdm' ? 'bg-violet-500/10' :
                                            selectedEffectivePolicy?.type === 'wifi' ? 'bg-blue-500/10' :
                                                selectedEffectivePolicy?.type === 'lockscreen' ? 'bg-pink-500/10' :
                                                    selectedEffectivePolicy?.type === 'applications' ? 'bg-emerald-500/10' :
                                                        selectedEffectivePolicy?.type === 'webclips' ? 'bg-orange-500/10' :
                                                            selectedEffectivePolicy?.type === 'webApplicationPolicies' ? 'bg-orange-600/10' :
                                                                selectedEffectivePolicy?.type === 'notifications' ? 'bg-rose-500/10' :
                                                                    selectedEffectivePolicy?.type === 'certificates' ? 'bg-teal-500/10' :
                                                                        (selectedEffectivePolicy as any)?.displayInfo?.bg || 'bg-primary/10'
                            )}>
                                {selectedEffectivePolicy?.type === 'passcode' && <Lock className="w-5 h-5 text-amber-500" />}
                                {selectedEffectivePolicy?.type === 'scep' && <Shield className="w-5 h-5 text-cyan-500" />}
                                {selectedEffectivePolicy?.type === 'mdm' && <Settings className="w-5 h-5 text-violet-500" />}
                                {selectedEffectivePolicy?.type === 'wifi' && <Wifi className="w-5 h-5 text-blue-500" />}
                                {selectedEffectivePolicy?.type === 'lockscreen' && <Smartphone className="w-5 h-5 text-pink-500" />}
                                {selectedEffectivePolicy?.type === 'applications' && <Download className="w-5 h-5 text-emerald-500" />}
                                {selectedEffectivePolicy?.type === 'webclips' && <Globe className="w-5 h-5 text-orange-500" />}
                                {selectedEffectivePolicy?.type === 'webApplicationPolicies' && <Globe className="w-5 h-5 text-orange-600" />}
                                {selectedEffectivePolicy?.type === 'notifications' && <MessagesSquare className="w-5 h-5 text-rose-500" />}
                                {selectedEffectivePolicy?.type === 'certificates' && <FileText className="w-5 h-5 text-teal-500" />}
                                {(selectedEffectivePolicy as any)?.displayInfo && (() => {
                                    const IconInfo = (selectedEffectivePolicy as any).displayInfo.icon;
                                    return <IconInfo className={`w-5 h-5 ${(selectedEffectivePolicy as any).displayInfo.color}`} />;
                                })()}
                            </div>
                            <div>
                                <DialogTitle className="text-lg">
                                    {selectedEffectivePolicy?.type === 'passcode' && 'Passcode Policy'}
                                    {selectedEffectivePolicy?.type === 'scep' && 'SCEP Configuration'}
                                    {selectedEffectivePolicy?.type === 'mdm' && 'MDM Configuration'}
                                    {selectedEffectivePolicy?.type === 'wifi' && 'Wi-Fi Configuration'}
                                    {selectedEffectivePolicy?.type === 'lockscreen' && 'Lock Screen Message'}
                                    {selectedEffectivePolicy?.type === 'applications' && 'Application Policies'}
                                    {selectedEffectivePolicy?.type === 'webclips' && 'Web Clips'}
                                    {selectedEffectivePolicy?.type === 'webApplicationPolicies' && 'Web Application Policies'}
                                    {selectedEffectivePolicy?.type === 'notifications' && 'Notification Settings'}
                                    {selectedEffectivePolicy?.type === 'certificates' && 'Certificate Policies'}
                                    {(selectedEffectivePolicy as any)?.displayInfo && (selectedEffectivePolicy as any).displayInfo.title}
                                </DialogTitle>
                                <DialogDescription>View-only policy configuration from effective profile</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-4 space-y-3">
                        {/* Passcode */}
                        {selectedEffectivePolicy?.type === 'passcode' && (() => {
                            const p = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-2">
                                    <BooleanStatus label="Require Passcode" value={p.requirePassCode} />
                                    <BooleanStatus label="Simple Passcode Allowed" value={p.allowSimple} />
                                    <BooleanStatus label="Alphanumeric Required" value={p.requireAlphanumericPasscode} />
                                    <InfoRow label="Min Length" value={p.minLength} />
                                    <InfoRow label="Max Failed Attempts" value={p.maximumFailedAttempts} />
                                    <InfoRow label="Max Passcode Age" value={p.maximumPasscodeAgeInDays} subValue="Days" />
                                    <InfoRow label="Auto-Lock" value={p.maximumInactivityInMinutes} subValue="Minutes" />
                                    <InfoRow label="Grace Period" value={p.maximumGracePeriodInMinutes} subValue="Minutes" />
                                </div>
                            );
                        })()}

                        {/* SCEP */}
                        {selectedEffectivePolicy?.type === 'scep' && (() => {
                            const p = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-2">
                                    <InfoRow label="URL" value={p.url} />
                                    <InfoRow label="SCEP Name" value={p.scepName} />
                                    <InfoRow label="Key Size" value={p.keysize} />
                                    <InfoRow label="Key Type" value={p.keyType} />
                                    <InfoRow label="Key Usage" value={p.keyUsage} />
                                    {p.subjectAltName?.dnsName && <InfoRow label="DNS Name" value={p.subjectAltName.dnsName} />}
                                </div>
                            );
                        })()}

                        {/* MDM */}
                        {selectedEffectivePolicy?.type === 'mdm' && (() => {
                            const p = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-2">
                                    <InfoRow label="Server URL" value={p.serverURL} />
                                    <InfoRow label="Check-in URL" value={p.checkInURL} />
                                    <InfoRow label="Topic" value={p.topic} />
                                    <BooleanStatus label="Sign Messages" value={p.signMessage} />
                                    <BooleanStatus label="Check Out on Remove" value={p.checkOutWhenRemoved} />
                                    <BooleanStatus label="Development APNS" value={p.useDevelopmentAPNS} />
                                    <InfoRow label="Access Rights" value={p.accessRights} />
                                    {Array.isArray(p.serverCapabilities) && p.serverCapabilities.length > 0 && (
                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                            <span className="text-sm font-medium">Capabilities</span>
                                            <div className="flex flex-wrap gap-1 max-w-[60%] justify-end">
                                                {p.serverCapabilities.map((cap: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/30 text-[10px]">
                                                        {cap.replace('com.apple.mdm.', '')}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Wi-Fi */}
                        {selectedEffectivePolicy?.type === 'wifi' && (() => {
                            const p = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-2">
                                    <InfoRow label="SSID" value={p.ssid} />
                                    <InfoRow label="Encryption" value={p.encryptionType} />
                                    <BooleanStatus label="Auto Join" value={p.autoJoin} />
                                    <BooleanStatus label="Hidden Network" value={p.hiddenNetwork} />
                                    <BooleanStatus label="Is Hotspot" value={p.isHotspot} />
                                </div>
                            );
                        })()}

                        {/* Lock Screen */}
                        {selectedEffectivePolicy?.type === 'lockscreen' && (() => {
                            const p = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-2">
                                    <InfoRow label="If Lost" value={p.lockScreenFootnote} />
                                    <InfoRow label="Asset Tag" value={p.assetTagInformation} />
                                </div>
                            );
                        })()}

                        {/* Applications */}
                        {selectedEffectivePolicy?.type === 'applications' && (() => {
                            const apps = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-3">
                                    {apps.map((app: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                                                <Package className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold truncate">{app.name || 'Unknown App'}</p>
                                                <p className="text-xs text-muted-foreground font-mono truncate">{app.applicationId || '-'}</p>
                                            </div>
                                            <Badge variant="outline" className={
                                                app.action === 'INSTALL' ? 'bg-success/10 text-success border-success/30' :
                                                    app.action === 'REMOVE' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                                                        'bg-muted text-muted-foreground'
                                            }>
                                                {app.action === 'INSTALL' ? <Download className="w-3 h-3 mr-1" /> : null}
                                                {app.action || 'N/A'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Web Clips */}
                        {selectedEffectivePolicy?.type === 'webclips' && (() => {
                            const clips = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-3">
                                    {clips.map((clip: any, idx: number) => (
                                        <div key={idx} className="p-3 border rounded-xl bg-card space-y-2">
                                            <InfoRow label="Label" value={clip.label} />
                                            <InfoRow label="URL" value={clip.url} />
                                            <BooleanStatus label="Removable" value={clip.isRemovable} />
                                            <BooleanStatus label="Full Screen" value={clip.fullScreen} />
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Notifications */}
                        {selectedEffectivePolicy?.type === 'notifications' && (() => {
                            const notifs = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-3">
                                    {notifs.map((notif: any, idx: number) => (
                                        <div key={idx} className="p-3 border rounded-xl bg-card space-y-2">
                                            <InfoRow label="Bundle ID" value={notif.bundleIdentifier} />
                                            <BooleanStatus label="Enabled" value={notif.enabled} />
                                            <BooleanStatus label="Lock Screen" value={notif.showInLockScreen} />
                                            <BooleanStatus label="Notification Center" value={notif.showInNotificationCenter} />
                                            <BooleanStatus label="Alert Style" value={notif.alertStyle !== 'NONE'} trueLabel={notif.alertStyle || 'BANNER'} />
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Certificates */}
                        {selectedEffectivePolicy?.type === 'certificates' && (() => {
                            const d = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {d.rootCertPolicies?.length > 0 && <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/30">Root Certs: {d.rootCertPolicies.length}</Badge>}
                                        {d.pkcs12Policies?.length > 0 && <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/30">PKCS12: {d.pkcs12Policies.length}</Badge>}
                                        {d.pemPolicies?.length > 0 && <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/30">PEM: {d.pemPolicies.length}</Badge>}
                                        {d.pkcs1Policies?.length > 0 && <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/30">PKCS1: {d.pkcs1Policies.length}</Badge>}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Android Web Applications */}
                        {selectedEffectivePolicy?.type === 'webApplicationPolicies' && (() => {
                            const apps = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-3">
                                    {apps.map((app: any, idx: number) => (
                                        <div key={idx} className="p-3 border rounded-xl bg-card space-y-2">
                                            <InfoRow label="App Name" value={app.webAppName} />
                                            <InfoRow label="App ID" value={app.webAppId} />
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Generic Policies Viewer */}
                        {(selectedEffectivePolicy as any)?.displayInfo && (() => {
                            const d = selectedEffectivePolicy.data;
                            return (
                                <div className="space-y-3">
                                    {Object.entries(d).map(([key, value]) => {
                                        if (key === 'policyType' || key === 'id' || value === undefined || value === null) return null;
                                        if (typeof value === 'boolean') {
                                            return <BooleanStatus key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} />;
                                        } else if (typeof value === 'object') {
                                            return (
                                                <div key={key} className="p-3 border rounded-xl bg-card space-y-2 mb-2">
                                                    <span className="text-sm font-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                                    <div className="pl-3 border-l-2 mt-2 space-y-1">
                                                        {Object.entries(value).map(([subKey, subVal]) => (
                                                            <div key={subKey} className="text-xs flex items-center justify-between py-1">
                                                                <span className="text-muted-foreground mr-2">{subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                                                <span className="font-medium">{renderGenericValue(subVal)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return <InfoRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={String(value)} />;
                                        }
                                    })}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="flex justify-end mt-4 pt-4 border-t">
                        <Button variant="outline" onClick={() => setSelectedEffectivePolicy(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

