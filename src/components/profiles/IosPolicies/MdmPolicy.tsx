import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { IosMdmConfiguration } from '@/types/ios';
import { CheckCircle, Eye, Globe, Key, Lock, Server, Shield, XCircle } from 'lucide-react';

interface MdmPolicyProps {
    profileId: string;
    initialData?: IosMdmConfiguration;
    onSave: () => void;
    onCancel: () => void;
}

function BooleanIndicator({ value, label }: { value?: boolean; label: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
            <span className="text-sm font-medium text-foreground/80">{label}</span>
            {value ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                    <CheckCircle className="w-3 h-3" /> Enabled
                </Badge>
            ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/20 gap-1">
                    <XCircle className="w-3 h-3" /> Disabled
                </Badge>
            )}
        </div>
    );
}

function DetailRow({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value?: string | number | null; mono?: boolean }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="mt-0.5 text-indigo-500/70">{icon}</div>
            <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                <p className={`text-sm font-medium mt-0.5 break-all ${mono ? 'font-mono text-xs' : ''}`}>
                    {value || <span className="text-muted-foreground italic">Not configured</span>}
                </p>
            </div>
        </div>
    );
}

export function MdmPolicy({ initialData, onCancel }: MdmPolicyProps) {
    const { registerSave, setLoading: setContextLoading, setSaveDisabled } = useBaseDialogContext();
    const { t } = useLanguage();
    const data = initialData || {} as Partial<IosMdmConfiguration>;

    return (
        <div className="space-y-6 max-w-4xl mt-4">
            {/* Header */}
            <div className="flex items-center gap-4 pb-5 border-b">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 shadow-sm">
                    <Server className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-xl font-bold tracking-tight">MDM Configuration</h3>
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 text-xs">
                            <Eye className="w-3 h-3 mr-1" /> View Only
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Apple Mobile Device Management server and enrollment settings
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column: Server Details */}
                <div className="space-y-4">
                    <div className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-sm text-indigo-600 uppercase tracking-wider">
                            <Globe className="w-4 h-4" /> Server Details
                        </h4>
                        <div className="space-y-3">
                            <DetailRow
                                icon={<Globe className="w-4 h-4" />}
                                label="Server URL"
                                value={data.serverURL}
                            />
                            <DetailRow
                                icon={<Server className="w-4 h-4" />}
                                label="Topic"
                                value={data.topic}
                                mono
                            />
                            <DetailRow
                                icon={<Key className="w-4 h-4" />}
                                label="Identity Certificate UUID"
                                value={data.identityCertificateUUID}
                                mono
                            />
                            {data.checkInURL && (
                                <DetailRow
                                    icon={<Globe className="w-4 h-4" />}
                                    label="Check-in URL"
                                    value={data.checkInURL}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Security & Features */}
                <div className="space-y-4">
                    <div className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-sm text-indigo-600 uppercase tracking-wider">
                            <Shield className="w-4 h-4" /> Security & Features
                        </h4>
                        <div className="space-y-2">
                            <BooleanIndicator value={data.signMessage} label="Sign Messages" />
                            <BooleanIndicator value={data.useDevelopmentAPNS} label="Development APNS" />
                            <BooleanIndicator value={data.pinningRevocationCheckRequired} label="Revocation Check" />
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border bg-card shadow-sm space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-sm text-indigo-600 uppercase tracking-wider">
                            <Lock className="w-4 h-4" /> Access & Enrollment
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                                <span className="text-sm font-medium text-foreground/80">Access Rights</span>
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {data.accessRights ?? '-'}
                                </Badge>
                            </div>
                            {data.enrollmentMode && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                                    <span className="text-sm font-medium text-foreground/80">Enrollment Mode</span>
                                    <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/30">
                                        {data.enrollmentMode}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Footer */}
            <div className="flex justify-end">
                <Button variant="outline" onClick={onCancel}>{t('common.close')}</Button>
            </div>
        </div>
    );
}
