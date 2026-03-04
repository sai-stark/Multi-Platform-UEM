import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { DeviceCertificateItem } from '@/types/models';
import {
    Building2,
    CalendarClock,
    CalendarDays,
    CheckCircle2,
    Clock,
    Copy,
    FileText,
    Fingerprint,
    Hash,
    Key,
    Lock,
    Shield,
    ShieldCheck,
    Target,
    User,
    XCircle,
} from 'lucide-react';
import * as forge from 'node-forge';
import { useMemo } from 'react';

interface CertificateViewerProps {
    isOpen: boolean;
    onClose: () => void;
    certificate: DeviceCertificateItem | null;
}

export function CertificateViewer({
    isOpen,
    onClose,
    certificate,
}: CertificateViewerProps) {
    const { toast } = useToast();

    const handleCopy = async (text?: string) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            toast({
                description: 'Copied to clipboard',
            });
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to copy text',
                variant: 'destructive',
            });
        }
    };

    const parsedCert = useMemo(() => {
        if (!certificate || !certificate.Data) return null;

        try {
            let pemMatch = certificate.Data.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/);
            let targetData = certificate.Data;

            if (!pemMatch) {
                const cleanBase64 = certificate.Data.replace(/\\r\\n|\\n|\\r/g, '').trim();
                if (/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
                    const formattedB64 = cleanBase64.match(/.{1,64}/g)?.join('\n');
                    targetData = `-----BEGIN CERTIFICATE-----\n${formattedB64}\n-----END CERTIFICATE-----`;
                }
            }

            const certObj = forge.pki.certificateFromPem(targetData);

            const getAttr = (attributes: any[], name: string) =>
                attributes.find(a => a.name === name || a.shortName === name)?.value || 'N/A';

            return {
                issuer: {
                    cn: getAttr(certObj.issuer.attributes, 'CN'),
                    o: getAttr(certObj.issuer.attributes, 'O'),
                    ou: getAttr(certObj.issuer.attributes, 'OU'),
                },
                subject: {
                    cn: getAttr(certObj.subject.attributes, 'CN'),
                    o: getAttr(certObj.subject.attributes, 'O'),
                    ou: getAttr(certObj.subject.attributes, 'OU'),
                },
                validity: {
                    notBefore: certObj.validity.notBefore,
                    notAfter: certObj.validity.notAfter,
                },
                serialNumber: certObj.serialNumber,
                isExpired: certObj.validity.notAfter < new Date(),
                isNotYetValid: certObj.validity.notBefore > new Date(),
            };
        } catch (e) {
            console.warn("Failed to parse certificate", e);
            return null;
        }
    }, [certificate]);

    const isValid = parsedCert && !parsedCert.isExpired && !parsedCert.isNotYetValid;

    const InfoRow = ({ icon: Icon, label, value, iconColor = "text-muted-foreground", mono = false }: {
        icon: any; label: string; value: string; iconColor?: string; mono?: boolean;
    }) => (
        <div className="flex items-start gap-3 py-2.5">
            <div className={`p-1.5 rounded-md bg-muted/50 mt-0.5 ${iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                <p className={`text-sm font-medium break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-b px-6 pt-6 pb-5">
                    <DialogHeader className="space-y-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <DialogTitle className="text-xl font-semibold">
                                    {certificate?.CommonName || 'Certificate Details'}
                                </DialogTitle>
                                <DialogDescription className="mt-1 flex items-center gap-2">
                                    X.509 Certificate
                                    {parsedCert && (
                                        isValid ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20 gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Valid
                                            </Badge>
                                        ) : parsedCert.isExpired ? (
                                            <Badge variant="destructive" className="gap-1">
                                                <XCircle className="w-3 h-3" /> Expired
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 gap-1">
                                                <Clock className="w-3 h-3" /> Not Yet Valid
                                            </Badge>
                                        )
                                    )}
                                </DialogDescription>
                            </div>
                            {certificate?.IsIdentity && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-200 rounded-full">
                                    <Fingerprint className="w-4 h-4 text-violet-500" />
                                    <span className="text-xs font-semibold text-violet-600">Identity</span>
                                </div>
                            )}
                        </div>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl border bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600/70">Subject</span>
                            </div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">{parsedCert?.subject.cn || certificate?.CommonName || 'N/A'}</p>
                        </div>
                        <div className="p-3 rounded-xl border bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-4 h-4 text-purple-500" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600/70">Issuer</span>
                            </div>
                            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">{parsedCert?.issuer.cn || 'N/A'}</p>
                        </div>
                        <div className="p-3 rounded-xl border bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10">
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarClock className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70">Expires</span>
                            </div>
                            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 truncate">
                                {parsedCert?.validity.notAfter ? new Date(parsedCert.validity.notAfter).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl border bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600/70">Identity</span>
                            </div>
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                {certificate?.IsIdentity ? 'Yes' : 'No'}
                            </p>
                        </div>
                    </div>

                    {/* Decoded Certificate Structure */}
                    {parsedCert && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Key className="w-4 h-4 text-emerald-500" />
                                <span>Decoded Certificate Structure</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Subject Card */}
                                <div className="rounded-xl border overflow-hidden">
                                    <div className="px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-blue-400/5 border-b flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-blue-500/10">
                                            <User className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Subject</span>
                                    </div>
                                    <div className="px-4 py-1 divide-y divide-dashed">
                                        <InfoRow icon={User} label="Common Name" value={parsedCert.subject.cn} iconColor="text-blue-500" />
                                        <InfoRow icon={Building2} label="Organization" value={parsedCert.subject.o} iconColor="text-blue-400" />
                                        <InfoRow icon={Target} label="Org Unit" value={parsedCert.subject.ou} iconColor="text-blue-400" />
                                    </div>
                                </div>

                                {/* Issuer Card */}
                                <div className="rounded-xl border overflow-hidden">
                                    <div className="px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-purple-400/5 border-b flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-purple-500/10">
                                            <Lock className="w-3.5 h-3.5 text-purple-500" />
                                        </div>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Issuer</span>
                                    </div>
                                    <div className="px-4 py-1 divide-y divide-dashed">
                                        <InfoRow icon={User} label="Common Name" value={parsedCert.issuer.cn} iconColor="text-purple-500" />
                                        <InfoRow icon={Building2} label="Organization" value={parsedCert.issuer.o} iconColor="text-purple-400" />
                                        <InfoRow icon={Target} label="Org Unit" value={parsedCert.issuer.ou} iconColor="text-purple-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Validity & Serial */}
                            <div className="rounded-xl border overflow-hidden">
                                <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-b flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-emerald-500/10">
                                        <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Validity & Serial</span>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                                <CalendarDays className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Issued</p>
                                                <p className="text-sm font-medium">{parsedCert.validity.notBefore.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${parsedCert.isExpired ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                                <CalendarClock className={`w-4 h-4 ${parsedCert.isExpired ? 'text-red-500' : 'text-amber-500'}`} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Expires</p>
                                                <p className={`text-sm font-medium ${parsedCert.isExpired ? 'text-red-500' : ''}`}>
                                                    {parsedCert.validity.notAfter.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-cyan-500/10">
                                                <Hash className="w-4 h-4 text-cyan-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Serial</p>
                                                <p className="text-xs font-mono font-medium truncate max-w-[180px]" title={parsedCert.serialNumber}>
                                                    {parsedCert.serialNumber}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Raw Data */}
                    {certificate?.Data && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <span>Raw Data (Base64 / PEM)</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(certificate?.Data)}
                                    className="gap-2 h-8 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </Button>
                            </div>
                            <div className="relative rounded-xl border bg-gradient-to-b from-slate-50/50 to-slate-100/30 dark:from-slate-950/30 dark:to-slate-900/20 overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-100/80 to-transparent dark:from-slate-900/80 pointer-events-none z-10" />
                                <pre className="p-4 pt-6 text-[11px] font-mono overflow-x-auto max-h-[300px] whitespace-pre-wrap break-all text-muted-foreground leading-relaxed">
                                    {certificate?.Data}
                                </pre>
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-100/80 to-transparent dark:from-slate-900/80 pointer-events-none z-10" />
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
