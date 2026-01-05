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
import { ApplicationPolicy, FullProfile, IosMailPolicy, IosPasscodeRestrictionPolicy, IosWiFiConfiguration, LockScreenMessagePolicy as LockScreenMessagePolicyType, NotificationPolicy as NotificationPolicyType, PasscodeRestrictionPolicy, Platform, WebApplicationPolicy } from '@/types/models';
import { AnimatePresence, motion } from 'framer-motion';
import { Apple, ArrowLeft, Ban, Bell, Globe, Grid, Layout, Mail, MessageSquare, Monitor, Plus, Shield, Smartphone, Wifi } from 'lucide-react';
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

    const fetchProfile = async () => {
        setLoading(true);
        try {
            if (platform && id) {
                // Fetch basic profle or full profile depending on API
                // Assuming getProfile returns full profile with policies
                const data = await ProfileService.getProfile(platform as Platform, id);
                setProfile(data);

                // Populate policies from FullProfile properties
                if (data.passCodePolicy) {
                    // Cast or map if necessary, but forcing for now as the component expects a certain shape
                    setPasscodePolicy(data.passCodePolicy as any);
                }
                if (data.wifiPolicy) {
                    setWifiPolicy(data.wifiPolicy);
                }
                if (data.lockScreenPolicy) {
                    setLockScreenMessagePolicy(data.lockScreenPolicy as any);
                }
                if (data.notificationPolicies) {
                    setNotificationPolicy(data.notificationPolicies as any);
                }

                // Handle Restrictions
                if ((data as any).restrictionsPolicy) {
                    setRestrictionsPolicy((data as any).restrictionsPolicy);
                }

                // Handle Application Policy
                if (data.applicationPolicies) {
                    // Map IOS policies or Android policies to component state
                    setApplicationPolicy(data.applicationPolicies as any);
                } else if ((data as any).applicationPolicy) {
                    setApplicationPolicy((data as any).applicationPolicy);
                }

                // Handle Web Application Policy
                if (data.webClipPolicies) {
                    setWebApplicationPolicy(data.webClipPolicies as any);
                } else if ((data as any).webApplicationPolicy) {
                    setWebApplicationPolicy((data as any).webApplicationPolicy);
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
                                <DropdownMenuItem onClick={() => setActivePolicyType('passcode')}>
                                    <Shield className="w-4 h-4 mr-2" /> Passcode Policy
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActivePolicyType('wifi')}>
                                    <Wifi className="w-4 h-4 mr-2" /> WiFi Configuration
                                </DropdownMenuItem>
                                {platform === 'ios' && (
                                    <DropdownMenuItem onClick={() => setActivePolicyType('mail')}>
                                        <Mail className="w-4 h-4 mr-2" /> Mail Configuration
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => setActivePolicyType('restrictions')}>
                                    <Ban className="w-4 h-4 mr-2" /> Device Restrictions
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActivePolicyType('applications')}>
                                    <Grid className="w-4 h-4 mr-2" /> Application Policy
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActivePolicyType('webApps')}>
                                    <Globe className="w-4 h-4 mr-2" /> Web Application Policy
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActivePolicyType('notifications')}>
                                    <Bell className="w-4 h-4 mr-2" /> Notification Policy
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActivePolicyType('lockScreenMessage')}>
                                    <MessageSquare className="w-4 h-4 mr-2" /> Lock Screen Message
                                </DropdownMenuItem>
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
                                {activePolicyType !== 'passcode' && activePolicyType !== 'notifications' && activePolicyType !== 'lockScreenMessage' && (
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
                            {/* Summary Cards of active policies */}
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
                                            <Badge>Active</Badge>
                                            <p className="text-sm mt-2 text-muted-foreground">Min Length: {passcodePolicy.minLength}</p>
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
                                            <Badge>Active</Badge>
                                            <p className="text-sm mt-2 text-muted-foreground">{wifiPolicy.ssid}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Mail Policy Card - iOS only */}
                            {platform === 'ios' && (
                                <motion.div variants={itemVariants}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-purple-500" onClick={() => setActivePolicyType('mail')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Mail className="w-5 h-5 text-purple-500" /> Mail
                                            </CardTitle>
                                            <CardDescription>Email configuration</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {mailPolicy ? (
                                                <>
                                                    <Badge>Active</Badge>
                                                    <p className="text-sm mt-2 text-muted-foreground">{mailPolicy.name}</p>
                                                </>
                                            ) : (
                                                <Button variant="outline" size="sm" className="w-full">Configure Mail</Button>
                                            )}
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
                                            <Badge>Active</Badge>
                                            <p className="text-sm mt-2 text-muted-foreground">Camera: {restrictionsPolicy.security?.allowCamera ? 'Yes' : 'No'}</p>
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

                            <motion.div variants={itemVariants}>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-blue-500" onClick={() => setActivePolicyType('webApps')}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-blue-500" /> Web Apps
                                        </CardTitle>
                                        <CardDescription>Manage web shortcuts</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="outline" size="sm" className="w-full">Manage Web Apps</Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-purple-500" onClick={() => setActivePolicyType('notifications')}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Bell className="w-5 h-5 text-purple-500" /> Notifications
                                        </CardTitle>
                                        <CardDescription>App notification settings</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="outline" size="sm" className="w-full">Manage Notifications</Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-teal-500" onClick={() => setActivePolicyType('lockScreenMessage')}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-teal-500" /> Lock Screen
                                        </CardTitle>
                                        <CardDescription>Lock screen messages</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="outline" size="sm" className="w-full">Manage Message</Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}
