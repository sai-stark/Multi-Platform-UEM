import { useState, useRef } from 'react';
import {
  Loader2,
  Apple,
  Plus,
  Search,
  Link2,
  Upload,
  Globe,
  Star,
  X,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ApplicationService } from '@/api/services/applications';
import { ITunesSearchService, ITunesSearchResult } from '@/api/services/itunesSearch';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';

type MacosAddMode = 'search' | 'store-url' | 'upload' | 'app-url';
type MacosArchitecture = 'intel_x86' | 'arm64' | 'Universal';

const MACOS_ACCEPTED_EXTENSIONS = '.pkg,.dmg,.mpkg,.app,.zip';

interface MacosAddAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppRegistered: () => void;
}

export const MacosAddAppDialog = ({ open, onOpenChange, onAppRegistered }: MacosAddAppDialogProps) => {
  const { toast } = useToast();

  const [addMode, setAddMode] = useState<MacosAddMode>('upload');
  const [registering, setRegistering] = useState(false);

  // Search mode state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ITunesSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // App Store URL mode state
  const [storeUrl, setStoreUrl] = useState('');

  // Upload mode state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [architecture, setArchitecture] = useState<MacosArchitecture>('arm64');

  // App URL mode state
  const [appUrl, setAppUrl] = useState('');

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    name: string;
    identifier: string;
    mode: MacosAddMode;
    architecture: MacosArchitecture;
  }>({ open: false, name: '', identifier: '', mode: 'search', architecture: 'arm64' });

  // ── Search ──────────────────────────────────────────────────────────
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (term.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await ITunesSearchService.searchMacApps(term.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Mac App Store search error:', error);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleAddFromSearch = (result: ITunesSearchResult) => {
    const url = `https://apps.apple.com/app/id${result.trackId}`;
    onOpenChange(false);
    setTimeout(
      () => setConfirmDialog({ open: true, name: result.trackName, identifier: url, mode: 'search', architecture }),
      200
    );
  };

  // ── App Store URL ───────────────────────────────────────────────────
  const handleRegisterStoreUrl = () => {
    if (!storeUrl.trim()) {
      toast({ title: 'Error', description: 'Please enter a Mac App Store URL', variant: 'destructive' });
      return;
    }
    onOpenChange(false);
    setTimeout(
      () => setConfirmDialog({ open: true, name: storeUrl.trim(), identifier: storeUrl.trim(), mode: 'store-url', architecture }),
      200
    );
  };

  // ── File Upload ─────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploadFile(file);
  };

  const handleUpload = () => {
    if (!uploadFile) {
      toast({ title: 'Error', description: 'Please select a file to upload', variant: 'destructive' });
      return;
    }
    onOpenChange(false);
    setTimeout(
      () => setConfirmDialog({ open: true, name: uploadFile.name, identifier: uploadFile.name, mode: 'upload', architecture }),
      200
    );
  };

  // ── App URL ─────────────────────────────────────────────────────────
  const handleRegisterAppUrl = () => {
    if (!appUrl.trim()) {
      toast({ title: 'Error', description: 'Please enter an App URL', variant: 'destructive' });
      return;
    }
    onOpenChange(false);
    setTimeout(
      () => setConfirmDialog({ open: true, name: appUrl.trim(), identifier: appUrl.trim(), mode: 'app-url', architecture }),
      200
    );
  };

  // ── Cancel / Confirm ────────────────────────────────────────────────
  const cancelConfirm = () => {
    setConfirmDialog({ open: false, name: '', identifier: '', mode: 'search', architecture: 'arm64' });
    setTimeout(() => onOpenChange(true), 200);
  };

  const confirmRegister = async () => {
    const { name, identifier, mode, architecture: arch } = confirmDialog;
    setConfirmDialog({ open: false, name: '', identifier: '', mode: 'search', architecture: 'arm64' });
    setRegistering(true);
    try {
      if (mode === 'upload' && uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('architecture', arch);
        await ApplicationService.uploadPackageApplication('macos', formData);
      } else if (mode === 'app-url') {
        const formData = new FormData();
        formData.append('url', identifier);
        formData.append('architecture', arch);
        await ApplicationService.uploadPackageApplication('macos', formData);
      } else {
        await ApplicationService.registerApplication('macos', { identifier });
      }
      toast({ title: 'Success', description: `${name} registered successfully` });
      resetState();
      onAppRegistered();
    } catch (error) {
      console.error('Failed to register macOS app:', error);
      toast({
        title: 'Error',
        description: getErrorMessage(error, `Failed to register ${name}`),
        variant: 'destructive',
      });
    } finally {
      setRegistering(false);
    }
  };

  const resetState = () => {
    setSearchTerm('');
    setSearchResults([]);
    setStoreUrl('');
    setUploadFile(null);
    setAppUrl('');
    setArchitecture('arm64');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  // ── Mode tabs ───────────────────────────────────────────────────────
  const modes: { key: MacosAddMode; label: string; icon: React.ElementType }[] = [
    { key: 'upload', label: 'Upload File', icon: Upload },
    { key: 'app-url', label: 'App URL', icon: Globe },
    { key: 'search', label: 'Search App Store', icon: Search },
    { key: 'store-url', label: 'App Store URL', icon: Link2 },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="overflow-y-auto flex flex-col w-[70vw] max-w-[70vw] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Add macOS Application</DialogTitle>
            <DialogDescription>
              Add macOS applications via the Mac App Store, a direct URL, or by uploading an installer file.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4">
            {/* Mode Tabs */}
            <div className="flex flex-wrap gap-2 border-b pb-3">
              {modes.map(({ key, label, icon: Icon }) => {
                const isDisabled = key === 'search' || key === 'store-url';
                return (
                  <div key={key} className="relative">
                    <Button
                      variant={addMode === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAddMode(key)}
                      disabled={isDisabled}
                      className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                      {isDisabled && (
                        <span className="ml-1.5 text-[10px] uppercase tracking-wider opacity-70">
                          (Coming Soon)
                        </span>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* ── Search Mode ── */}
            {addMode === 'search' && (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="space-y-2">
                  <Label>Search Mac App Store</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for macOS apps..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {searching && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Searching Mac App Store...</span>
                  </div>
                )}

                {!searching && searchResults.length > 0 && (
                  <div className="border rounded-lg overflow-auto max-h-[50vh]">
                    {searchResults.map((result) => (
                      <div
                        key={result.trackId}
                        className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        {result.artworkUrl60 ? (
                          <img
                            src={result.artworkUrl60}
                            alt=""
                            className="w-10 h-10 rounded-lg flex-shrink-0"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Apple className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{result.trackName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.sellerName}
                            {result.primaryGenreName && ` · ${result.primaryGenreName}`}
                            {result.formattedPrice && ` · ${result.formattedPrice}`}
                          </p>
                          {result.bundleId && (
                            <p className="text-xs text-muted-foreground font-mono truncate">{result.bundleId}</p>
                          )}
                        </div>
                        {result.averageUserRating != null && (
                          <div className="flex items-center gap-1 flex-shrink-0 mr-2">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            <span className="text-xs font-medium">{result.averageUserRating.toFixed(1)}</span>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddFromSearch(result)}
                          disabled={registering}
                          className="flex-shrink-0"
                        >
                          {registering ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3 mr-1" />
                          )}
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {!searching && searchTerm.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No apps found for "{searchTerm}"</p>
                  </div>
                )}

                {!searching && searchTerm.length < 2 && (
                  <div className="text-center py-6">
                    <Apple className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
                  </div>
                )}
              </div>
            )}

            {/* ── App Store URL Mode ── */}
            {addMode === 'store-url' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Mac App Store URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://apps.apple.com/app/id123456789"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleRegisterStoreUrl}
                      disabled={!storeUrl.trim() || registering}
                    >
                      {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste the full Mac App Store URL for the application you want to register.
                  </p>
                </div>
              </div>
            )}

            {/* ── Upload File Mode ── */}
            {addMode === 'upload' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Upload macOS Installer</Label>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    {uploadFile ? (
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="truncate max-w-xs">{uploadFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground text-center">
                          Click to browse or drag & drop a macOS installer file
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supported formats: .pkg, .dmg, .mpkg, .app, .zip
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={MACOS_ACCEPTED_EXTENSIONS}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Architecture Selector */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    Architecture
                    <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Select value={architecture} onValueChange={(v) => setArchitecture(v as MacosArchitecture)}>
                    <SelectTrigger id="upload-architecture">
                      <SelectValue placeholder="Select architecture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arm64">Apple Silicon (ARM64)</SelectItem>
                      <SelectItem value="intel_x86">Intel (x86)</SelectItem>
                      <SelectItem value="Universal">Universal</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the target CPU architecture for this package.
                  </p>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || registering}
                  className="w-full"
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Register
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* ── App URL Mode ── */}
            {addMode === 'app-url' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>App Download URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/app-installer.dmg"
                      value={appUrl}
                      onChange={(e) => setAppUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleRegisterAppUrl}
                      disabled={!appUrl.trim() || registering}
                    >
                      {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a direct URL to a macOS installer file (.pkg, .dmg, etc.). The file will be downloaded and deployed to managed devices.
                  </p>
                </div>

                {/* Architecture Selector */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    Architecture
                    <span className="text-destructive" aria-hidden="true">*</span>
                  </Label>
                  <Select value={architecture} onValueChange={(v) => setArchitecture(v as MacosArchitecture)}>
                    <SelectTrigger id="appurl-architecture">
                      <SelectValue placeholder="Select architecture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arm64">Apple Silicon (ARM64)</SelectItem>
                      <SelectItem value="intel_x86">Intel (x86)</SelectItem>
                      <SelectItem value="Universal">Universal</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the target CPU architecture for this package.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog({ open: false, name: '', identifier: '', mode: 'search', architecture: 'arm64' });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Register macOS Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to register "{confirmDialog.name}"? This will add the application to your managed apps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelConfirm}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRegister}>Register</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
