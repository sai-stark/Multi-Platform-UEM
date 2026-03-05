import { DeviceService } from '@/api/services/devices';
import { CertificateViewer } from '@/components/devices/CertificateViewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { DeviceCertificateItem, Platform } from '@/types/models';
import { getErrorMessage } from '@/utils/errorUtils';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DeviceCertificatesTabProps {
    platform: string;
    id: string;
}

export function DeviceCertificatesTab({ platform, id }: DeviceCertificatesTabProps) {
    const { toast } = useToast();
    const [certificates, setCertificates] = useState<DeviceCertificateItem[]>([]);
    const [selectedCertificate, setSelectedCertificate] = useState<DeviceCertificateItem | null>(null);

    useEffect(() => {
        const loadCertificates = async () => {
            if (!platform || !id) return;
            try {
                const certs = await DeviceService.getDeviceCertificates(platform as Platform, id);
                const certsAny = certs as any;
                if (certsAny?.content && Array.isArray(certsAny.content)) {
                    setCertificates(certsAny.content);
                } else if (Array.isArray(certsAny?.CertificateList)) {
                    setCertificates(certsAny.CertificateList);
                } else if (Array.isArray(certs)) {
                    setCertificates(certs);
                } else {
                    setCertificates([]);
                }
            } catch (e) {
                console.error("Failed to load certificates", e);
                setCertificates([]);
                toast({
                    title: "Warning",
                    description: getErrorMessage(e, "Failed to load certificates."),
                    variant: "destructive"
                });
            }
        };

        loadCertificates();
    }, [platform, id, toast]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" /> Installed Certificates
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Common Name</TableHead>
                                <TableHead>Is Identity</TableHead>
                                <TableHead className="w-[100px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!Array.isArray(certificates) || certificates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        No certificates found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                certificates.map((cert, idx) => (
                                    <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium p-4">{cert.CommonName}</TableCell>
                                        <TableCell className="p-4">{cert.IsIdentity ? <Badge variant="outline" className="bg-success/10 text-success">Yes</Badge> : 'No'}</TableCell>
                                        <TableCell className="p-4">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => setSelectedCertificate(cert)}
                                            >
                                                <FileText className="w-4 h-4" /> View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Certificate Viewer Modal */}
            <CertificateViewer
                isOpen={!!selectedCertificate}
                onClose={() => setSelectedCertificate(null)}
                certificate={selectedCertificate}
            />
        </div>
    );
}
