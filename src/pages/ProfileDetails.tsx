import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { FullProfile } from '@/types/models';
import { Apple, ArrowLeft, Ban, Calendar, CheckCircle, Clock, Edit, Layout, Loader2, Monitor, Shield, Smartphone, Users, Wifi } from 'lucide-react';
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
            type: 'PASSCODE', // Using type property to identify policy type manually for now
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

export default function ProfileDetails() {
    const { platform, id } = useParams<{ platform: string; id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<typeof mockFullProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        // Simulate API delay
        setLoading(true);
        setTimeout(() => {
            console.log('Using mock profile data');
            const data = mockFullProfile;
            setProfile(data);
            setLoading(false);
        }, 600);
    };

    useEffect(() => {
        fetchProfile();
    }, [id, platform]);



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
                    <Button variant="ghost" size="icon" onClick={() => navigate('/profiles')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {getPlatformIcon(profile.platform)}
                            {profile.name}
                        </h1>
                        <p className="text-muted-foreground">{profile.description || 'No description provided'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-2 mr-2">
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => navigate(`/profiles/${platform}/${id}/policies`)}
                            >
                                <Edit className="w-4 h-4" />
                                Edit Policies
                            </Button>
                        </div>
                        <Badge variant="outline" className="capitalize px-3 py-1 text-sm bg-background">
                            {profile.platform}
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold capitalize">{profile.status}</div>
                                <p className="text-xs text-muted-foreground">Current profile state</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Deployed Devices</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{profile.deployedDevices}</div>
                                <p className="text-xs text-muted-foreground">Active installations</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{profile.complianceRate}%</div>
                                <p className="text-xs text-muted-foreground">Device compliance rate</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Version</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">v{profile.version}</div>
                                <p className="text-xs text-muted-foreground">Current revision</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Profile Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Profile Name</span>
                                    <span className="font-medium">{profile.name}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Description</span>
                                    <span className="text-sm">{profile.description}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Platform</span>
                                    <span className="capitalize">{profile.platform}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Category</span>
                                    <span className="capitalize">{profile.category}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Created By</span>
                                    <span>{profile.createdBy}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Created On</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        {profile.createdTime ? new Date(profile.createdTime).toLocaleString() : '-'}
                                    </div>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Last Modified By</span>
                                    <span>{profile.lastModifiedBy}</span>
                                </div>
                                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                                    <span className="text-sm font-medium text-muted-foreground">Last Modified</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        {profile.updatedTime ? new Date(profile.updatedTime).toLocaleString() : '-'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Configured Policies Section */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Configured Policies</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profile.policies?.map((policy: any) => {
                            if (policy.type === 'PASSCODE' || policy.minLength !== undefined) {
                                return (
                                    <Card key={policy.id}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-primary" />
                                                Passcode Policy
                                            </CardTitle>
                                            <Badge variant="secondary">Active</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Min Length:</span>
                                                    <span className="font-medium text-foreground">{policy.minLength}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Alphanumeric:</span>
                                                    <span className="font-medium text-foreground">{policy.requireAlphanumeric ? 'Yes' : 'No'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Max Attempts:</span>
                                                    <span className="font-medium text-foreground">{policy.maxFailedAttempts}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }
                            if (policy.type === 'WIFI') {
                                return (
                                    <Card key={policy.id}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                                <Wifi className="w-4 h-4 text-info" />
                                                WiFi Configuration
                                            </CardTitle>
                                            <Badge variant="secondary">Active</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div className="flex justify-between">
                                                    <span>SSID:</span>
                                                    <span className="font-medium text-foreground">{policy.ssid}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Security:</span>
                                                    <span className="font-medium text-foreground">{policy.securityType}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }
                            if (policy.type === 'RESTRICTIONS') {
                                const r = policy.restrictions;
                                return (
                                    <Card key={policy.id}>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                                <Ban className="w-4 h-4 text-destructive" />
                                                Device Restrictions
                                            </CardTitle>
                                            <Badge variant="secondary">Active</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Camera:</span>
                                                    <span className="font-medium text-foreground">{r.security?.allowCamera ? 'Allowed' : 'Blocked'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Bluetooth:</span>
                                                    <span className="font-medium text-foreground">{r.connectivity?.allowBluetooth ? 'Allowed' : 'Blocked'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Factory Reset:</span>
                                                    <span className="font-medium text-foreground">{r.misc?.allowFactoryReset ? 'Allowed' : 'Blocked'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            }
                            return null;
                        })}

                        {(!profile.policies || profile.policies.length === 0) && (
                            <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                No policies configured.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
