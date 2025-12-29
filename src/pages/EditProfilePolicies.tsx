import { MainLayout } from '@/components/layout/MainLayout';
import { PasscodePolicy } from '@/components/profiles/Policies/PasscodePolicy';
import { RestrictionsComposite, RestrictionsPolicy } from '@/components/profiles/Policies/RestrictionsPolicy';
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
import { FullProfile, IosWiFiConfiguration, PasscodeRestrictionPolicy } from '@/types/models';
import { Apple, ArrowLeft, Ban, Layout, Loader2, Monitor, Plus, Shield, Smartphone, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const mockFullProfile: FullProfile & {
    deployedDevices: number;
    complianceRate: number;
    createdBy: string;
    lastModifiedBy: string;
    version: number;
} = {
    id: '1',
    name: 'Corporate Android Default',
    description: 'Standard policy for all Android devices. Enforces passcode, encryption, and basic app restrictions.',
    platform: 'android',
    createdTime: '2024-01-15T10:00:00Z',
    updatedTime: '2024-01-20T14:30:00Z',
    status: 'active',
    category: 'Corporate',
    deployedDevices: 142,
    complianceRate: 98,
    createdBy: 'admin@company.com',
    lastModifiedBy: 'security-ops@company.com',
    version: 3,
    policies: [
        {
            id: 'p1',
            type: 'PASSCODE',
            minLength: 6,
            requireAlphanumeric: true,
            maxFailedAttempts: 5
        },
        {
            id: 'w1',
            type: 'WIFI',
            ssid: 'Corp-Secure-Net',
            securityType: 'WPA2',
            password: 'securepassword123'
        },
        {
            id: 'r1',
            type: 'RESTRICTIONS',
            restrictions: {
                security: { allowCamera: true, allowScreenCapture: false },
                connectivity: { allowBluetooth: true },
                storage: { allowUsbMassStorage: false },
                location: { forceGps: true },
                misc: { allowFactoryReset: false }
            }
        }
    ]
};

export default function EditProfilePolicies() {
    const { platform, id } = useParams<{ platform: string; id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<typeof mockFullProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePolicyType, setActivePolicyType] = useState<string | null>(null);

    // State for specific policy data
    const [passcodePolicy, setPasscodePolicy] = useState<PasscodeRestrictionPolicy | undefined>(undefined);
    const [wifiPolicy, setWifiPolicy] = useState<IosWiFiConfiguration | undefined>(undefined);
    const [restrictionsPolicy, setRestrictionsPolicy] = useState<RestrictionsComposite | undefined>(undefined);

    const fetchProfile = async () => {
        // Simulate API delay
        setLoading(true);
        setTimeout(() => {
            console.log('Using mock profile data');
            const data = mockFullProfile;
            setProfile(data);
            if (data.policies) {
                const passcode = data.policies.find((p: any) => p.type === 'PASSCODE' || p.minLength !== undefined);
                if (passcode) setPasscodePolicy(passcode);

                const wifi = data.policies.find((p: any) => p.type === 'WIFI');
                if (wifi) setWifiPolicy(wifi);

                const restrictions = data.policies.find((p: any) => p.type === 'RESTRICTIONS');
                if (restrictions) setRestrictionsPolicy(restrictions.restrictions);
            }
            setLoading(false);
        }, 600);
    };

    useEffect(() => {
        fetchProfile();
    }, [id, platform]);

    const handlePolicySave = () => {
        setActivePolicyType(null); // Close editor
        fetchProfile(); // Refresh
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
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

    const getPlatformIcon = (plat?: string) => {
        switch (plat) {
            case 'android': return <Smartphone className="w-5 h-5 text-success" />;
            case 'ios': return <Apple className="w-5 h-5 text-muted-foreground" />;
            case 'windows': return <Monitor className="w-5 h-5 text-info" />;
            default: return <Layout className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/profiles/${platform}/${id}`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {getPlatformIcon(profile.platform)}
                            Edit Policies: {profile.name}
                        </h1>
                        <p className="text-muted-foreground">Configure device restrictions and security policies.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {!activePolicyType ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Configured Policies</h2>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            Add Policy
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setActivePolicyType('passcode')}>
                                            Passcode / Security
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setActivePolicyType('wifi')}>
                                            WiFi Configuration
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setActivePolicyType('restrictions')}>
                                            Device Restrictions
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* List of Policies */}
                            <div className="grid gap-4">
                                {/* Render Passcode Policy if exists */}
                                {passcodePolicy && (
                                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActivePolicyType('passcode')}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-primary" />
                                                Passcode Policy
                                            </CardTitle>
                                            <Badge variant="secondary">Configured</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground">
                                                Min Length: {passcodePolicy.minLength},
                                                Alphanumeric: {passcodePolicy.requireAlphanumeric ? 'Yes' : 'No'},
                                                Max Attempts: {passcodePolicy.maxFailedAttempts}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Render WiFi Policy */}
                                {wifiPolicy && (
                                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActivePolicyType('wifi')}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-info" />
                                                WiFi Configuration
                                            </CardTitle>
                                            <Badge variant="secondary">Configured</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground">
                                                SSID: {wifiPolicy.ssid}, Security: {wifiPolicy.securityType}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Render Restrictions Policy */}
                                {restrictionsPolicy && (
                                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActivePolicyType('restrictions')}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                                <Ban className="w-4 h-4 text-destructive" />
                                                Device Restrictions
                                            </CardTitle>
                                            <Badge variant="secondary">Configured</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground">
                                                Camera: {restrictionsPolicy.security?.allowCamera ? 'Allowed' : 'Blocked'},
                                                Bluetooth: {restrictionsPolicy.connectivity?.allowBluetooth ? 'Allowed' : 'Blocked'}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {!passcodePolicy && !wifiPolicy && !restrictionsPolicy && (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                                        No policies configured. Click "Add Policy" to start.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {activePolicyType === 'passcode' && <Shield className="w-5 h-5" />}
                                    {activePolicyType === 'wifi' && <Wifi className="w-5 h-5" />}
                                    {activePolicyType === 'restrictions' && <Ban className="w-5 h-5" />}

                                    {activePolicyType === 'passcode' && 'Passcode Policy'}
                                    {activePolicyType === 'wifi' && 'WiFi Configuration'}
                                    {activePolicyType === 'restrictions' && 'Device Restrictions'}
                                </CardTitle>
                                <CardDescription>
                                    Configure settings for this policy.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activePolicyType === 'passcode' && (
                                    <PasscodePolicy
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
                                {activePolicyType === 'restrictions' && (
                                    <RestrictionsPolicy
                                        profileId={id!}
                                        initialData={restrictionsPolicy}
                                        onSave={handlePolicySave}
                                        onCancel={() => setActivePolicyType(null)}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
