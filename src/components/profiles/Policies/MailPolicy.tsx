import { PolicyService } from '@/api/services/policies';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { IosMailPolicy } from '@/types/models';
import { useState } from 'react';

interface MailPolicyProps {
    profileId: string;
    initialData?: IosMailPolicy;
    onSave: () => void;
    onCancel: () => void;
}

type EmailAccountType = 'EmailTypeIMAP' | 'EmailTypePOP';
type EmailAuthType = 'EmailAuthNone' | 'EmailAuthPassword' | 'EmailAuthCRAMMD5' | 'EmailAuthNTLM' | 'EmailAuthHTTPMD5';

const defaultMailPolicy: Partial<IosMailPolicy> = {
    policyType: 'IosMail',
    name: '',
    emailAccountType: 'EmailTypeIMAP',
    incomingMailServerAuthentication: 'EmailAuthPassword',
    incomingMailServerHostName: '',
    incomingMailServerUseSSL: true,
    outgoingMailServerAuthentication: 'EmailAuthPassword',
    outgoingMailServerHostName: '',
    outgoingMailServerUseSSL: true,
    outgoingPasswordSameAsIncomingPassword: true,
    preventMove: false,
    preventAppSheet: false,
    smimeEnabled: false,
    allowMailDrop: false,
    disableMailRecentsSyncing: false,
};

export function MailPolicy({ profileId, initialData, onSave, onCancel }: MailPolicyProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<IosMailPolicy>>(
        initialData || defaultMailPolicy
    );

    const handleChange = <K extends keyof IosMailPolicy>(field: K, value: IosMailPolicy[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.name?.trim()) {
            toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
            return;
        }
        if (!formData.incomingMailServerHostName?.trim()) {
            toast({ title: "Validation Error", description: "Incoming mail server is required", variant: "destructive" });
            return;
        }
        if (!formData.outgoingMailServerHostName?.trim()) {
            toast({ title: "Validation Error", description: "Outgoing mail server is required", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await PolicyService.createIosMailPolicy(profileId, formData as IosMailPolicy);
            toast({ title: "Success", description: "Mail policy saved successfully" });
            onSave();
        } catch (error) {
            console.error("Failed to save mail policy", error);
            toast({ title: "Error", description: "Failed to save mail policy", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6 py-4">
                {/* Basic Settings */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Basic Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Policy Name <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                placeholder="e.g. Corporate Mail"
                                value={formData.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emailAccountType">Account Type <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.emailAccountType}
                                onValueChange={(val: EmailAccountType) => handleChange('emailAccountType', val)}
                            >
                                <SelectTrigger id="emailAccountType">
                                    <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EmailTypeIMAP">IMAP</SelectItem>
                                    <SelectItem value="EmailTypePOP">POP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emailAccountDescription">Account Description</Label>
                            <Input
                                id="emailAccountDescription"
                                placeholder="e.g. Work Email"
                                value={formData.emailAccountDescription || ''}
                                onChange={(e) => handleChange('emailAccountDescription', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emailAccountName">Account Name</Label>
                            <Input
                                id="emailAccountName"
                                placeholder="e.g. John Doe"
                                value={formData.emailAccountName || ''}
                                onChange={(e) => handleChange('emailAccountName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="emailAddress">Email Address</Label>
                            <Input
                                id="emailAddress"
                                type="email"
                                placeholder="e.g. john.doe@company.com"
                                value={formData.emailAddress || ''}
                                onChange={(e) => handleChange('emailAddress', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Incoming Mail Server */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Incoming Mail Server (IMAP/POP)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="incomingMailServerHostName">Server Host <span className="text-destructive">*</span></Label>
                            <Input
                                id="incomingMailServerHostName"
                                placeholder="e.g. imap.company.com"
                                value={formData.incomingMailServerHostName || ''}
                                onChange={(e) => handleChange('incomingMailServerHostName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="incomingMailServerPortNumber">Port</Label>
                            <Input
                                id="incomingMailServerPortNumber"
                                type="number"
                                placeholder="993"
                                value={formData.incomingMailServerPortNumber || ''}
                                onChange={(e) => handleChange('incomingMailServerPortNumber', parseInt(e.target.value) || undefined)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="incomingMailServerAuthentication">Authentication <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.incomingMailServerAuthentication}
                                onValueChange={(val: EmailAuthType) => handleChange('incomingMailServerAuthentication', val)}
                            >
                                <SelectTrigger id="incomingMailServerAuthentication">
                                    <SelectValue placeholder="Select authentication" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EmailAuthNone">None</SelectItem>
                                    <SelectItem value="EmailAuthPassword">Password</SelectItem>
                                    <SelectItem value="EmailAuthCRAMMD5">CRAM-MD5</SelectItem>
                                    <SelectItem value="EmailAuthNTLM">NTLM</SelectItem>
                                    <SelectItem value="EmailAuthHTTPMD5">HTTP MD5 Digest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="incomingMailServerUsername">Username</Label>
                            <Input
                                id="incomingMailServerUsername"
                                placeholder="Username"
                                value={formData.incomingMailServerUsername || ''}
                                onChange={(e) => handleChange('incomingMailServerUsername', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="incomingPassword">Password</Label>
                            <Input
                                id="incomingPassword"
                                type="password"
                                placeholder="Password"
                                value={formData.incomingPassword || ''}
                                onChange={(e) => handleChange('incomingPassword', e.target.value)}
                            />
                        </div>
                        {formData.emailAccountType === 'EmailTypeIMAP' && (
                            <div className="space-y-2">
                                <Label htmlFor="incomingMailServerIMAPPathPrefix">IMAP Path Prefix</Label>
                                <Input
                                    id="incomingMailServerIMAPPathPrefix"
                                    placeholder="e.g. INBOX"
                                    value={formData.incomingMailServerIMAPPathPrefix || ''}
                                    onChange={(e) => handleChange('incomingMailServerIMAPPathPrefix', e.target.value)}
                                />
                            </div>
                        )}
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="incomingMailServerUseSSL"
                                checked={formData.incomingMailServerUseSSL ?? false}
                                onCheckedChange={(checked) => handleChange('incomingMailServerUseSSL', checked as boolean)}
                            />
                            <Label htmlFor="incomingMailServerUseSSL" className="cursor-pointer">Use SSL</Label>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Outgoing Mail Server */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Outgoing Mail Server (SMTP)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="outgoingMailServerHostName">Server Host <span className="text-destructive">*</span></Label>
                            <Input
                                id="outgoingMailServerHostName"
                                placeholder="e.g. smtp.company.com"
                                value={formData.outgoingMailServerHostName || ''}
                                onChange={(e) => handleChange('outgoingMailServerHostName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="outgoingMailServerPortNumber">Port</Label>
                            <Input
                                id="outgoingMailServerPortNumber"
                                type="number"
                                placeholder="587"
                                value={formData.outgoingMailServerPortNumber || ''}
                                onChange={(e) => handleChange('outgoingMailServerPortNumber', parseInt(e.target.value) || undefined)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="outgoingMailServerAuthentication">Authentication <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.outgoingMailServerAuthentication}
                                onValueChange={(val: EmailAuthType) => handleChange('outgoingMailServerAuthentication', val)}
                            >
                                <SelectTrigger id="outgoingMailServerAuthentication">
                                    <SelectValue placeholder="Select authentication" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EmailAuthNone">None</SelectItem>
                                    <SelectItem value="EmailAuthPassword">Password</SelectItem>
                                    <SelectItem value="EmailAuthCRAMMD5">CRAM-MD5</SelectItem>
                                    <SelectItem value="EmailAuthNTLM">NTLM</SelectItem>
                                    <SelectItem value="EmailAuthHTTPMD5">HTTP MD5 Digest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Checkbox
                                id="outgoingPasswordSameAsIncomingPassword"
                                checked={formData.outgoingPasswordSameAsIncomingPassword ?? false}
                                onCheckedChange={(checked) => handleChange('outgoingPasswordSameAsIncomingPassword', checked as boolean)}
                            />
                            <Label htmlFor="outgoingPasswordSameAsIncomingPassword" className="cursor-pointer">
                                Same password as incoming
                            </Label>
                        </div>
                        {!formData.outgoingPasswordSameAsIncomingPassword && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="outgoingMailServerUsername">Username</Label>
                                    <Input
                                        id="outgoingMailServerUsername"
                                        placeholder="Username"
                                        value={formData.outgoingMailServerUsername || ''}
                                        onChange={(e) => handleChange('outgoingMailServerUsername', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="outgoingPassword">Password</Label>
                                    <Input
                                        id="outgoingPassword"
                                        type="password"
                                        placeholder="Password"
                                        value={formData.outgoingPassword || ''}
                                        onChange={(e) => handleChange('outgoingPassword', e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="outgoingMailServerUseSSL"
                                checked={formData.outgoingMailServerUseSSL ?? false}
                                onCheckedChange={(checked) => handleChange('outgoingMailServerUseSSL', checked as boolean)}
                            />
                            <Label htmlFor="outgoingMailServerUseSSL" className="cursor-pointer">Use SSL</Label>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Security & Restrictions */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Security & Restrictions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="preventMove"
                                checked={formData.preventMove ?? false}
                                onCheckedChange={(checked) => handleChange('preventMove', checked as boolean)}
                            />
                            <Label htmlFor="preventMove" className="cursor-pointer">
                                Prevent moving messages to other accounts
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="preventAppSheet"
                                checked={formData.preventAppSheet ?? false}
                                onCheckedChange={(checked) => handleChange('preventAppSheet', checked as boolean)}
                            />
                            <Label htmlFor="preventAppSheet" className="cursor-pointer">
                                Prevent sending from third-party apps
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="disableMailRecentsSyncing"
                                checked={formData.disableMailRecentsSyncing ?? false}
                                onCheckedChange={(checked) => handleChange('disableMailRecentsSyncing', checked as boolean)}
                            />
                            <Label htmlFor="disableMailRecentsSyncing" className="cursor-pointer">
                                Disable recent address syncing
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="allowMailDrop"
                                checked={formData.allowMailDrop ?? false}
                                onCheckedChange={(checked) => handleChange('allowMailDrop', checked as boolean)}
                            />
                            <Label htmlFor="allowMailDrop" className="cursor-pointer">
                                Allow Mail Drop
                            </Label>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* S/MIME Settings */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-sm font-medium text-muted-foreground">S/MIME Settings</h3>
                        <Checkbox
                            id="smimeEnabled"
                            checked={formData.smimeEnabled ?? false}
                            onCheckedChange={(checked) => handleChange('smimeEnabled', checked as boolean)}
                        />
                        <Label htmlFor="smimeEnabled" className="cursor-pointer text-sm">Enable S/MIME</Label>
                    </div>
                    {formData.smimeEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="smimeSigningEnabled"
                                    checked={formData.smimeSigningEnabled ?? false}
                                    onCheckedChange={(checked) => handleChange('smimeSigningEnabled', checked as boolean)}
                                />
                                <Label htmlFor="smimeSigningEnabled" className="cursor-pointer">Enable Signing</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="smimeEncryptionEnabled"
                                    checked={formData.smimeEncryptionEnabled ?? false}
                                    onCheckedChange={(checked) => handleChange('smimeEncryptionEnabled', checked as boolean)}
                                />
                                <Label htmlFor="smimeEncryptionEnabled" className="cursor-pointer">Enable Encryption</Label>
                            </div>
                            {formData.smimeSigningEnabled && (
                                <div className="space-y-2">
                                    <Label htmlFor="smimeSigningCertificateUUID">Signing Certificate UUID</Label>
                                    <Input
                                        id="smimeSigningCertificateUUID"
                                        placeholder="UUID"
                                        value={formData.smimeSigningCertificateUUID || ''}
                                        onChange={(e) => handleChange('smimeSigningCertificateUUID', e.target.value)}
                                    />
                                </div>
                            )}
                            {formData.smimeEncryptionEnabled && (
                                <div className="space-y-2">
                                    <Label htmlFor="smimeEncryptionCertificateUUID">Encryption Certificate UUID</Label>
                                    <Input
                                        id="smimeEncryptionCertificateUUID"
                                        placeholder="UUID"
                                        value={formData.smimeEncryptionCertificateUUID || ''}
                                        onChange={(e) => handleChange('smimeEncryptionCertificateUUID', e.target.value)}
                                    />
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="smimeEncryptByDefault"
                                    checked={formData.smimeEncryptByDefault ?? false}
                                    onCheckedChange={(checked) => handleChange('smimeEncryptByDefault', checked as boolean)}
                                />
                                <Label htmlFor="smimeEncryptByDefault" className="cursor-pointer">Encrypt by default</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="smimeEnableEncryptionPerMessageSwitch"
                                    checked={formData.smimeEnableEncryptionPerMessageSwitch ?? false}
                                    onCheckedChange={(checked) => handleChange('smimeEnableEncryptionPerMessageSwitch', checked as boolean)}
                                />
                                <Label htmlFor="smimeEnableEncryptionPerMessageSwitch" className="cursor-pointer">
                                    Per-message encryption switch
                                </Label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CardFooter className="flex justify-between px-0 pt-6">
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Mail Policy'}
                </Button>
            </CardFooter>
        </>
    );
}
