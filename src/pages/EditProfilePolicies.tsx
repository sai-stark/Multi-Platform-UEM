import { ProfileService } from '@/api/services/profiles';
import { LoadingAnimation } from '@/components/common/LoadingAnimation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ApplicationPolicyEditor } from '@/components/profiles/Policies/ApplicationPolicy';
import { LockScreenMessagePolicy } from '@/components/profiles/Policies/LockScreenMessagePolicy';
import { MailPolicy } from '@/components/profiles/Policies/MailPolicy';
import { NotificationPolicy } from '@/components/profiles/Policies/NotificationPolicy';
import { PasscodePolicy } from '@/components/profiles/Policies/PasscodePolicy';
import { RestrictionsComposite, RestrictionsPolicy } from '@/components/profiles/Policies/RestrictionsPolicy';
import { WebApplicationPolicyEditor } from '@/components/profiles/Policies/WebApplicationPolicy';
import { WifiPolicy } from '@/components/profiles/Policies/WifiPolicy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IosMdmConfiguration, IosScepConfiguration } from '@/types/ios';
import { ApplicationPolicy, FullProfile, IosMailPolicy, IosPasscodeRestrictionPolicy, IosWiFiConfiguration, LockScreenMessagePolicy as LockScreenMessagePolicyType, NotificationPolicy as NotificationPolicyType, PasscodeRestrictionPolicy, Platform, WebApplicationPolicy } from '@/types/models';
import { AnimatePresence, motion } from 'framer-motion';
import { Apple, ArrowLeft, Ban, Bell, Globe, Grid, Key, Layout, Mail, MessageSquare, Monitor, Plus, Server, Shield, Smartphone, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
};

export default function EditProfilePolicies() {
    const { platform, id } = useParams<{ platform: string; id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<FullProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePolicyType, setActivePolicyType] = useState<string | null>(null);

    // State for specific Policy Data
    const [passcodePolicy, setPasscodePolicy] = useState<PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy | undefined>(undefined);
    const [wifiPolicy, setWifiPolicy] = useState<IosWiFiConfiguration | undefined>(undefined);
    const [mailPolicy, setMailPolicy] = useState<IosMailPolicy | undefined>(undefined);
    const [restrictionsPolicy, setRestrictionsPolicy] = useState<RestrictionsComposite | undefined>(undefined);
    const [applicationPolicy, setApplicationPolicy] = useState<ApplicationPolicy[]>([]);
    const [webApplicationPolicy, setWebApplicationPolicy] = useState<WebApplicationPolicy[]>([]);
    const [notificationPolicy, setNotificationPolicy] = useState<NotificationPolicyType[]>([]);
    const [lockScreenMessagePolicy, setLockScreenMessagePolicy] = useState<LockScreenMessagePolicyType | null>(null);
    const [scepPolicy, setScepPolicy] = useState<IosScepConfiguration | undefined>(undefined);
    const [mdmPolicy, setMdmPolicy] = useState<IosMdmConfiguration | undefined>(undefined);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            if (platform && id) {
                // Fetch basic profle or full profile depending on API
                // Assuming getProfile returns full profile with policies
                const data = await ProfileService.getProfile(platform as Platform, id);
                setProfile(data);

                // Populate policies based on platform type
                const isIos = platform === 'ios';
                const isAndroid = platform === 'android';

                // Common: Application Policies (both platforms have this)
                if (data.applicationPolicies && data.applicationPolicies.length > 0) {
                    setApplicationPolicy(data.applicationPolicies as any);
                }

                if (isIos) {
                    // iOS-specific policies from IosFullProfile
                    if (data.passCodePolicy) {
                        setPasscodePolicy(data.passCodePolicy as any);
                    }
                    if (data.wifiPolicy) {
                        setWifiPolicy(data.wifiPolicy);
                    }
                    if (data.lockScreenPolicy) {
                        setLockScreenMessagePolicy(data.lockScreenPolicy as any);
                    }
                    if (data.notificationPolicies && data.notificationPolicies.length > 0) {
                        setNotificationPolicy(data.notificationPolicies as any);
                    }
                    if ((data as any).scepPolicy) {
                        setScepPolicy((data as any).scepPolicy);
                    }
                    if ((data as any).mdmPolicy) {
                        setMdmPolicy((data as any).mdmPolicy);
                    }
                    if ((data as any).mailPolicy) {
                        setMailPolicy((data as any).mailPolicy);
                    }
                    // iOS uses webClipPolicies
                    if (data.webClipPolicies && data.webClipPolicies.length > 0) {
                        setWebApplicationPolicy(data.webClipPolicies as any);
                    }
                }

                if (isAndroid) {
                    // Android-specific policies from AndroidFullProfile
                    // Android uses 'restrictions' object (not restrictionsPolicy)
                    if ((data as any).restrictions) {
                        // Map Android restrictions to the composite structure
                        const restrictions = (data as any).restrictions;
                        setRestrictionsPolicy({
                            security: restrictions.security,
                            passcode: restrictions.passcode,
                            syncStorage: restrictions.syncStorage,
                            kiosk: restrictions.kiosk,
                            tethering: restrictions.tethering,
                            location: restrictions.location,
                            phone: restrictions.phone,
                            dateTime: restrictions.dateTime,
                            display: restrictions.display,
                            miscellaneous: restrictions.miscellaneous,
                            applications: restrictions.applications,
                            network: restrictions.network,
                            connectivity: restrictions.connectivity,
                        } as any);
                    }
                    // Android uses webApplicationPolicies (not webClipPolicies)
                    if ((data as any).webApplicationPolicies && (data as any).webApplicationPolicies.length > 0) {
                        setWebApplicationPolicy((data as any).webApplicationPolicies);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id, platform]);

    const handlePolicySave = () => {
        setActivePolicyType(null);
        fetchProfile();
    };

    const getPlatformIcon = (plat?: string) => {
        switch (plat) {
            case 'android': return <Smartphone className="w-5 h-5 text-success" />;
            case 'ios': return <Apple className="w-5 h-5 text-muted-foreground" />;
            case 'windows': return <Monitor className="w-5 h-5 text-info" />;
            default: return <Layout className="w-5 h-5 text-primary" />;
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <LoadingAnimation message="Fetching profile policies..." />
            </MainLayout>
        );
    }

    if (!profile) {
        return (
            <MainLayout>
                <div className="p-8 text-center text-muted-foreground">
                    Profile not found.
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/profiles/${platform}/${id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {getPlatformIcon(profile.platform)}
                            Edit Policies: {profile.name}
                        </h1>
                        <p className="text-muted-foreground">Configure device restrictions, applications, and security policies.</p>
                    </div>
                    {!activePolicyType && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Policy
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {/* Only show options for policies NOT already configured */}
                                {!passcodePolicy && (
                                    <DropdownMenuItem onClick={() => setActivePolicyType('passcode')}>
                                        <Shield className="w-4 h-4 mr-2" /> Passcode Policy
                                    </DropdownMenuItem>
                                )}
                                {!wifiPolicy && (
                                    <DropdownMenuItem onClick={() => setActivePolicyType('wifi')}>
                                        <Wifi className="w-4 h-4 mr-2" /> WiFi Configuration
                                    </DropdownMenuItem>
                                )}
                                {platform === 'ios' && !mailPolicy && (
                                    <DropdownMenuItem onClick={() => setActivePolicyType('mail')}>
                                        <Mail className="w-4 h-4 mr-2" /> Mail Configuration
                                    </DropdownMenuItem>
                                )}
                                {!restrictionsPolicy && (
                                    <DropdownMenuItem onClick={() => setActivePolicyType('restrictions')}>
                                        <Ban className="w-4 h-4 mr-2" /> Device Restrictions
                                    </DropdownMenuItem>
                                )}
                                {applicationPolicy.length === 0 && (
                                    <DropdownMenuItem onClick={() => setActivePolicyType('applications')}>
                                        <Grid className="w-4 h-4 mr-2" /> Application Policy
                                    </DropdownMenuItem>
                                )}
                                {webApplicationPolicy.length === 0 && (
                                    <DropdownMenuItem onClick={() => setActivePolicyType('webApps')}>
                                        <Globe className="w-4 h-4 mr-2" /> Web Application Policy
                                    </DropdownMenuItem>
                                )}
                                {notificationPolicy.length === 0 && (
                                    <DropdownMenuItem onClick={() => setActivePolicyType('notifications')}>
                                        <Bell className="w-4 h-4 mr-2" /> Notification Policy
                                    </DropdownMenuItem>
                                )}
                                {!lockScreenMessagePolicy && (
                                    <DropdownMenuItem onClick={() => setActivePolicyType('lockScreenMessage')}>
                                        <MessageSquare className="w-4 h-4 mr-2" /> Lock Screen Message
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </motion.div>

                <AnimatePresence mode="wait">
                    {activePolicyType ? (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="border-l-4 border-l-primary shadow-md">
                                {activePolicyType !== 'passcode' && activePolicyType !== 'notifications' && activePolicyType !== 'lockScreenMessage' && activePolicyType !== 'scep' && activePolicyType !== 'mdm' && (
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {activePolicyType === 'passcode' && <Shield className="w-6 h-6 text-primary" />}
                                            {activePolicyType === 'wifi' && <Wifi className="w-6 h-6 text-info" />}
                                            {activePolicyType === 'mail' && <Mail className="w-6 h-6 text-purple-500" />}
                                            {activePolicyType === 'restrictions' && <Ban className="w-6 h-6 text-destructive" />}
                                            {activePolicyType === 'applications' && <Grid className="w-6 h-6 text-orange-500" />}
                                            {activePolicyType === 'webApps' && <Globe className="w-6 h-6 text-blue-500" />}

                                            {activePolicyType === 'passcode' && 'Passcode Policy'}
                                            {activePolicyType === 'wifi' && 'WiFi Configuration'}
                                            {activePolicyType === 'mail' && 'Mail Configuration'}
                                            {activePolicyType === 'restrictions' && 'Device Restrictions'}
                                            {activePolicyType === 'applications' && 'Application Policy'}
                                            {activePolicyType === 'webApps' && 'Web Application Policy'}
                                        </CardTitle>
                                        <CardDescription>Configure the settings for this policy module.</CardDescription>
                                    </CardHeader>
                                )}
                                <CardContent>
                                    {activePolicyType === 'passcode' && (
                                        <PasscodePolicy
                                            platform={platform as Platform}
                                            profileId={id!}
                                            initialData={passcodePolicy}
                                            onSave={handlePolicySave}
                                            onCancel={() => setActivePolicyType(null)}
                                        />
                                    )}
                                    {activePolicyType === 'wifi' && (
                                        <WifiPolicy
                                            profileId={id!}
                                            initialData={wifiPolicy}
                                            onSave={handlePolicySave}
                                            onCancel={() => setActivePolicyType(null)}
                                        />
                                    )}
                                    {activePolicyType === 'mail' && (
                                        <MailPolicy
                                            profileId={id!}
                                            initialData={mailPolicy}
                                            onSave={handlePolicySave}
                                            onCancel={() => setActivePolicyType(null)}
                                        />
                                    )}
                                    {activePolicyType === 'restrictions' && (
                                        <RestrictionsPolicy
                                            profileId={id!}
                                            initialData={restrictionsPolicy}
                                            onSave={handlePolicySave}
                                            onCancel={() => setActivePolicyType(null)}
                                        />
                                    )}
                                    {activePolicyType === 'applications' && (
                                        <ApplicationPolicyEditor
                                            profileId={id!}
                                            platform={platform as Platform}
                                            initialData={applicationPolicy}
                                            onSave={handlePolicySave}
                                            onCancel={() => setActivePolicyType(null)}
                                        />
                                    )}
                                    {activePolicyType === 'webApps' && (
                                        <WebApplicationPolicyEditor
                                            profileId={id!}
                                            platform={platform as Platform}
                                            initialData={webApplicationPolicy}
                                            onSave={handlePolicySave}
                                            onCancel={() => setActivePolicyType(null)}
                                        />
                                    )}
                                    {activePolicyType === 'notifications' && (
                                        <NotificationPolicy
                                            platform={platform as Platform}
                                            profileId={id!}
                                            initialData={notificationPolicy}
                                        />
                                    )}
                                    {activePolicyType === 'lockScreenMessage' && (
                                        <LockScreenMessagePolicy
                                            platform={platform as Platform}
                                            profileId={id!}
                                            initialData={lockScreenMessagePolicy}
                                        />
                                    )}
                                    {activePolicyType === 'scep' && scepPolicy && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Key className="w-6 h-6 text-warning" />
                                                <h3 className="text-lg font-semibold">SCEP Configuration</h3>
                                                <Badge variant="secondary">View Only</Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Name</p>
                                                    <p className="font-medium">{(scepPolicy as any).scepName || '-'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">URL</p>
                                                    <p className="font-medium truncate">{(scepPolicy as any).url || '-'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Key Size</p>
                                                    <p className="font-medium">{(scepPolicy as any).keysize || '-'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Key Type</p>
                                                    <p className="font-medium">{(scepPolicy as any).keyType || '-'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Key Usage</p>
                                                    <p className="font-medium">{(scepPolicy as any).keyUsage || '-'}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <Button variant="outline" onClick={() => setActivePolicyType(null)}>
                                                    Back to Policies
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {activePolicyType === 'mdm' && mdmPolicy && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Server className="w-6 h-6 text-success" />
                                                <h3 className="text-lg font-semibold">MDM Configuration</h3>
                                                <Badge variant="secondary">View Only</Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Server URL</p>
                                                    <p className="font-medium truncate">{mdmPolicy.serverURL || '-'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Check-in URL</p>
                                                    <p className="font-medium truncate">{mdmPolicy.checkInURL || '-'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Topic</p>
                                                    <p className="font-medium">{mdmPolicy.topic || '-'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Sign Message</p>
                                                    <p className="font-medium">{mdmPolicy.signMessage ? 'Yes' : 'No'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Access Rights</p>
                                                    <p className="font-medium">{mdmPolicy.accessRights || '-'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">Check Out When Removed</p>
                                                    <p className="font-medium">{mdmPolicy.checkOutWhenRemoved ? 'Yes' : 'No'}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <Button variant="outline" onClick={() => setActivePolicyType(null)}>
                                                    Back to Policies
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {/* Only show cards for policies that exist in the FullProfile */}
                            {passcodePolicy && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-primary" onClick={() => setActivePolicyType('passcode')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-primary" /> Passcode
                                            </CardTitle>
                                            <CardDescription>Device security</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge>Active</Badge>
                                                <span className="text-xs text-muted-foreground">Modified {new Date().toLocaleDateString()}</span>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Complexity</span>
                                                    <span className="font-medium capitalize">
                                                        {'complexity' in passcodePolicy ? passcodePolicy.complexity || 'Simple' : 'Simple'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Min Length</span>
                                                    <span className="font-medium">{passcodePolicy.minLength} chars</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Max Failed Attempts</span>
                                                    <span className="font-medium">
                                                        {'maximumFailedAttempts' in passcodePolicy ? passcodePolicy.maximumFailedAttempts || 'Unlimited' : 'Unlimited'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="w-full" onClick={() => setActivePolicyType('passcode')}>
                                                View Policy
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {wifiPolicy && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-info" onClick={() => setActivePolicyType('wifi')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Wifi className="w-5 h-5 text-info" /> WiFi
                                            </CardTitle>
                                            <CardDescription>Network connectivity</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge className="bg-info hover:bg-info/90">Active</Badge>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">SSID</span>
                                                    <span className="font-medium">{wifiPolicy.ssid}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Encryption</span>
                                                    <span className="font-medium">{wifiPolicy.encryptionType || 'None'}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Auto Join</span>
                                                    <span className="font-medium">{wifiPolicy.autoJoin ? 'Yes' : 'No'}</span>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="w-full" onClick={() => setActivePolicyType('wifi')}>
                                                View Policy
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Mail Policy Card - iOS only, show only if configured */}
                            {platform === 'ios' && mailPolicy && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-purple-500" onClick={() => setActivePolicyType('mail')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Mail className="w-5 h-5 text-purple-500" /> Mail
                                            </CardTitle>
                                            <CardDescription>Email configuration</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Badge>Active</Badge>
                                            <p className="text-sm mt-2 text-muted-foreground">{mailPolicy.name}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {restrictionsPolicy && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-destructive" onClick={() => setActivePolicyType('restrictions')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Ban className="w-5 h-5 text-destructive" /> Restrictions
                                            </CardTitle>
                                            <CardDescription>Feature control</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge className="bg-destructive hover:bg-destructive/90">Active</Badge>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Camera</span>
                                                    <span className={restrictionsPolicy.security?.allowCamera ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                                        {restrictionsPolicy.security?.allowCamera ? 'Allowed' : 'Blocked'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Screen Capture</span>
                                                    <span className={restrictionsPolicy.security?.allowScreenCapture ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                                        {restrictionsPolicy.security?.allowScreenCapture ? 'Allowed' : 'Blocked'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Factory Reset</span>
                                                    <span className={restrictionsPolicy.misc?.allowFactoryReset ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                                        {restrictionsPolicy.misc?.allowFactoryReset ? 'Allowed' : 'Blocked'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="w-full" onClick={() => setActivePolicyType('restrictions')}>
                                                View Policy
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* SCEP Policy Card - iOS only, show only if configured */}
                            {scepPolicy && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-warning" onClick={() => setActivePolicyType('scep')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Key className="w-5 h-5 text-warning" /> SCEP
                                            </CardTitle>
                                            <CardDescription>Certificate enrollment</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Badge>Active</Badge>
                                            <p className="text-sm mt-2 text-muted-foreground">{(scepPolicy as any).scepName || 'Configured'}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* MDM Policy Card - iOS only, show only if configured */}
                            {mdmPolicy && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-success" onClick={() => setActivePolicyType('mdm')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Server className="w-5 h-5 text-success" /> MDM
                                            </CardTitle>
                                            <CardDescription>Device management</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge className="bg-destructive hover:bg-destructive/90">Active</Badge>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Camera</span>
                                                    <span className={restrictionsPolicy.security?.allowCamera ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                                        {restrictionsPolicy.security?.allowCamera ? 'Allowed' : 'Blocked'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Screen Capture</span>
                                                    <span className={restrictionsPolicy.security?.allowScreenCapture ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                                        {restrictionsPolicy.security?.allowScreenCapture ? 'Allowed' : 'Blocked'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Factory Reset</span>
                                                    <span className={restrictionsPolicy.misc?.allowFactoryReset ? 'text-success font-medium' : 'text-destructive font-medium'}>
                                                        {restrictionsPolicy.misc?.allowFactoryReset ? 'Allowed' : 'Blocked'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="w-full" onClick={() => setActivePolicyType('restrictions')}>
                                                View Policy
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Always show App and WebApp cards as "Manage" entry points since they are lists */}
                            <motion.div variants={itemVariants}>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-orange-500" onClick={() => setActivePolicyType('applications')}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Grid className="w-5 h-5 text-orange-500" /> Applications
                                        </CardTitle>
                                        <CardDescription>Manage app catalog</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="outline" size="sm" className="w-full">Manage Apps</Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {webApplicationPolicy && webApplicationPolicy.length > 0 && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-blue-500" onClick={() => setActivePolicyType('webApps')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Globe className="w-5 h-5 text-blue-500" /> Web Apps
                                            </CardTitle>
                                            <CardDescription>Manage web shortcuts</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge>Active</Badge>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Configured Web Apps</span>
                                                    <span className="font-medium">{webApplicationPolicy.length} Shortcuts</span>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="w-full" onClick={() => setActivePolicyType('webApps')}>
                                                View Policy
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {notificationPolicy && notificationPolicy.length > 0 && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-purple-500" onClick={() => setActivePolicyType('notifications')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Bell className="w-5 h-5 text-purple-500" /> Notifications
                                            </CardTitle>
                                            <CardDescription>App notification settings</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge>Active</Badge>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Configured Apps</span>
                                                    <span className="font-medium">{notificationPolicy.length} Apps</span>
                                                </div>
                                            </div>
                                            <Button variant="secondary" className="w-full" onClick={() => setActivePolicyType('notifications')}>
                                                View Policy
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {lockScreenMessagePolicy && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-teal-500" onClick={() => setActivePolicyType('lockScreenMessage')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <MessageSquare className="w-5 h-5 text-teal-500" /> Lock Screen
                                            </CardTitle>
                                            <CardDescription>Lock screen messages</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge>Active</Badge>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                {lockScreenMessagePolicy.assetTagInformation && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Asset Tag</span>
                                                        <span className="font-medium truncate max-w-[150px]">{lockScreenMessagePolicy.assetTagInformation}</span>
                                                    </div>
                                                )}
                                                {lockScreenMessagePolicy.lockScreenFootnote && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Footnote</span>
                                                        <span className="font-medium truncate max-w-[150px]">{lockScreenMessagePolicy.lockScreenFootnote}</span>
                                                    </div>
                                                )}
                                                {!lockScreenMessagePolicy.assetTagInformation && !lockScreenMessagePolicy.lockScreenFootnote && (
                                                    <div className="text-sm text-muted-foreground italic">No message configured</div>
                                                )}
                                            </div>
                                            <Button variant="secondary" className="w-full" onClick={() => setActivePolicyType('lockScreenMessage')}>
                                                View Policy
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}
