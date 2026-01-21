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
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Server className="w-6 h-6 text-success" />
                <h3 className="text-lg font-semibold">MDM Configuration</h3>
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
            <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={onClose}>
                    Back to Policies
                </Button>
            </div>
        </div>
    );
}
