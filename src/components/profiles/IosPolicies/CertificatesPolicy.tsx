import { PolicyService } from "@/api/services/IOSpolicies";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { IosPemCertificatePolicy, IosPkcs12CertificatePolicy, IosPkcsCertificatePolicy } from "@/types/ios";
import { Info, Loader2, Plus, Trash2, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CertificatesPolicyProps {
    profileId: string;
    onSaveSuccess?: () => void;
    onCancel?: () => void;
}

export function CertificatesPolicy({ profileId, onSaveSuccess, onCancel }: CertificatesPolicyProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // PEM State
    const [pemPolicy, setPemPolicy] = useState<IosPemCertificatePolicy | null>(null);
    const [pemFile, setPemFile] = useState<File | null>(null);
    const [pemBase64, setPemBase64] = useState<string>("");

    // PKCS State
    const [pkcsPolicy, setPkcsPolicy] = useState<IosPkcsCertificatePolicy | null>(null);
    const [pkcsFile, setPkcsFile] = useState<File | null>(null);
    const [pkcsBase64, setPkcsBase64] = useState<string>("");

    // PKCS12 State (List)
    const [pkcs12List, setPkcs12List] = useState<IosPkcs12CertificatePolicy[]>([]);

    // New PKCS12 Form State
    const [showPkcs12Form, setShowPkcs12Form] = useState(false);
    const [p12File, setP12File] = useState<File | null>(null);
    const [p12Base64, setP12Base64] = useState<string>("");
    const [p12Password, setP12Password] = useState("");
    const [p12AllowAccess, setP12AllowAccess] = useState(false);
    const [p12Extractable, setP12Extractable] = useState(true);

    useEffect(() => {
        const fetchPolicies = async () => {
            setLoading(true);
            try {
                // Fetch PEM
                try {
                    const pem = await PolicyService.getCertPemPolicy(profileId);
                    if (pem && pem.id) setPemPolicy(pem);
                } catch (e) { /* ignore 404 */ }

                // Fetch PKCS
                try {
                    const pkcs = await PolicyService.getCertPkcsPolicy(profileId);
                    if (pkcs && pkcs.id) setPkcsPolicy(pkcs);
                } catch (e) { /* ignore 404 */ }

                // Fetch PKCS12 List
                try {
                    const p12Resp = await PolicyService.getCertPkcs12PolicyList(profileId);
                    if (p12Resp && p12Resp.content) {
                        setPkcs12List(p12Resp.content);
                    }
                } catch (e) { /* ignore */ }

            } catch (error) {
                console.error("Failed to fetch certificate policies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, [profileId]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File) => void, setBase64: (s: string) => void) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            setBase64(base64String);
        };
        reader.readAsDataURL(file);
    };

    const handleSavePem = async () => {
        if (!pemBase64 && !pemPolicy?.id) {
            toast({ title: "Error", description: "Please upload a PEM file.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                id: pemPolicy?.id,
                name: "ios",
                policyType: "CertificatePEM",
                certificatePayload: {
                    PayloadContent: pemBase64 || pemPolicy?.certificatePayload?.PayloadContent || "",
                    PayloadCertificateFileName: pemFile?.name || pemPolicy?.certificatePayload?.PayloadCertificateFileName
                }
            } as IosPemCertificatePolicy;

            if (pemPolicy?.id) {
                await PolicyService.updateCertPemPolicy(profileId, payload);
            } else {
                const res = await PolicyService.createCertPemPolicy(profileId, payload);
                setPemPolicy(res);
            }
            toast({ title: "Success", description: "PEM Certificate saved." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save PEM certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePem = async () => {
        if (!pemPolicy?.id) return;
        setSaving(true);
        try {
            await PolicyService.deleteCertPemPolicy(profileId);
            setPemPolicy(null);
            setPemFile(null);
            setPemBase64("");
            toast({ title: "Success", description: "PEM Certificate deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete PEM certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePkcs = async () => {
        if (!pkcsBase64 && !pkcsPolicy?.id) {
            toast({ title: "Error", description: "Please upload a PKCS file.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                id: pkcsPolicy?.id,
                name: "ios",
                policyType: "CertificatePKCS",
                certificatePayload: {
                    PayloadContent: pkcsBase64 || pkcsPolicy?.certificatePayload?.PayloadContent || "",
                    PayloadCertificateFileName: pkcsFile?.name || pkcsPolicy?.certificatePayload?.PayloadCertificateFileName
                }
            } as IosPkcsCertificatePolicy;

            if (pkcsPolicy?.id) {
                await PolicyService.updateCertPkcsPolicy(profileId, payload);
            } else {
                const res = await PolicyService.createCertPkcsPolicy(profileId, payload);
                setPkcsPolicy(res);
            }
            toast({ title: "Success", description: "PKCS Certificate saved." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to save PKCS certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePkcs = async () => {
        if (!pkcsPolicy?.id) return;
        setSaving(true);
        try {
            await PolicyService.deleteCertPkcsPolicy(profileId);
            setPkcsPolicy(null);
            setPkcsFile(null);
            setPkcsBase64("");
            toast({ title: "Success", description: "PKCS Certificate deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete PKCS certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePkcs12 = async () => {
        if (!p12Base64) {
            toast({ title: "Error", description: "Please upload a PKCS12 file.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: "ios",
                policyType: "CertificatePKCS12",
                certificatePayload: {
                    PayloadContent: p12Base64,
                    PayloadCertificateFileName: p12File?.name,
                    Password: p12Password,
                    AllowAllAppsAccess: p12AllowAccess,
                    KeyIsExtractable: p12Extractable,
                }
            } as IosPkcs12CertificatePolicy;

            const res = await PolicyService.createCertPkcs12Policy(profileId, payload);
            setPkcs12List([...pkcs12List, res]);
            // Reset form
            setShowPkcs12Form(false);
            setP12File(null);
            setP12Base64("");
            setP12Password("");
            setP12AllowAccess(false);
            setP12Extractable(true);
            toast({ title: "Success", description: "PKCS12 Certificate added." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to add PKCS12 certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePkcs12 = async (certId: string) => {
        setSaving(true);
        try {
            await PolicyService.deleteCertPkcs12Policy(profileId, certId);
            setPkcs12List(pkcs12List.filter(c => c.id !== certId));
            toast({ title: "Success", description: "PKCS12 Certificate deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete PKCS12 certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full">

                {/* PEM Certificate */}
                <AccordionItem value="pem">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                            <span>PEM Certificate</span>
                            {pemPolicy?.id && <span className="bg-success text-success-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Configured</span>}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-muted/30 border border-t-0 rounded-b-md">
                        <div className="grid gap-2">
                            <Label>Upload .pem file <span className="text-destructive">*</span></Label>
                            <Input
                                type="file"
                                accept=".pem,.cer,.crt"
                                onChange={(e) => handleFileUpload(e, setPemFile, setPemBase64)}
                            />
                            {(pemFile || pemPolicy?.certificatePayload?.PayloadCertificateFileName) && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Info className="w-3 h-3" />
                                    Current File: {pemFile?.name || pemPolicy?.certificatePayload?.PayloadCertificateFileName}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            {pemPolicy?.id && (
                                <Button variant="destructive" size="sm" onClick={handleDeletePem} disabled={saving}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            )}
                            <Button size="sm" onClick={handleSavePem} disabled={saving || (!pemBase64 && !pemPolicy?.id)}>
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                {pemPolicy?.id ? 'Update' : 'Upload'}
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* PKCS Certificate */}
                <AccordionItem value="pkcs">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                            <span>PKCS Certificate</span>
                            {pkcsPolicy?.id && <span className="bg-success text-success-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Configured</span>}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4 bg-muted/30 border border-t-0 rounded-b-md">
                        <div className="grid gap-2">
                            <Label>Upload PKCS file (DER/CER) <span className="text-destructive">*</span></Label>
                            <Input
                                type="file"
                                accept=".der,.cer,.crt"
                                onChange={(e) => handleFileUpload(e, setPkcsFile, setPkcsBase64)}
                            />
                            {(pkcsFile || pkcsPolicy?.certificatePayload?.PayloadCertificateFileName) && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Info className="w-3 h-3" />
                                    Current File: {pkcsFile?.name || pkcsPolicy?.certificatePayload?.PayloadCertificateFileName}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            {pkcsPolicy?.id && (
                                <Button variant="destructive" size="sm" onClick={handleDeletePkcs} disabled={saving}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            )}
                            <Button size="sm" onClick={handleSavePkcs} disabled={saving || (!pkcsBase64 && !pkcsPolicy?.id)}>
                                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                {pkcsPolicy?.id ? 'Update' : 'Upload'}
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* PKCS12 Certificate */}
                <AccordionItem value="pkcs12">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                                <span>PKCS12 Certificates</span>
                                {pkcs12List.length > 0 && <span className="bg-success text-success-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{pkcs12List.length} Active</span>}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-6 bg-muted/30 border border-t-0 rounded-b-md">

                        {/* PKCS12 List */}
                        {pkcs12List.length > 0 ? (
                            <div className="space-y-3">
                                {pkcs12List.map(cert => (
                                    <Card key={cert.id} className="bg-background">
                                        <div className="flex items-center justify-between p-3">
                                            <div>
                                                <p className="font-medium text-sm">{cert.certificatePayload?.PayloadCertificateFileName || 'Unnamed Certificate'}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">ID: {cert.id}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => handleDeletePkcs12(cert.id!)} disabled={saving}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic text-center py-4">No PKCS12 certificates uploaded.</p>
                        )}

                        {/* Add New PKCS12 */}
                        {!showPkcs12Form ? (
                            <Button variant="outline" className="w-full border-dashed" onClick={() => setShowPkcs12Form(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Add PKCS12 Identity
                            </Button>
                        ) : (
                            <Card className="border-primary/20 bg-background shadow-sm">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                                        <h4 className="font-medium text-sm text-foreground">New PKCS12 Identity</h4>
                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowPkcs12Form(false)}>Cancel</Button>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Upload .p12 file <span className="text-destructive">*</span></Label>
                                        <Input
                                            type="file"
                                            accept=".p12,.pfx"
                                            onChange={(e) => handleFileUpload(e, setP12File, setP12Base64)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Password</Label>
                                        <Input
                                            type="password"
                                            placeholder="Identity Password"
                                            value={p12Password}
                                            onChange={e => setP12Password(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Allow All Apps Access</Label>
                                            <p className="text-xs text-muted-foreground">Give all apps access to private key</p>
                                        </div>
                                        <Switch checked={p12AllowAccess} onCheckedChange={setP12AllowAccess} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Key Is Extractable</Label>
                                            <p className="text-xs text-muted-foreground">Allow private key extraction</p>
                                        </div>
                                        <Switch checked={p12Extractable} onCheckedChange={setP12Extractable} />
                                    </div>

                                    <Button className="w-full mt-2" onClick={handleSavePkcs12} disabled={saving || !p12Base64}>
                                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload & Save
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                    </AccordionContent>
                </AccordionItem>

            </Accordion>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button variant="outline" onClick={onCancel} disabled={saving}>
                    Close
                </Button>
            </div>
        </div>
    );
}
