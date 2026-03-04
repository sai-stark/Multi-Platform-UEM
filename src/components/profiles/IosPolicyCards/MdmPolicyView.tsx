import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IosMdmConfiguration } from '@/types/ios';
import { Server } from 'lucide-react';

interface MdmPolicyViewProps {
    policy: IosMdmConfiguration;
    onClose: () => void;
}

export function MdmPolicyView({ policy, onClose }: MdmPolicyViewProps) {
    return (
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-full">
                        <Server className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">MDM Configuration</h3>
                        <p className="text-sm text-muted-foreground">Mobile device management settings</p>
                    </div>
                </div>
                <Badge variant="secondary">View Only</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Server URL</p>
                    <p className="font-medium truncate">{policy.serverURL || '-'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Check-in URL</p>
                    <p className="font-medium truncate">{policy.checkInURL || '-'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Topic</p>
                    <p className="font-medium">{policy.topic || '-'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Sign Message</p>
                    <p className="font-medium">{policy.signMessage ? 'Yes' : 'No'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Access Rights</p>
                    <p className="font-medium">{policy.accessRights || '-'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Check Out When Removed</p>
                    <p className="font-medium">{policy.checkOutWhenRemoved ? 'Yes' : 'No'}</p>
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
}
