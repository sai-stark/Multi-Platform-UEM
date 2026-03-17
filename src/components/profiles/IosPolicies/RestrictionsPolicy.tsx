
import { PolicyService } from '@/api/services/IOSpolicies';
import { PolicyCategory, PolicyMasterDetail } from '@/components/profiles/PolicyMasterDetail';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { IosRestrictionsPayload } from '@/types/restrictions';
import { cleanPayload } from '@/utils/cleanPayload';
import { getErrorMessage } from '@/utils/errorUtils';
import { Edit, Loader2, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

// Category definitions with human-readable labels and descriptions
const RESTRICTION_CATEGORIES: {
    key: string;
    title: string;
    icon: string;
    color: string;
    fields: { key: string; label: string; description: string; defaultValue?: boolean }[];
}[] = [
        {
            key: 'security', title: 'Security & Authentication', icon: '🔒', color: 'border-red-500/30',
            fields: [
                { key: 'allowCamera', label: 'Allow Camera', description: 'Enable device camera usage' },
                { key: 'allowScreenShot', label: 'Allow Screenshots', description: 'Enable screenshots and screen recording' },
                { key: 'allowFingerprintForUnlock', label: 'Allow Biometric Unlock', description: 'Touch ID / Face ID / Optic ID for unlocking' },
                { key: 'allowFingerprintModification', label: 'Allow Biometric Modification', description: 'Allow modifying Touch ID / Face ID' },
                { key: 'allowPasscodeModification', label: 'Allow Passcode Changes', description: 'Allow adding, changing, or removing passcode' },
                { key: 'allowPasswordAutoFill', label: 'Allow Password AutoFill', description: 'Enable password AutoFill feature' },
                { key: 'allowPasswordProximityRequests', label: 'Allow Password Proximity Requests', description: 'Allow requesting passwords from nearby devices' },
                { key: 'allowPasswordSharing', label: 'Allow Password Sharing', description: 'Enable sharing passwords via AirDrop' },
                { key: 'allowUntrustedTLSPrompt', label: 'Allow Untrusted TLS', description: 'Show prompts for untrusted HTTPS certificates' },
                { key: 'allowUSBRestrictedMode', label: 'Allow USB Restricted Mode', description: 'Control USB accessories while device is locked' },
                { key: 'forceEncryptedBackup', label: 'Force Encrypted Backup', description: 'Encrypt all device backups', defaultValue: false },
                { key: 'forceAuthenticationBeforeAutoFill', label: 'Force Auth Before AutoFill', description: 'Require authentication before AutoFill', defaultValue: false },
            ],
        },
        {
            key: 'apps', title: 'Apps & App Store', icon: '📱', color: 'border-blue-500/30',
            fields: [
                { key: 'allowAppInstallation', label: 'Allow App Installation', description: 'Allow installing apps from App Store' },
                { key: 'allowAppRemoval', label: 'Allow App Removal', description: 'Allow removing apps from device' },
                { key: 'allowUIAppInstallation', label: 'Allow App Store UI', description: 'Show App Store UI for installation' },
                { key: 'allowAppClips', label: 'Allow App Clips', description: 'Allow adding App Clips' },
                { key: 'allowAutomaticAppDownloads', label: 'Allow Auto App Downloads', description: 'Auto-download apps purchased on other devices' },
                { key: 'allowInAppPurchases', label: 'Allow In-App Purchases', description: 'Allow purchasing within apps' },
                { key: 'allowSystemAppRemoval', label: 'Allow System App Removal', description: 'Allow removing built-in system apps' },
                { key: 'allowMarketplaceAppInstallation', label: 'Allow Marketplace Apps', description: 'Allow alternative marketplace app installation' },
                { key: 'allowWebDistributionAppInstallation', label: 'Allow Web App Install', description: 'Allow app installation from web' },
                { key: 'allowEnterpriseAppTrust', label: 'Allow Enterprise App Trust', description: 'Show Trust Enterprise Developer button' },
                { key: 'allowAppsToBeHidden', label: 'Allow Hiding Apps', description: 'Allow users to hide apps' },
                { key: 'allowAppsToBeLocked', label: 'Allow Locking Apps', description: 'Allow users to lock apps' },
            ],
        },
        {
            key: 'icloud', title: 'iCloud & Sync', icon: '☁️', color: 'border-cyan-500/30',
            fields: [
                { key: 'allowCloudBackup', label: 'Allow iCloud Backup', description: 'Enable iCloud device backups' },
                { key: 'allowCloudDocumentSync', label: 'Allow iCloud Documents', description: 'Sync documents and key-values to iCloud' },
                { key: 'allowCloudKeychainSync', label: 'Allow iCloud Keychain', description: 'Enable iCloud Keychain synchronization' },
                { key: 'allowCloudPhotoLibrary', label: 'Allow iCloud Photos', description: 'Enable iCloud Photo Library' },
                { key: 'allowCloudPrivateRelay', label: 'Allow iCloud Private Relay', description: 'Enable iCloud Private Relay' },
                { key: 'allowCloudAddressBook', label: 'Allow iCloud Contacts', description: 'Sync contacts to iCloud' },
                { key: 'allowCloudCalendar', label: 'Allow iCloud Calendar', description: 'Sync calendars to iCloud' },
                { key: 'allowCloudMail', label: 'Allow iCloud Mail', description: 'Enable iCloud Mail' },
                { key: 'allowCloudNotes', label: 'Allow iCloud Notes', description: 'Enable iCloud Notes sync' },
                { key: 'allowCloudReminders', label: 'Allow iCloud Reminders', description: 'Enable iCloud Reminders sync' },
                { key: 'allowCloudBookmarks', label: 'Allow iCloud Bookmarks', description: 'Sync bookmarks to iCloud' },
                { key: 'allowManagedAppsCloudSync', label: 'Allow Managed Apps Cloud', description: 'Let managed apps use iCloud sync' },
            ],
        },
        {
            key: 'safari', title: 'Safari & Web', icon: '🌐', color: 'border-indigo-500/30',
            fields: [
                { key: 'allowSafari', label: 'Allow Safari', description: 'Enable Safari web browser' },
                { key: 'allowSafariHistoryClearing', label: 'Allow Safari History Clear', description: 'Allow clearing browsing history' },
                { key: 'allowSafariPrivateBrowsing', label: 'Allow Private Browsing', description: 'Enable private browsing in Safari' },
                { key: 'allowSafariSummary', label: 'Allow Safari Summary', description: 'Enable content summarization in Safari' },
                { key: 'safariAllowAutoFill', label: 'Allow Safari AutoFill', description: 'Enable Safari form AutoFill' },
                { key: 'safariAllowJavaScript', label: 'Allow JavaScript', description: 'Allow JavaScript execution in Safari' },
                { key: 'safariAllowPopups', label: 'Allow Popups', description: 'Allow pop-up windows in Safari' },
                { key: 'safariForceFraudWarning', label: 'Force Fraud Warning', description: 'Enable Safari fraud warnings', defaultValue: false },
            ],
        },
        {
            key: 'siri', title: 'Siri & Apple Intelligence', icon: '🤖', color: 'border-purple-500/30',
            fields: [
                { key: 'allowAssistant', label: 'Allow Siri', description: 'Enable Siri voice assistant' },
                { key: 'allowAssistantUserGeneratedContent', label: 'Allow Siri Web Content', description: 'Let Siri query user-generated web content' },
                { key: 'allowAssistantWhileLocked', label: 'Allow Siri When Locked', description: 'Enable Siri on lock screen' },
                { key: 'allowAppleIntelligenceReport', label: 'Allow AI Reports', description: 'Allow Apple Intelligence reports' },
                { key: 'allowExternalIntelligenceIntegrations', label: 'Allow External AI', description: 'Allow external cloud-based AI with Siri' },
                { key: 'allowGenmoji', label: 'Allow Genmoji', description: 'Allow creating custom Genmoji' },
                { key: 'allowImagePlayground', label: 'Allow Image Playground', description: 'Allow AI image generation' },
                { key: 'allowImageWand', label: 'Allow Image Wand', description: 'Allow Image Wand usage' },
                { key: 'allowWritingTools', label: 'Allow Writing Tools', description: 'Enable Apple Intelligence writing tools' },
                { key: 'allowDictation', label: 'Allow Dictation', description: 'Allow dictation input' },
                { key: 'forceAssistantProfanityFilter', label: 'Force Profanity Filter', description: 'Force profanity filter for Siri', defaultValue: false },
                { key: 'forceOnDeviceOnlyDictation', label: 'Force On-Device Dictation', description: 'Disable Siri server connections for dictation', defaultValue: false },
            ],
        },
        {
            key: 'communication', title: 'AirDrop, AirPrint & Communication', icon: '📡', color: 'border-teal-500/30',
            fields: [
                { key: 'allowAirDrop', label: 'Allow AirDrop', description: 'Enable AirDrop sharing' },
                { key: 'allowAirPrint', label: 'Allow AirPrint', description: 'Enable AirPrint' },
                { key: 'allowAirPlayIncomingRequests', label: 'Allow AirPlay Incoming', description: 'Allow incoming AirPlay requests' },
                { key: 'allowChat', label: 'Allow iMessage', description: 'Enable iMessage' },
                { key: 'allowRCSMessaging', label: 'Allow RCS Messaging', description: 'Enable RCS messaging' },
                { key: 'allowVideoConferencing', label: 'Allow FaceTime', description: 'Enable FaceTime video calls' },
                { key: 'forceAirDropUnmanaged', label: 'Force AirDrop Unmanaged', description: 'Treat AirDrop as unmanaged drop target', defaultValue: false },
            ],
        },
        {
            key: 'connectivity', title: 'Connectivity & Network', icon: '📶', color: 'border-green-500/30',
            fields: [
                { key: 'allowBluetoothModification', label: 'Allow Bluetooth Changes', description: 'Allow modifying Bluetooth settings' },
                { key: 'allowNFC', label: 'Allow NFC', description: 'Enable NFC' },
                { key: 'allowPersonalHotspotModification', label: 'Allow Hotspot Changes', description: 'Allow personal hotspot modifications' },
                { key: 'allowCellularPlanModification', label: 'Allow Cellular Changes', description: 'Allow changing cellular plan settings' },
                { key: 'allowESIMModification', label: 'Allow eSIM Changes', description: 'Allow eSIM modifications' },
                { key: 'allowVPNCreation', label: 'Allow VPN Creation', description: 'Allow creating VPN configurations' },
                { key: 'forceWiFiPowerOn', label: 'Force Wi-Fi On', description: 'Prevent turning off Wi-Fi', defaultValue: false },
                { key: 'forceWiFiToAllowedNetworksOnly', label: 'Force Allowed Networks Only', description: 'Limit to profile-configured Wi-Fi networks', defaultValue: false },
            ],
        },
        {
            key: 'ratings', title: 'Content Ratings', icon: '🎬', color: 'border-orange-500/30',
            fields: [
                { key: 'allowExplicitContent', label: 'Allow Explicit Content', description: 'Show explicit music/video content' },
                { key: 'allowBookstore', label: 'Allow Book Store', description: 'Show Book Store tab in Books app' },
                { key: 'allowBookstoreErotica', label: 'Allow Erotica Books', description: 'Allow erotica-tagged Apple Books content' },
            ],
        },
        {
            key: 'device', title: 'Device Features & Customization', icon: '⚙️', color: 'border-amber-500/30',
            fields: [
                { key: 'allowAccountModification', label: 'Allow Account Changes', description: 'Allow adding/modifying accounts' },
                { key: 'allowDeviceNameModification', label: 'Allow Device Name Change', description: 'Allow changing device name' },
                { key: 'allowEraseContentAndSettings', label: 'Allow Erase All', description: 'Allow Erase All Content and Settings' },
                { key: 'allowWallpaperModification', label: 'Allow Wallpaper Change', description: 'Allow changing wallpaper' },
                { key: 'allowNotificationsModification', label: 'Allow Notification Changes', description: 'Allow notification settings modification' },
                { key: 'allowLockScreenControlCenter', label: 'Allow Lock Screen Control Center', description: 'Show Control Center on lock screen' },
                { key: 'allowLockScreenNotificationsView', label: 'Allow Lock Screen Notifications', description: 'Show notification history on lock screen' },
                { key: 'allowPairedWatch', label: 'Allow Apple Watch', description: 'Allow pairing with Apple Watch' },
                { key: 'allowHostPairing', label: 'Allow Host Pairing', description: 'Allow host pairing except supervision host' },
                { key: 'allowAutoCorrection', label: 'Allow Auto-Correction', description: 'Enable keyboard auto-correction' },
                { key: 'allowPredictiveKeyboard', label: 'Allow Predictive Keyboard', description: 'Enable predictive keyboard' },
                { key: 'allowSpellCheck', label: 'Allow Spell Check', description: 'Enable keyboard spell checker' },
                { key: 'allowSpotlightInternetResults', label: 'Allow Spotlight Internet', description: 'Enable Spotlight internet search results' },
                { key: 'allowFindMyDevice', label: 'Allow Find My Device', description: 'Enable Find My Device' },
                { key: 'allowFindMyFriends', label: 'Allow Find My Friends', description: 'Enable Find My Friends' },
                { key: 'forceAutomaticDateAndTime', label: 'Force Auto Date/Time', description: 'Enforce automatic date/time', defaultValue: false },
                { key: 'allowDiagnosticSubmission', label: 'Allow Diagnostics', description: 'Allow diagnostic report submission' },
                { key: 'allowCallRecording', label: 'Allow Call Recording', description: 'Enable call recording' },
            ],
        },
        {
            key: 'media', title: 'Media & Entertainment', icon: '🎵', color: 'border-pink-500/30',
            fields: [
                { key: 'allowiTunes', label: 'Allow iTunes Store', description: 'Enable iTunes Music Store' },
                { key: 'allowMusicService', label: 'Allow Music Service', description: 'Enable Music service' },
                { key: 'allowRadioService', label: 'Allow Apple Music Radio', description: 'Enable Apple Music Radio' },
                { key: 'allowNews', label: 'Allow News', description: 'Enable Apple News' },
                { key: 'allowPodcasts', label: 'Allow Podcasts', description: 'Enable Podcasts' },
            ],
        },
        {
            key: 'gaming', title: 'Gaming', icon: '🎮', color: 'border-violet-500/30',
            fields: [
                { key: 'allowGameCenter', label: 'Allow Game Center', description: 'Enable Game Center' },
                { key: 'allowAddingGameCenterFriends', label: 'Allow Game Center Friends', description: 'Allow adding Game Center friends' },
                { key: 'allowMultiplayerGaming', label: 'Allow Multiplayer', description: 'Allow multiplayer gaming' },
            ],
        },
        {
            key: 'datasharing', title: 'Data Sharing & Managed Apps', icon: '🔄', color: 'border-lime-500/30',
            fields: [
                { key: 'allowOpenFromManagedToUnmanaged', label: 'Managed → Unmanaged', description: 'Allow opening docs from managed to unmanaged apps' },
                { key: 'allowOpenFromUnmanagedToManaged', label: 'Unmanaged → Managed', description: 'Allow opening docs from unmanaged to managed apps' },
                { key: 'allowManagedToWriteUnmanagedContacts', label: 'Managed Write Unmanaged Contacts', description: 'Allow managed apps to write unmanaged contacts', defaultValue: false },
                { key: 'allowUnmanagedToReadManagedContacts', label: 'Unmanaged Read Managed Contacts', description: 'Allow unmanaged apps to read managed contacts', defaultValue: false },
                { key: 'requireManagedPasteboard', label: 'Require Managed Pasteboard', description: 'Limit copy-paste by open-from restrictions', defaultValue: false },
            ],
        },
    ];

interface RestrictionsPolicyProps {
    profileId: string;
    initialData?: IosRestrictionsPayload;
    onSave: (data: IosRestrictionsPayload) => void;
    onCancel: () => void;
}

export function RestrictionsPolicy({ profileId, initialData, onSave, onCancel }: RestrictionsPolicyProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>(RESTRICTION_CATEGORIES[0].key);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [formData, setFormData] = useState<IosRestrictionsPayload>(
        initialData || {
            name: 'ios',
            policyType: 'IosDeviceRestrictions',
            restrictions: {},
        }
    );

    const restrictions = formData.restrictions || {};

    const updateRestriction = (field: string, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            restrictions: { ...(prev.restrictions || {}), [field]: value },
        }));
    };

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return RESTRICTION_CATEGORIES;
        const q = searchQuery.toLowerCase();
        return RESTRICTION_CATEGORIES
            .map(cat => ({
                ...cat,
                fields: cat.fields.filter(
                    f => f.label.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
                ),
            }))
            .filter(cat => cat.fields.length > 0);
    }, [searchQuery]);

    useEffect(() => {
        if (filteredCategories.length > 0 && !filteredCategories.find(c => c.key === selectedCategoryKey)) {
            setSelectedCategoryKey(filteredCategories[0].key);
        }
    }, [filteredCategories, selectedCategoryKey]);

    const handleSave = async () => {
        setSaving(true);
        const payload = cleanPayload({ ...formData, policyType: 'IosDeviceRestrictions' }) as IosRestrictionsPayload;
        try {
            if (initialData?.id) {
                await PolicyService.updateRestrictionsPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Restrictions policy updated' });
            } else {
                await PolicyService.createRestrictionsPolicy(profileId, payload);
                toast({ title: 'Success', description: 'Restrictions policy created' });
            }
            onSave(payload);
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to save restrictions'), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await PolicyService.deleteRestrictionsPolicy(profileId);
            toast({ title: 'Success', description: 'Restrictions policy deleted' });
            setShowDeleteDialog(false);
            onSave(formData);
        } catch (error) {
            toast({ title: 'Error', description: getErrorMessage(error, 'Failed to delete restrictions'), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    // Count modified (non-default) restrictions
    const modifiedCount = useMemo(() => {
        let count = 0;
        for (const cat of RESTRICTION_CATEGORIES) {
            for (const f of cat.fields) {
                const val = restrictions[f.key];
                const defaultVal = f.defaultValue ?? true;
                if (val !== undefined && val !== defaultVal) count++;
            }
        }
        return count;
    }, [restrictions]);

    // Helper: does a category have any non-default fields?
    const categoryHasModified = (cat: typeof RESTRICTION_CATEGORIES[0]) =>
        cat.fields.some(f => {
            const val = restrictions[f.key];
            return val !== undefined && val !== (f.defaultValue ?? true);
        });

    // Build categories for the shared layout
    const categories = filteredCategories.map(cat => ({
        key: cat.key,
        title: cat.title,
        subtitle: `${cat.fields.length} settings`,
        icon: cat.icon as React.ReactNode,
        hasModifications: categoryHasModified(cat),
        dotColor: 'amber' as const,
    }));

    // Content renderer — shared between view and edit, only disabled state differs
    const renderFieldsContent = (category: PolicyCategory) => {
        const rawCat = RESTRICTION_CATEGORIES.find(c => c.key === category.key);
        if (!rawCat) return null;

        return (
            <div className="grid gap-3">
                {rawCat.fields.map(field => {
                    const currentValue = restrictions[field.key];
                    const defaultVal = field.defaultValue ?? true;
                    const isModified = currentValue !== undefined && currentValue !== defaultVal;
                    return (
                        <div
                            key={field.key}
                            className={cn(
                                "flex items-center justify-between p-4 border rounded-xl transition-all duration-200 bg-card/50",
                                isModified
                                    ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
                                    : "hover:bg-card hover:border-border/80 hover:shadow-sm"
                            )}
                        >
                            <Label htmlFor={field.key} className={cn("flex flex-col gap-1 pr-4 cursor-pointer")}>
                                <span className="text-sm font-semibold">{field.label}</span>
                                <span className="font-normal text-xs text-muted-foreground leading-snug">{field.description}</span>
                            </Label>
                            <Switch
                                id={field.key}
                                checked={currentValue !== undefined ? !!currentValue : defaultVal}
                                onCheckedChange={(v) => updateRestriction(field.key, v)}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <PolicyMasterDetail
            headerIcon={<Edit className="w-5 h-5 text-destructive" />}
            headerColorClass="destructive"
            title={`${initialData?.id ? 'Edit' : 'Create'} Device Restrictions`}
            subtitle={`Configure allowed features and limitations (${modifiedCount} modified)`}
            categories={categories}
            selectedCategoryKey={selectedCategoryKey}
            onSelectCategory={setSelectedCategoryKey}
            searchPlaceholder="Search restrictions..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            renderContent={renderFieldsContent}
            footerActions={
                <>
                    {initialData?.id && (
                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={saving} className="mr-auto gap-2">
                                <Trash2 className="w-4 h-4" /> Delete
                            </Button>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this policy? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button variant="outline" onClick={onCancel} className="transition-all duration-200">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[140px] transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg">
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </>
            }
        />
    );
}
