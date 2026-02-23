import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IosHomeScreenLayoutPolicy, IconItem, FolderIconItem } from "@/types/ios";
import { PolicyService } from "@/api/services/IOSpolicies";
import { Plus, Trash2, GripVertical, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/utils/errorUtils";

interface HomeScreenLayoutPolicyProps {
    profileId: string;
    initialData?: IosHomeScreenLayoutPolicy;
    onSave: () => void;
    onCancel: () => void;
}

export function HomeScreenLayoutPolicy({ profileId, initialData, onSave, onCancel }: HomeScreenLayoutPolicyProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<IosHomeScreenLayoutPolicy>(
        initialData || {
            name: "ios",
            policyType: "HomeScreenlayout",
            configuration: {
                Dock: [],
                Pages: [[]],
            },
        } as IosHomeScreenLayoutPolicy
    );

    const handleSave = async () => {
        if (!formData.configuration.Pages || formData.configuration.Pages.length === 0) {
            toast({ title: "Validation Error", description: "At least one page is required.", variant: "destructive" });
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

    const renderIconItemFields = (item: IconItem, onUpdate: (field: keyof IconItem, value: string) => void, onRemove: () => void, section: 'dock' | 'page', pageIndex: number, itemIndex: number) => (
        <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <Select value={item.Type} onValueChange={v => onUpdate("Type", v)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Application">Application</SelectItem>
                        <SelectItem value="Folder">Folder</SelectItem>
                        <SelectItem value="WebClip">WebClip</SelectItem>
                    </SelectContent>
                </Select>
                {item.Type === "Application" && (
                    <Input className="flex-1" value={item.BundleID || ""} onChange={e => onUpdate("BundleID", e.target.value)} placeholder="com.apple.mobilemail" />
                )}
                {item.Type === "WebClip" && (
                    <>
                        <Input className="flex-1" value={item.DisplayName || ""} onChange={e => onUpdate("DisplayName", e.target.value)} placeholder="Display Name" />
                        <Input className="flex-1" value={item.URL || ""} onChange={e => onUpdate("URL", e.target.value)} placeholder="https://example.com" />
                    </>
                )}
                {item.Type === "Folder" && (
                    <Input className="flex-1" value={item.DisplayName || ""} onChange={e => onUpdate("DisplayName", e.target.value)} placeholder="Folder Name" />
                )}
                <Button variant="ghost" size="icon" onClick={onRemove}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
            {item.Type === "Folder" && (
                <div className="ml-6 space-y-2 border-l-2 border-primary/20 pl-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FolderOpen className="w-3 h-3" /> Folder Contents
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
                                <Input className="flex-1" value={fi.BundleID || ""} onChange={e => updateFolderItem(section, pageIndex, itemIndex, fiIdx, "BundleID", e.target.value)} placeholder="com.apple.mobilemail" />
                            )}
                            {fi.Type === "WebClip" && (
                                <>
                                    <Input className="flex-1" value={fi.DisplayName || ""} onChange={e => updateFolderItem(section, pageIndex, itemIndex, fiIdx, "DisplayName", e.target.value)} placeholder="Name" />
                                    <Input className="flex-1" value={fi.URL || ""} onChange={e => updateFolderItem(section, pageIndex, itemIndex, fiIdx, "URL", e.target.value)} placeholder="URL" />
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

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Configure the home screen layout for managed iOS devices. The layout is locked and users cannot modify it.
            </p>

            {/* Dock Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Dock (max 4 items for iPhone, 6 for iPad)</h3>
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
                    <h3 className="text-sm font-semibold">Pages <span className="text-red-500">*</span></h3>
                    <Button variant="outline" size="sm" onClick={addPage}>
                        <Plus className="w-4 h-4 mr-1" /> Add Page
                    </Button>
                </div>
                {formData.configuration.Pages.map((page, pageIdx) => (
                    <div key={pageIdx} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Page {pageIdx + 1}</h4>
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

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
                <div>
                    {initialData?.id && (
                        <Button variant="destructive" onClick={handleDelete} disabled={saving}>Delete</Button>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : initialData?.id ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
