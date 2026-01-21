import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IosScepConfiguration } from '@/types/ios';
import { Key } from 'lucide-react';

interface ScepPolicyViewProps {
    policy: IosScepConfiguration;
    onClose: () => void;
}

export function ScepPolicyView({ policy, onClose }: ScepPolicyViewProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Key className="w-6 h-6 text-warning" />
                <h3 className="text-lg font-semibold">SCEP Configuration</h3>
                <Badge variant="secondary">View Only</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{(policy as any).scepName || '-'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">URL</p>
                    <p className="font-medium truncate">{(policy as any).url || '-'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Key Size</p>
                    <p className="font-medium">{(policy as any).keysize || '-'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Key Type</p>
                    <p className="font-medium">{(policy as any).keyType || '-'}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Key Usage</p>
                    <p className="font-medium">{(policy as any).keyUsage || '-'}</p>
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
