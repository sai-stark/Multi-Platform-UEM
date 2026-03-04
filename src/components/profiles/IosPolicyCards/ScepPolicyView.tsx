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
        <div className="space-y-6 max-w-4xl mt-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-full">
                        <Key className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">SCEP Configuration</h3>
                        <p className="text-sm text-muted-foreground">Certificate enrollment settings</p>
                    </div>
                </div>
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
            <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
}
