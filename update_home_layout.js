const fs = require('fs');

const path = '/home/devdattap/UEM-UI/Multi-Platform-UEM/src/components/profiles/IosPolicies/HomeScreenLayoutPolicy.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add isEditing state
code = code.replace(
    'const { toast } = useToast();\n    const [saving, setSaving] = useState(false);',
    'const { toast } = useToast();\n    const [saving, setSaving] = useState(false);\n    const [isEditing, setIsEditing] = useState(!initialData?.id);'
);

// Add the view block
const viewBlock = `
    if (!isEditing && initialData) {
        return (
            <div className="space-y-6 max-w-4xl mt-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-full">
                            <Layout className="w-6 h-6 text-teal-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Home Screen Layout</h3>
                            <p className="text-sm text-muted-foreground">Managed iOS home screen configuration</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Dock Summary */}
                    <div className="border rounded-lg p-4 bg-muted/20">
                        <h4 className="text-sm font-semibold mb-3 border-b pb-2">Dock ({initialData.configuration.Dock?.length || 0} items)</h4>
                        {(!initialData.configuration.Dock || initialData.configuration.Dock.length === 0) ? (
                            <p className="text-sm text-muted-foreground italic">No dock items configured.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {initialData.configuration.Dock.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 bg-background border px-3 py-1.5 rounded-full text-sm">
                                        <span className="font-semibold text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{item.Type}</span>
                                        <span className="truncate max-w-[150px]">{item.DisplayName || item.BundleID || 'Unnamed'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pages Summary */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Pages ({initialData.configuration.Pages?.length || 0})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {initialData.configuration.Pages?.map((page, pIdx) => (
                                <div key={pIdx} className="border rounded-lg p-4 bg-muted/5">
                                    <h5 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Page {pIdx + 1}</h5>
                                    {page.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">Empty page</p>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {page.map((item, iIdx) => (
                                                <div key={iIdx} className="flex items-center gap-2 bg-background border px-3 py-2 rounded-md text-sm">
                                                    <span className="font-semibold text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">{item.Type.substring(0,3)}</span>
                                                    <span className="truncate">{item.DisplayName || item.BundleID || 'Unnamed'}</span>
                                                    {item.Type === 'Folder' && item.Pages?.[0] && (
                                                        <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 rounded-full">{item.Pages[0].length}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onCancel} disabled={saving}>Close</Button>
                </div>
            </div>
        );
    }
`;

code = code.replace(
    'return (\n        <div className="space-y-6 max-w-4xl mt-6">',
    viewBlock + '\n\n    return (\n        <div className="space-y-6 max-w-4xl mt-6">'
);

// Replace generic "Cancel" button on Edit mode footer to support view mode toggle
code = code.replace(
    '<Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>',
    '<Button variant="outline" onClick={initialData?.id ? () => setIsEditing(false) : onCancel} disabled={saving}>Cancel</Button>'
);

fs.writeFileSync(path, code);
