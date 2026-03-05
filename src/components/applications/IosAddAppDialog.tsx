import { useState, useRef } from 'react';
import {
  Loader2,
  Apple,
  Plus,
  Search,
  Link2,
  Star,
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

interface IosAddAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppRegistered: () => void;
}

export const IosAddAppDialog = ({ open, onOpenChange, onAppRegistered }: IosAddAppDialogProps) => {
  const { toast } = useToast();

  // iOS-specific state
  const [iosAppUrl, setIosAppUrl] = useState('');
  const [iosRegistering, setIosRegistering] = useState(false);
  const [itunesSearchTerm, setItunesSearchTerm] = useState('');
  const [itunesSearchResults, setItunesSearchResults] = useState<ITunesSearchResult[]>([]);
  const [itunesSearching, setItunesSearching] = useState(false);
  const [iosAddMode, setIosAddMode] = useState<'url' | 'search'>('search');
  const [iosConfirmDialog, setIosConfirmDialog] = useState<{ open: boolean; name: string; identifier: string }>({ open: false, name: '', identifier: '' });

  // iOS: iTunes search with debounce
  const itunesSearchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleItunesSearch = (term: string) => {
    setItunesSearchTerm(term);
    if (itunesSearchTimerRef.current) {
      clearTimeout(itunesSearchTimerRef.current);
    }
    if (term.trim().length < 2) {
      setItunesSearchResults([]);
      return;
    }
    itunesSearchTimerRef.current = setTimeout(async () => {
      setItunesSearching(true);
      try {
        const results = await ITunesSearchService.searchApps(term.trim());
        setItunesSearchResults(results);
      } catch (error) {
        console.error('iTunes search error:', error);
      } finally {
        setItunesSearching(false);
      }
    }, 400);
  };

  // iOS: Show confirmation before registering via App Store URL
  const handleRegisterIosApp = () => {
    if (!iosAppUrl.trim()) {
      toast({ title: 'Error', description: 'Please enter an App Store URL', variant: 'destructive' });
      return;
    }
    onOpenChange(false);
    setTimeout(() => setIosConfirmDialog({ open: true, name: iosAppUrl.trim(), identifier: iosAppUrl.trim() }), 200);
  };

  // iOS: Show confirmation before registering from iTunes search result
  const handleRegisterFromSearch = (result: ITunesSearchResult) => {
    const url = `https://apps.apple.com/app/id${result.trackId}`;
    onOpenChange(false);
    setTimeout(() => setIosConfirmDialog({ open: true, name: result.trackName, identifier: url }), 200);
  };

  // iOS: Cancel registration — reopen the add dialog
  const cancelRegisterIosApp = () => {
    setIosConfirmDialog({ open: false, name: '', identifier: '' });
    setTimeout(() => onOpenChange(true), 200);
  };

  // iOS: Confirm and register the app
  const confirmRegisterIosApp = async () => {
    const { name, identifier } = iosConfirmDialog;
    setIosConfirmDialog({ open: false, name: '', identifier: '' });
    setIosRegistering(true);
    try {
      await ApplicationService.registerApplication('ios', { identifier });
      toast({ title: 'Success', description: `${name} registered successfully` });
      setIosAppUrl('');
      setItunesSearchTerm('');
      setItunesSearchResults([]);
      onAppRegistered();
    } catch (error) {
      console.error('Failed to register iOS app:', error);
      toast({ title: 'Error', description: getErrorMessage(error, `Failed to register ${name}`), variant: 'destructive' });
    } finally {
      setIosRegistering(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setIosAppUrl('');
    setItunesSearchTerm('');
    setItunesSearchResults([]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="overflow-y-auto flex flex-col w-[70vw] max-w-[70vw] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Add iOS Application</DialogTitle>
            <DialogDescription>
              Add iOS applications via App Store or enterprise IPA files.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2 border-b pb-3">
              <Button
                variant={iosAddMode === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIosAddMode('search')}
              >
                <Search className="w-4 h-4 mr-2" />
                Search iTunes
              </Button>
              <Button
                variant={iosAddMode === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIosAddMode('url')}
              >
                <Link2 className="w-4 h-4 mr-2" />
                App Store URL
              </Button>
            </div>

            {iosAddMode === 'url' ? (
              /* URL Input Mode */
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>App Store URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://apps.apple.com/us/app/example/id123456789"
                      value={iosAppUrl}
                      onChange={(e) => setIosAppUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleRegisterIosApp}
                      disabled={!iosAppUrl.trim() || iosRegistering}
                    >
                      {iosRegistering ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Register'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste the full App Store URL for the iOS application you want to register.
                  </p>
                </div>
              </div>
            ) : (
              /* iTunes Search Mode */
              <div className="flex-1 flex flex-col space-y-3">
                <div className="space-y-2">
                  <Label>Search iTunes Store</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for iOS apps..."
                      value={itunesSearchTerm}
                      onChange={(e) => handleItunesSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {itunesSearching && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                  </div>
                )}

                {!itunesSearching && itunesSearchResults.length > 0 && (
                  <div className="border rounded-lg">
                    {itunesSearchResults.map((result) => (
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
                            {result.sellerName} · {result.primaryGenreName}
                            {result.formattedPrice && ` · ${result.formattedPrice}`}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono truncate">{result.bundleId}</p>
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
                          onClick={() => handleRegisterFromSearch(result)}
                          disabled={iosRegistering}
                          className="flex-shrink-0"
                        >
                          {iosRegistering ? (
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

                {!itunesSearching && itunesSearchTerm.length >= 2 && itunesSearchResults.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No apps found for "{itunesSearchTerm}"</p>
                  </div>
                )}

                {!itunesSearching && itunesSearchTerm.length < 2 && (
                  <div className="text-center py-6">
                    <Apple className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
                  </div>
                )}
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

      {/* iOS Registration Confirmation Dialog */}
      <AlertDialog open={iosConfirmDialog.open} onOpenChange={(open) => { if (!open) setIosConfirmDialog({ open: false, name: '', identifier: '' }); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Register iOS Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to register "{iosConfirmDialog.name}"? This will add the application to your managed apps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRegisterIosApp}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRegisterIosApp}>
              Register
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
