const fs = require('fs');
const vpnPolicyCode = fs.readFileSync('/home/devdattap/UEM-UI/Multi-Platform-UEM/src/components/profiles/IosPolicies/VpnPolicy.tsx', 'utf8');

let perDomainCode = fs.readFileSync('/home/devdattap/UEM-UI/Multi-Platform-UEM/src/components/profiles/IosPolicies/PerDomainVpnPolicy.tsx', 'utf8');

// Add Select imports
perDomainCode = perDomainCode.replace("import { Input } from '@/components/ui/input';", "import { Input } from '@/components/ui/input';\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';");
// Change lucid-react imports
perDomainCode = perDomainCode.replace("import { Edit, Globe, Loader2, Plus, Trash2, X } from 'lucide-react';", "import { ChevronDown, ChevronRight, Edit, Globe, Loader2, Plus, Trash2, X } from 'lucide-react';");

// Add VPN_TYPES
perDomainCode = perDomainCode.replace("export function PerDomainVpnPolicy", "const VPN_TYPES = ['L2TP', 'PPTP', 'IPSec', 'IKEv2', 'AlwaysOn', 'VPN', 'TransparentProxy'] as const;\n\nexport function PerDomainVpnPolicy");

// Update formData initialization
perDomainCode = perDomainCode.replace("onDemandMatchAppEnabled: false,", "onDemandMatchAppEnabled: false,\n        vpnType: 'IKEv2',\n        remoteAddress: '',\n        authName: '',\n        authPassword: '',\n        ikev2: {},\n        ipsec: {},\n        ppp: {},\n        dns: { serverAddresses: [], searchDomains: [] },\n        proxies: {},");

// Add handleNestedChange, etc
const handleNestedSnippet = `
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const toggleSection = (section: string) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

    const handleNestedChange = (section: 'ikev2' | 'ipsec' | 'ppp' | 'dns' | 'proxies', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...(prev[section] as any || {}), [field]: value },
        }));
    };

    const SectionHeader = ({ title, section }: { title: string; section: string }) => (
        <button
            className="flex items-center gap-2 w-full text-left py-2 px-3 bg-muted/50 rounded-md hover:bg-muted transition-colors font-medium text-sm"
            onClick={(e) => { e.preventDefault(); toggleSection(section); }}
        >
            {expandedSections[section] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {title}
        </button>
    );

    const handleChange =`;
perDomainCode = perDomainCode.replace("const handleChange =", handleNestedSnippet);

// Add remoteAddress validation
const validationSnippet = `if (!formData.name?.trim()) {
            toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });
            return;
        }
        if (!formData.remoteAddress?.trim()) {
            toast({ title: 'Validation Error', description: 'Remote address is required', variant: 'destructive' });
            return;
        }`;
perDomainCode = perDomainCode.replace("if (!formData.name?.trim()) {\n            toast({ title: 'Validation Error', description: 'Name is required', variant: 'destructive' });\n            return;\n        }", validationSnippet);

// View mode grid additions
const viewGridAddition = `<div><span className="text-muted-foreground text-sm">VPN Type</span><p className="font-medium">{formData.vpnType}</p></div>
                    <div><span className="text-muted-foreground text-sm">Remote Address</span><p className="font-medium">{formData.remoteAddress || '-'}</p></div>`;
perDomainCode = perDomainCode.replace("<div><span className=\"text-muted-foreground text-sm\">Safari Domains</span>", viewGridAddition + "\n                    <div><span className=\"text-muted-foreground text-sm\">Safari Domains</span>");

// Edit mode base fields
const editModeBaseFields = `<div>
                    <label className="text-sm font-medium">VPN Type <span className="text-red-500">*</span></label>
                    <Select value={formData.vpnType} onValueChange={v => handleChange('vpnType', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {VPN_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm font-medium">Remote Address <span className="text-red-500">*</span></label>
                    <Input value={formData.remoteAddress || ''} onChange={e => handleChange('remoteAddress', e.target.value)} placeholder="vpn.example.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Auth Name</label>
                        <Input value={formData.authName || ''} onChange={e => handleChange('authName', e.target.value)} placeholder="Username" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Auth Password</label>
                        <Input type="password" value={formData.authPassword || ''} onChange={e => handleChange('authPassword', e.target.value)} placeholder="Password" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox checked={formData.onDemandMatchAppEnabled || false} onCheckedChange={v => handleChange('onDemandMatchAppEnabled', v)} />
                    <label className="text-sm">On-Demand Match App Enabled</label>
                </div>`;
                
perDomainCode = perDomainCode.replace(/<div className="flex items-center gap-2">\s*<Checkbox checked=\{formData\.onDemandMatchAppEnabled \|\| false\}.*\}\s*\/>\s*<label className="text-sm">On-Demand Match App Enabled<\/label>\s*<\/div>/g, editModeBaseFields);

// Extract the nested VPN sections from VpnPolicy.tsx
const startIndex = vpnPolicyCode.indexOf('{/* IKEv2 Section */}');
const endIndex = vpnPolicyCode.indexOf('</CardFooter>');
let nestedSections = vpnPolicyCode.substring(startIndex, endIndex);

// We need to stop right before `<CardFooter`, which implies we pull until end of the `</div>` closing `space-y-4`
// Wait, the end index in VpnPolicy.tsx:
// `</div>\n\n            <CardFooter`
// So we just take until the end of Proxies section.
const proxiesEndIndex = vpnPolicyCode.indexOf('</div>\n            </div>\n\n            <CardFooter');
nestedSections = vpnPolicyCode.substring(startIndex, proxiesEndIndex);


perDomainCode = perDomainCode.replace("{renderDomainList('Excluded Domains', 'excludedDomains', 'excluded', 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300')}", "{renderDomainList('Excluded Domains', 'excludedDomains', 'excluded', 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300')}\n\n                " + nestedSections);


fs.writeFileSync('/home/devdattap/UEM-UI/Multi-Platform-UEM/src/components/profiles/IosPolicies/PerDomainVpnPolicy.tsx', perDomainCode);

console.log("Updated PerDomainVpnPolicy.tsx");
