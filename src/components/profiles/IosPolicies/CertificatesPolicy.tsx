import { PolicyService } from "@/api/services/IOSpolicies";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { IosPemCertificatePolicy, IosPkcs12CertificatePolicy, IosPkcsCertificatePolicy, IosRootCertificatePolicy } from "@/types/ios";
import { FileKey, FileText, Info, KeyRound, Loader2, Plus, Shield, ShieldCheck, Trash2, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";

interface CertificatesPolicyProps {
    profileId: string;
    onSaveSuccess?: () => void;
    onCancel?: () => void;
    defaultTab?: string;
}

export function CertificatesPolicy({ profileId, onSaveSuccess, onCancel, defaultTab }: CertificatesPolicyProps) {
    const { t } = useLanguage();
    const { registerSave, setLoading: setContextLoading, setSaveDisabled } = useBaseDialogContext();
    const [loading, setLoadingState] = useState(true);

    const setLoading = (val: boolean) => { setLoadingState(val); setContextLoading(val); };
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'pem' | 'pkcs' | 'pkcs12' | 'root' } | null>(null);

    // PEM State (list)
    const [pemList, setPemList] = useState<IosPemCertificatePolicy[]>([]);
    const [showPemForm, setShowPemForm] = useState(false);
    const [pemFile, setPemFile] = useState<File | null>(null);
    const [pemBase64, setPemBase64] = useState<string>("");

    // PKCS State (list)
    const [pkcsList, setPkcsList] = useState<IosPkcsCertificatePolicy[]>([]);
    const [showPkcsForm, setShowPkcsForm] = useState(false);
    const [pkcsFile, setPkcsFile] = useState<File | null>(null);
    const [pkcsBase64, setPkcsBase64] = useState<string>("");

    // PKCS12 State (List)
    const [pkcs12List, setPkcs12List] = useState<IosPkcs12CertificatePolicy[]>([]);
    const [showPkcs12Form, setShowPkcs12Form] = useState(false);
    const [p12File, setP12File] = useState<File | null>(null);
    const [p12Base64, setP12Base64] = useState<string>("");
    const [p12Password, setP12Password] = useState("");
    const [p12AllowAccess, setP12AllowAccess] = useState(false);
    const [p12Extractable, setP12Extractable] = useState(true);

    // Root Certificate State
    const [rootCertsList, setRootCertsList] = useState<IosRootCertificatePolicy[]>([]);
    const [showRootForm, setShowRootForm] = useState(false);
    const [rootFile, setRootFile] = useState<File | null>(null);
    const [rootBase64, setRootBase64] = useState<string>("");

    useEffect(() => {
        const fetchPolicies = async () => {
            setLoading(true);
            try {
                try {
                    const pemResp = await PolicyService.getCertPemPolicyList(profileId);
                    if (pemResp?.content) setPemList(pemResp.content);
                } catch (e) { /* ignore 404 */ }

                try {
                    const pkcsResp = await PolicyService.getCertPkcsPolicyList(profileId);
                    if (pkcsResp?.content) setPkcsList(pkcsResp.content);
                } catch (e) { /* ignore 404 */ }

                try {
                    const p12Resp = await PolicyService.getCertPkcs12PolicyList(profileId);
                    if (p12Resp?.content) setPkcs12List(p12Resp.content);
                } catch (e) { /* ignore */ }

                try {
                    const rootResp = await PolicyService.getRootCertificatesPolicyList(profileId);
                    if (rootResp?.content) setRootCertsList(rootResp.content);
                } catch (e) { /* ignore */ }

            } catch (error) {
                console.error("Failed to fetch certificate policies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, [profileId]);

    const getNameFromFile = (file: File | null | undefined, fallbackFileName?: string): string => {
        const filename = file?.name || fallbackFileName || "certificate";
        return filename.replace(/\.[^/.]+$/, "");
    };

    useEffect(() => { registerSave(handleSave); }, []);

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

    // PEM handlers
    const handleAddPem = async () => {
        if (!pemBase64) {
            toast({ title: "Error", description: "Please upload a PEM file.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: getNameFromFile(pemFile),
                policyType: "CertificatePEM",
                certificatePayload: {
                    PayloadContent: pemBase64,
                    PayloadCertificateFileName: pemFile?.name,
                }
            } as IosPemCertificatePolicy;

            const res = await PolicyService.createCertPemPolicy(profileId, payload);
            setPemList([...pemList, res]);
            setShowPemForm(false);
            setPemFile(null);
            setPemBase64("");
            toast({ title: "Success", description: "PEM Certificate added." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to add PEM certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePem = async (certId: string) => {
        setSaving(true);
        try {
            await PolicyService.deleteCertPemPolicyById(profileId, certId);
            setPemList(pemList.filter(c => c.id !== certId));
            toast({ title: "Success", description: "PEM Certificate deleted." });
            setDeleteTarget(null);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete PEM certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // PKCS handlers
    const handleAddPkcs = async () => {
        if (!pkcsBase64) {
            toast({ title: "Error", description: "Please upload a PKCS file.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: getNameFromFile(pkcsFile),
                policyType: "CertificatePKCS",
                certificatePayload: {
                    PayloadContent: pkcsBase64,
                    PayloadCertificateFileName: pkcsFile?.name,
                }
            } as IosPkcsCertificatePolicy;

            const res = await PolicyService.createCertPkcsPolicy(profileId, payload);
            setPkcsList([...pkcsList, res]);
            setShowPkcsForm(false);
            setPkcsFile(null);
            setPkcsBase64("");
            toast({ title: "Success", description: "PKCS Certificate added." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to add PKCS certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePkcs = async (certId: string) => {
        setSaving(true);
        try {
            await PolicyService.deleteCertPkcsPolicyById(profileId, certId);
            setPkcsList(pkcsList.filter(c => c.id !== certId));
            toast({ title: "Success", description: "PKCS Certificate deleted." });
            setDeleteTarget(null);
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
                name: getNameFromFile(p12File),
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
            setDeleteTarget(null);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete PKCS12 certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRootCert = async () => {
        if (!rootBase64) {
            toast({ title: "Error", description: "Please upload a Root Certificate file.", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: getNameFromFile(rootFile),
                payloadCertificateFileName: rootFile?.name,
                payloadContent: rootBase64,
            } as IosRootCertificatePolicy;

            const res = await PolicyService.createRootCertificatePolicy(profileId, payload);
            setRootCertsList([...rootCertsList, res]);
            setShowRootForm(false);
            setRootFile(null);
            setRootBase64("");
            toast({ title: "Success", description: "Root Certificate added." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to add Root certificate.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRootCert = async (certId: string) => {
        setSaving(true);
        try {
            await PolicyService.deleteRootCertificatePolicy(profileId, certId);
            setRootCertsList(rootCertsList.filter(c => c.id !== certId));
            toast({ title: "Success", description: "Root Certificate deleted." });
            setDeleteTarget(null);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete Root certificate.", variant: "destructive" });
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
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-end gap-2 pb-4 border-b">
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={defaultTab}>

                {/* PEM Certificates */}
                <AccordionItem value="pem" className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline [&[data-state=open]]:border-b">
                        <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span>PEM Certificates</span>
                                {pemList.length > 0 && <span className="bg-success text-success-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{pemList.length} Active</span>}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-6 bg-muted/30">

                        {pemList.length > 0 ? (
                            <div className="space-y-3">
                                {pemList.map(cert => (
                                    <Card key={cert.id} className="bg-background">
                                        <div className="flex items-center justify-between p-3">
                                            <div>
                                                <p className="font-medium text-sm">{cert.certificatePayload?.PayloadCertificateFileName || cert.name || 'Unnamed Certificate'}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">ID: {cert.id}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => setDeleteTarget({ id: cert.id!, type: 'pem' })} disabled={saving}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic text-center py-4">No PEM certificates uploaded.</p>
                        )}

                        {!showPemForm ? (
                            <Button variant="outline" className="w-full border-dashed" onClick={() => setShowPemForm(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Add PEM Certificate
                            </Button>
                        ) : (
                            <Card className="border-primary/20 bg-background shadow-sm">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                                        <h4 className="font-medium text-sm text-foreground">New PEM Certificate</h4>
                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setShowPemForm(false); setPemFile(null); setPemBase64(""); }}>Cancel</Button>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Upload .pem file <span className="text-destructive">*</span></Label>
                                        <Input
                                            type="file"
                                            accept=".pem,.cer,.crt"
                                            onChange={(e) => handleFileUpload(e, setPemFile, setPemBase64)}
                                        />
                                        {pemFile && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Info className="w-3 h-3" />
                                                {pemFile.name}
                                            </p>
                                        )}
                                    </div>
                                    <Button className="w-full mt-2" onClick={handleAddPem} disabled={saving || !pemBase64}>
                                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload & Save
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                    </AccordionContent>
                </AccordionItem>

                {/* PKCS Certificates */}
                <AccordionItem value="pkcs" className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline [&[data-state=open]]:border-b">
                        <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                                <FileKey className="w-4 h-4 text-muted-foreground" />
                                <span>PKCS Certificates</span>
                                {pkcsList.length > 0 && <span className="bg-success text-success-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{pkcsList.length} Active</span>}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-6 bg-muted/30">

                        {pkcsList.length > 0 ? (
                            <div className="space-y-3">
                                {pkcsList.map(cert => (
                                    <Card key={cert.id} className="bg-background">
                                        <div className="flex items-center justify-between p-3">
                                            <div>
                                                <p className="font-medium text-sm">{cert.certificatePayload?.PayloadCertificateFileName || cert.name || 'Unnamed Certificate'}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">ID: {cert.id}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => setDeleteTarget({ id: cert.id!, type: 'pkcs' })} disabled={saving}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic text-center py-4">No PKCS certificates uploaded.</p>
                        )}

                        {!showPkcsForm ? (
                            <Button variant="outline" className="w-full border-dashed" onClick={() => setShowPkcsForm(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Add PKCS Certificate
                            </Button>
                        ) : (
                            <Card className="border-primary/20 bg-background shadow-sm">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                                        <h4 className="font-medium text-sm text-foreground">New PKCS Certificate</h4>
                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setShowPkcsForm(false); setPkcsFile(null); setPkcsBase64(""); }}>Cancel</Button>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Upload PKCS file (DER/CER) <span className="text-destructive">*</span></Label>
                                        <Input
                                            type="file"
                                            accept=".der,.cer,.crt"
                                            onChange={(e) => handleFileUpload(e, setPkcsFile, setPkcsBase64)}
                                        />
                                        {pkcsFile && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Info className="w-3 h-3" />
                                                {pkcsFile.name}
                                            </p>
                                        )}
                                    </div>
                                    <Button className="w-full mt-2" onClick={handleAddPkcs} disabled={saving || !pkcsBase64}>
                                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload & Save
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                    </AccordionContent>
                </AccordionItem>

                {/* PKCS12 Certificate */}
                <AccordionItem value="pkcs12" className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline [&[data-state=open]]:border-b">
                        <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-muted-foreground" />
                                <span>PKCS12 Certificates</span>
                                {pkcs12List.length > 0 && <span className="bg-success text-success-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{pkcs12List.length} Active</span>}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-6 bg-muted/30">

                        {pkcs12List.length > 0 ? (
                            <div className="space-y-3">
                                {pkcs12List.map(cert => (
                                    <Card key={cert.id} className="bg-background">
                                        <div className="flex items-center justify-between p-3">
                                            <div>
                                                <p className="font-medium text-sm">{cert.certificatePayload?.PayloadCertificateFileName || 'Unnamed Certificate'}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">ID: {cert.id}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => setDeleteTarget({ id: cert.id!, type: 'pkcs12' })} disabled={saving}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic text-center py-4">No PKCS12 certificates uploaded.</p>
                        )}

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

                {/* Root Certificate */}
                <AccordionItem value="root" className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline [&[data-state=open]]:border-b">
                        <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                                <span>Root Certificates</span>
                                {rootCertsList.length > 0 && <span className="bg-success text-success-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{rootCertsList.length} Active</span>}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-6 bg-muted/30">
                        {rootCertsList.length > 0 ? (
                            <div className="space-y-3">
                                {rootCertsList.map(cert => (
                                    <Card key={cert.id} className="bg-background">
                                        <div className="flex items-center justify-between p-3">
                                            <div>
                                                <p className="font-medium text-sm">{cert.payloadCertificateFileName || 'Unnamed Certificate'}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">ID: {cert.id}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={() => setDeleteTarget({ id: cert.id!, type: 'root' })} disabled={saving}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic text-center py-4">No Root certificates uploaded.</p>
                        )}

                        {!showRootForm ? (
                            <Button variant="outline" className="w-full border-dashed" onClick={() => setShowRootForm(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Add Root Certificate
                            </Button>
                        ) : (
                            <Card className="border-primary/20 bg-background shadow-sm">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                                        <h4 className="font-medium text-sm text-foreground">New Root Certificate</h4>
                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowRootForm(false)}>Cancel</Button>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Upload .pem, .cer, or .crt file <span className="text-destructive">*</span></Label>
                                        <Input
                                            type="file"
                                            accept=".pem,.cer,.crt"
                                            onChange={(e) => handleFileUpload(e, setRootFile, setRootBase64)}
                                        />
                                    </div>

                                    <Button className="w-full mt-2" onClick={handleSaveRootCert} disabled={saving || !rootBase64}>
                                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload & Save
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this certificate? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
                            if (!deleteTarget) return;
                            if (deleteTarget.type === 'pem') handleDeletePem(deleteTarget.id);
                            if (deleteTarget.type === 'pkcs') handleDeletePkcs(deleteTarget.id);
                            if (deleteTarget.type === 'pkcs12') handleDeletePkcs12(deleteTarget.id);
                            if (deleteTarget.type === 'root') handleDeleteRootCert(deleteTarget.id);
                        }}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
