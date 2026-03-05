import { PolicyService } from "@/api/services/IOSpolicies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FolderIconItem, IconItem, IosHomeScreenLayoutPolicy } from "@/types/ios";
import { getErrorMessage } from "@/utils/errorUtils";
import { AppWindow, Edit, FolderOpen, Globe, GripVertical, Layout, Loader2, Plus, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";

interface HomeScreenLayoutPolicyProps {
    profileId: string;
    initialData?: IosHomeScreenLayoutPolicy;
    onSave: () => void;
    onCancel: () => void;
}

export function HomeScreenLayoutPolicy({ profileId, initialData, onSave, onCancel }: HomeScreenLayoutPolicyProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialData?.id);
    const [formData, setFormData] = useState<IosHomeScreenLayoutPolicy>(
        initialData || {
            name: "ios",
            policyType: "IosHomeScreenLayoutPolicy",
            configuration: {
                Dock: [],
                Pages: [[]],
            },
        } as IosHomeScreenLayoutPolicy
    );

    // === Validation ===
    const validateForm = (): string | null => {
        const config = formData.configuration;
        if (!config.Pages || config.Pages.length === 0) {
            return "At least one page is required (Pages is mandatory).";
        }
        // Validate each item
        for (const dock of config.Dock || []) {
            const err = validateIconItem(dock, "Dock");
            if (err) return err;
        }
        for (let pi = 0; pi < config.Pages.length; pi++) {
            for (const item of config.Pages[pi]) {
                const err = validateIconItem(item, `Page ${pi + 1}`);
                if (err) return err;
            }
        }
        return null;
    };

    const validateIconItem = (item: IconItem, location: string): string | null => {
        if (!item.Type) return `${location}: Item Type is required.`;
        if (item.Type === "Application" && !item.BundleID?.trim()) {
            return `${location}: BundleID is required for Application items.`;
        }
        if (item.Type === "WebClip") {
            if (!item.DisplayName?.trim()) return `${location}: DisplayName is required for WebClip items.`;
            if (!item.URL?.trim()) return `${location}: URL is required for WebClip items.`;
        }
        if (item.Type === "Folder") {
            if (!item.DisplayName?.trim()) return `${location}: DisplayName is required for Folder items.`;
        }
        return null;
    };

    const handleSave = async () => {
        const error = validateForm();
        if (error) {
            toast({ title: "Validation Error", description: error, variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            if (initialData?.id) {
                await PolicyService.updateHomeScreenLayoutPolicy(profileId, formData);
            } else {
                await PolicyService.createHomeScreenLayoutPolicy(profileId, formData);
            }
            toast({ title: "Success", description: "Home Screen Layout policy saved successfully." });
            onSave();
        } catch (error) {
            toast({ title: "Error", description: getErrorMessage(error, "Failed to save Home Screen Layout policy."), variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        setSaving(true);
        try {
            await PolicyService.deleteHomeScreenLayoutPolicy(profileId);
            toast({ title: "Success", description: "Home Screen Layout policy deleted." });
            onSave();
        } catch (error) {
            toast({ title: "Error", description: getErrorMessage(error, "Failed to delete policy."), variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // --- Dock helpers ---
    const addDockItem = () => {
        const dock = [...(formData.configuration.Dock || [])];
        dock.push({ Type: "Application", BundleID: "" });
        setFormData({ ...formData, configuration: { ...formData.configuration, Dock: dock } });
    };

    const updateDockItem = (index: number, field: keyof IconItem, value: string) => {
        const dock = [...(formData.configuration.Dock || [])];
        dock[index] = { ...dock[index], [field]: value };
        if (field === "Type") {
            if (value === "Application") {
                dock[index] = { Type: "Application", BundleID: dock[index].BundleID || "" };
            } else if (value === "WebClip") {
                dock[index] = { Type: "WebClip", URL: dock[index].URL || "", DisplayName: dock[index].DisplayName || "" };
            } else if (value === "Folder") {
                dock[index] = { Type: "Folder", DisplayName: dock[index].DisplayName || "", Pages: [[]] };
            }
        }
        setFormData({ ...formData, configuration: { ...formData.configuration, Dock: dock } });
    };

    const removeDockItem = (index: number) => {
        const dock = [...(formData.configuration.Dock || [])];
        dock.splice(index, 1);
        setFormData({ ...formData, configuration: { ...formData.configuration, Dock: dock } });
    };

    // --- Page helpers ---
    const addPage = () => {
        const pages = [...formData.configuration.Pages];
        pages.push([]);
        setFormData({ ...formData, configuration: { ...formData.configuration, Pages: pages } });
    };

    const removePage = (pageIndex: number) => {
        const pages = [...formData.configuration.Pages];
        if (pages.length <= 1) return;
        pages.splice(pageIndex, 1);
        setFormData({ ...formData, configuration: { ...formData.configuration, Pages: pages } });
    };

    const addPageItem = (pageIndex: number) => {
        const pages = [...formData.configuration.Pages];
        pages[pageIndex] = [...pages[pageIndex], { Type: "Application" as const, BundleID: "" }];
        setFormData({ ...formData, configuration: { ...formData.configuration, Pages: pages } });
    };

    const updatePageItem = (pageIndex: number, itemIndex: number, field: keyof IconItem, value: string) => {
        const pages = [...formData.configuration.Pages];
        const page = [...pages[pageIndex]];
        page[itemIndex] = { ...page[itemIndex], [field]: value };
        if (field === "Type") {
            if (value === "Application") {
                page[itemIndex] = { Type: "Application", BundleID: page[itemIndex].BundleID || "" };
            } else if (value === "WebClip") {
                page[itemIndex] = { Type: "WebClip", URL: page[itemIndex].URL || "", DisplayName: page[itemIndex].DisplayName || "" };
            } else if (value === "Folder") {
                page[itemIndex] = { Type: "Folder", DisplayName: page[itemIndex].DisplayName || "", Pages: [[]] };
            }
        }
        pages[pageIndex] = page;
        setFormData({ ...formData, configuration: { ...formData.configuration, Pages: pages } });
    };

    const removePageItem = (pageIndex: number, itemIndex: number) => {
        const pages = [...formData.configuration.Pages];
        const page = [...pages[pageIndex]];
        page.splice(itemIndex, 1);
        pages[pageIndex] = page;
        setFormData({ ...formData, configuration: { ...formData.configuration, Pages: pages } });
    };

    // --- Folder item helpers ---
    const addFolderItem = (section: 'dock' | 'page', pageIndex: number, itemIndex: number) => {
        if (section === 'dock') {
            const dock = [...(formData.configuration.Dock || [])];
            const item = { ...dock[itemIndex] };
            const folderPages = item.Pages ? [...item.Pages] : [[]];
            if (folderPages.length === 0) folderPages.push([]);
            folderPages[0] = [...folderPages[0], { Type: "Application" as const, BundleID: "" }];
            item.Pages = folderPages;
            dock[itemIndex] = item;
            setFormData({ ...formData, configuration: { ...formData.configuration, Dock: dock } });
        } else {
            const pages = [...formData.configuration.Pages];
            const page = [...pages[pageIndex]];
            const item = { ...page[itemIndex] };
            const folderPages = item.Pages ? [...item.Pages] : [[]];
            if (folderPages.length === 0) folderPages.push([]);
            folderPages[0] = [...folderPages[0], { Type: "Application" as const, BundleID: "" }];
            item.Pages = folderPages;
            page[itemIndex] = item;
            pages[pageIndex] = page;
            setFormData({ ...formData, configuration: { ...formData.configuration, Pages: pages } });
        }
    };

    const removeFolderItem = (section: 'dock' | 'page', pageIndex: number, itemIndex: number, folderItemIndex: number) => {
        if (section === 'dock') {
            const dock = [...(formData.configuration.Dock || [])];
            const item = { ...dock[itemIndex] };
            const folderPages = item.Pages ? [...item.Pages] : [[]];
            if (folderPages[0]) {
                folderPages[0] = folderPages[0].filter((_, i) => i !== folderItemIndex);
            }
            item.Pages = folderPages;
            dock[itemIndex] = item;
            setFormData({ ...formData, configuration: { ...formData.configuration, Dock: dock } });
        } else {
            const pages = [...formData.configuration.Pages];
            const page = [...pages[pageIndex]];
            const item = { ...page[itemIndex] };
            const folderPages = item.Pages ? [...item.Pages] : [[]];
            if (folderPages[0]) {
                folderPages[0] = folderPages[0].filter((_, i) => i !== folderItemIndex);
            }
            item.Pages = folderPages;
            page[itemIndex] = item;
            pages[pageIndex] = page;
            setFormData({ ...formData, configuration: { ...formData.configuration, Pages: pages } });
        }
    };

    const updateFolderItem = (section: 'dock' | 'page', pageIndex: number, itemIndex: number, folderItemIndex: number, field: keyof FolderIconItem, value: string) => {
        if (section === 'dock') {
            const dock = [...(formData.configuration.Dock || [])];
            const item = { ...dock[itemIndex] };
            const folderPages = item.Pages ? [...item.Pages] : [[]];
            if (folderPages[0]) {
                folderPages[0] = [...folderPages[0]];
                folderPages[0][folderItemIndex] = { ...folderPages[0][folderItemIndex], [field]: value };
            }
            item.Pages = folderPages;
            dock[itemIndex] = item;
            setFormData({ ...formData, configuration: { ...formData.configuration, Dock: dock } });
        } else {
            const pages = [...formData.configuration.Pages];
            const page = [...pages[pageIndex]];
            const item = { ...page[itemIndex] };
            const folderPages = item.Pages ? [...item.Pages] : [[]];
            if (folderPages[0]) {
                folderPages[0] = [...folderPages[0]];
                folderPages[0][folderItemIndex] = { ...folderPages[0][folderItemIndex], [field]: value };
            }
            item.Pages = folderPages;
            page[itemIndex] = item;
            pages[pageIndex] = page;
            setFormData({ ...formData, configuration: { ...formData.configuration, Pages: pages } });
        }
    };

    // === Icon for Type ===
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Application': return <AppWindow className="w-4 h-4 text-blue-500" />;
            case 'WebClip': return <Globe className="w-4 h-4 text-green-500" />;
            case 'Folder': return <FolderOpen className="w-4 h-4 text-amber-500" />;
            default: return <Smartphone className="w-4 h-4" />;
        }
    };

    // === Render icon item fields (Edit mode) ===
    const renderIconItemFields = (item: IconItem, onUpdate: (field: keyof IconItem, value: string) => void, onRemove: () => void, section: 'dock' | 'page', pageIndex: number, itemIndex: number) => (
        <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <Select value={item.Type} onValueChange={v => onUpdate("Type", v)}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Application">
                            <span className="flex items-center gap-1"><AppWindow className="w-3 h-3" /> Application</span>
                        </SelectItem>
                        <SelectItem value="Folder">
                            <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" /> Folder</span>
                        </SelectItem>
                        <SelectItem value="WebClip">
                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> WebClip</span>
                        </SelectItem>
                    </SelectContent>
                </Select>
                {item.Type === "Application" && (
                    <div className="flex-1">
                        <Input
                            value={item.BundleID || ""}
                            onChange={e => onUpdate("BundleID", e.target.value)}
                            placeholder="com.apple.mobilemail *"
                            className={!item.BundleID?.trim() ? 'border-red-300' : ''}
                        />
                    </div>
                )}
                {item.Type === "WebClip" && (
                    <>
                        <div className="flex-1">
                            <Input
                                value={item.DisplayName || ""}
                                onChange={e => onUpdate("DisplayName", e.target.value)}
                                placeholder="Display Name *"
                                className={!item.DisplayName?.trim() ? 'border-red-300' : ''}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                value={item.URL || ""}
                                onChange={e => onUpdate("URL", e.target.value)}
                                placeholder="https://example.com *"
                                className={!item.URL?.trim() ? 'border-red-300' : ''}
                            />
                        </div>
                    </>
                )}
                {item.Type === "Folder" && (
                    <div className="flex-1">
                        <Input
                            value={item.DisplayName || ""}
                            onChange={e => onUpdate("DisplayName", e.target.value)}
                            placeholder="Folder Name *"
                            className={!item.DisplayName?.trim() ? 'border-red-300' : ''}
                        />
                    </div>
                )}
                <Button variant="ghost" size="icon" onClick={onRemove}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
            {/* Conditional required field hints */}
            {item.Type === "Application" && !item.BundleID?.trim() && (
                <p className="text-[11px] text-destructive ml-6">BundleID is required for Application</p>
            )}
            {item.Type === "WebClip" && (!item.DisplayName?.trim() || !item.URL?.trim()) && (
                <p className="text-[11px] text-destructive ml-6">DisplayName and URL are required for WebClip</p>
            )}
            {item.Type === "Folder" && !item.DisplayName?.trim() && (
                <p className="text-[11px] text-destructive ml-6">DisplayName is required for Folder</p>
            )}
            {item.Type === "Folder" && (
                <div className="ml-6 space-y-2 border-l-2 border-amber-500/20 pl-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FolderOpen className="w-3 h-3 text-amber-500" /> Folder Contents <span className="text-[10px] text-muted-foreground">(Application &amp; WebClip only)</span>
                    </div>
                    {(item.Pages?.[0] || []).map((fi, fiIdx) => (
                        <div key={fiIdx} className="flex items-center gap-2">
                            <Select value={fi.Type} onValueChange={v => updateFolderItem(section, pageIndex, itemIndex, fiIdx, "Type", v)}>
                                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Application">App</SelectItem>
                                    <SelectItem value="WebClip">WebClip</SelectItem>
                                </SelectContent>
                            </Select>
                            {fi.Type === "Application" && (
                                <Input
                                    className={`flex-1 ${!fi.BundleID?.trim() ? 'border-red-300' : ''}`}
                                    value={fi.BundleID || ""}
                                    onChange={e => updateFolderItem(section, pageIndex, itemIndex, fiIdx, "BundleID", e.target.value)}
                                    placeholder="com.apple.mobilemail *"
                                />
                            )}
                            {fi.Type === "WebClip" && (
                                <>
                                    <Input
                                        className={`flex-1 ${!fi.DisplayName?.trim() ? 'border-red-300' : ''}`}
                                        value={fi.DisplayName || ""}
                                        onChange={e => updateFolderItem(section, pageIndex, itemIndex, fiIdx, "DisplayName", e.target.value)}
                                        placeholder="Name *"
                                    />
                                    <Input
                                        className={`flex-1 ${!fi.URL?.trim() ? 'border-red-300' : ''}`}
                                        value={fi.URL || ""}
                                        onChange={e => updateFolderItem(section, pageIndex, itemIndex, fiIdx, "URL", e.target.value)}
                                        placeholder="URL *"
                                    />
                                </>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => removeFolderItem(section, pageIndex, itemIndex, fiIdx)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addFolderItem(section, pageIndex, itemIndex)}>
                        <Plus className="w-3 h-3 mr-1" /> Add Item
                    </Button>
                </div>
            )}
        </div>
    );

    // === Render view-mode item ===
    const renderViewItem = (item: IconItem) => (
        <div className="flex items-center gap-2 bg-background border px-3 py-2 rounded-md text-sm">
            {getTypeIcon(item.Type)}
            <span className="font-medium text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">{item.Type}</span>
            <span className="truncate">
                {item.Type === 'Application' && (item.BundleID || 'No BundleID')}
                {item.Type === 'WebClip' && `${item.DisplayName || 'Unnamed'} — ${item.URL || 'No URL'}`}
                {item.Type === 'Folder' && (item.DisplayName || 'Unnamed Folder')}
            </span>
            {item.Type === 'Folder' && item.Pages?.[0] && (
                <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 rounded-full">{item.Pages[0].length} items</span>
            )}
        </div>
    );

    // === VIEW MODE ===
    if (!isEditing && initialData) {
        const config = initialData.configuration;
        const totalItems = (config.Dock?.length || 0) + (config.Pages || []).reduce((sum, p) => sum + p.length, 0);

        return (
            <div className="space-y-6 max-w-4xl mt-6">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/10 rounded-full">
                            <Layout className="w-6 h-6 text-teal-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Home Screen Layout</h3>
                            <p className="text-sm text-muted-foreground">
                                {config.Pages?.length || 0} page{(config.Pages?.length || 0) !== 1 ? 's' : ''}, {totalItems} total item{totalItems !== 1 ? 's' : ''}
                            </p>
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

                <div className="space-y-5">
                    {/* Dock */}
                    <div className="border rounded-lg p-4 bg-muted/10">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 border-b pb-2">
                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                            Dock
                            <span className="text-xs text-muted-foreground font-normal">({config.Dock?.length || 0} items, max 4 iPhone / 6 iPad)</span>
                        </h4>
                        {(!config.Dock || config.Dock.length === 0) ? (
                            <p className="text-sm text-muted-foreground italic">No dock items configured.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {config.Dock.map((item, idx) => (
                                    <div key={idx}>{renderViewItem(item)}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pages */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold flex items-center gap-1">
                            Pages <span className="text-red-500">*</span>
                            <span className="text-xs text-muted-foreground font-normal ml-1">({config.Pages?.length || 0} pages)</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {config.Pages?.map((page, pIdx) => (
                                <div key={pIdx} className="border rounded-lg p-4 bg-muted/5">
                                    <h5 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                        <Layout className="w-3 h-3" /> Page {pIdx + 1}
                                        <span className="bg-muted px-1.5 rounded-full text-[10px]">{page.length} items</span>
                                    </h5>
                                    {page.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">Empty page</p>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {page.map((item, iIdx) => (
                                                <div key={iIdx}>
                                                    {renderViewItem(item)}
                                                    {/* Show folder contents in view mode */}
                                                    {item.Type === 'Folder' && item.Pages?.[0] && item.Pages[0].length > 0 && (
                                                        <div className="ml-6 mt-1 mb-1 pl-3 border-l-2 border-amber-500/20 space-y-1">
                                                            {item.Pages[0].map((fi, fiIdx) => (
                                                                <div key={fiIdx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                    {getTypeIcon(fi.Type)}
                                                                    <span>{fi.DisplayName || fi.BundleID || 'Unnamed'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
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

    // === EDIT MODE ===
    return (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 bg-teal-500/10 rounded-full">
                    {initialData?.id ? <Edit className="w-5 h-5 text-teal-500" /> : <Layout className="w-5 h-5 text-teal-500" />}
                </div>
                <div>
                    <h3 className="text-lg font-medium">{initialData?.id ? 'Edit' : 'Create'} Home Screen Layout</h3>
                    <p className="text-sm text-muted-foreground">Configure the home screen layout for managed iOS devices</p>
                </div>
            </div>

            {/* Dock Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold flex items-center gap-1">
                            <Smartphone className="w-4 h-4 text-muted-foreground" /> Dock
                        </h3>
                        <p className="text-xs text-muted-foreground">Optional — max 4 items for iPhone, 6 for iPad</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={addDockItem}>
                        <Plus className="w-4 h-4 mr-1" /> Add Dock Item
                    </Button>
                </div>
                {(formData.configuration.Dock || []).map((item, idx) => (
                    <div key={idx}>
                        {renderIconItemFields(
                            item,
                            (field, value) => updateDockItem(idx, field, value),
                            () => removeDockItem(idx),
                            'dock', 0, idx
                        )}
                    </div>
                ))}
                {(!formData.configuration.Dock || formData.configuration.Dock.length === 0) && (
                    <p className="text-xs text-muted-foreground italic">No dock items configured. Dock will be empty.</p>
                )}
            </div>

            {/* Pages Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold flex items-center gap-1">
                            Pages <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">Required — at least one page. Each inner array represents one home screen page.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={addPage}>
                        <Plus className="w-4 h-4 mr-1" /> Add Page
                    </Button>
                </div>
                {formData.configuration.Pages.map((page, pageIdx) => (
                    <div key={pageIdx} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Layout className="w-4 h-4 text-muted-foreground" />
                                Page {pageIdx + 1}
                                <span className="text-xs bg-muted px-1.5 rounded-full text-muted-foreground">{page.length} items</span>
                            </h4>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => addPageItem(pageIdx)}>
                                    <Plus className="w-3 h-3 mr-1" /> Add Item
                                </Button>
                                {formData.configuration.Pages.length > 1 && (
                                    <Button variant="ghost" size="sm" onClick={() => removePage(pageIdx)}>
                                        <Trash2 className="w-3 h-3 text-destructive" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        {page.map((item, itemIdx) => (
                            <div key={itemIdx}>
                                {renderIconItemFields(
                                    item,
                                    (field, value) => updatePageItem(pageIdx, itemIdx, field, value),
                                    () => removePageItem(pageIdx, itemIdx),
                                    'page', pageIdx, itemIdx
                                )}
                            </div>
                        ))}
                        {page.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">Empty page. Add items above.</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-4 border-t">
                <div>
                    {initialData?.id && (
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={initialData?.id ? () => setIsEditing(false) : onCancel} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
