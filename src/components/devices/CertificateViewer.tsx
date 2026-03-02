import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { DeviceCertificateItem } from '@/types/models';
import { CalendarDays, Copy, FileText, Key, Shield, Target, User } from 'lucide-react';
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
                // Attempt to convert bare base64 to PEM
                const cleanBase64 = certificate.Data.replace(/\\r\\n|\\n|\\r/g, '').trim();
                // Basic B64 regex check
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
                    notBefore: certObj.validity.notBefore.toLocaleString(),
                    notAfter: certObj.validity.notAfter.toLocaleString()
                },
                serialNumber: certObj.serialNumber
            };
        } catch (e) {
            console.warn("Failed to parse certificate", e);
            return null; // Silent degradation
        }
    }, [certificate]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-primary/10">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                Certificate Details
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                View properties and raw X.509/PEM data
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 mt-4">
                    {/* Main Properties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/30 border space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Common Name
                            </span>
                            <p className="font-medium text-sm break-all">
                                {certificate?.CommonName || 'N/A'}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30 border space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Identity Certificate
                            </span>
                            <div className="pt-1">
                                {certificate?.IsIdentity ? (
                                    <Badge
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200"
                                    >
                                        Yes
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">No</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Parsed Decoded Data */}
                    {parsedCert && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 border-b pb-2">
                                <Key className="w-4 h-4" /> Decoded Certificate Structure
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Subject */}
                                <div className="space-y-2 p-3 border rounded-lg bg-card">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                        <User className="w-3 h-3" /> Subject
                                    </span>
                                    <div className="text-sm">
                                        <p><span className="font-medium">CN:</span> {parsedCert.subject.cn}</p>
                                        <p><span className="font-medium">O:</span> {parsedCert.subject.o}</p>
                                        <p><span className="font-medium">OU:</span> {parsedCert.subject.ou}</p>
                                    </div>
                                </div>
                                {/* Issuer */}
                                <div className="space-y-2 p-3 border rounded-lg bg-card">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                        <Target className="w-3 h-3" /> Issuer
                                    </span>
                                    <div className="text-sm">
                                        <p><span className="font-medium">CN:</span> {parsedCert.issuer.cn}</p>
                                        <p><span className="font-medium">O:</span> {parsedCert.issuer.o}</p>
                                        <p><span className="font-medium">OU:</span> {parsedCert.issuer.ou}</p>
                                    </div>
                                </div>
                                {/* Validity */}
                                <div className="space-y-2 p-3 border rounded-lg bg-card md:col-span-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                        <CalendarDays className="w-3 h-3" /> Validity Period
                                    </span>
                                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-between text-sm">
                                        <p><span className="font-medium">Issued:</span> {parsedCert.validity.notBefore}</p>
                                        <p><span className="font-medium">Expires:</span> {parsedCert.validity.notAfter}</p>
                                        <p className="font-mono text-xs"><span className="font-medium">Serial:</span> {parsedCert.serialNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Raw Data */}
                    {certificate?.Data && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Raw Data (Base64 / PEM)
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(certificate?.Data)}
                                    className="gap-2 h-8"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy Data
                                </Button>
                            </div>
                            <div className="relative rounded-md border bg-muted/50 overflow-hidden">
                                <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[400px] whitespace-pre-wrap break-all text-muted-foreground">
                                    {certificate?.Data}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
