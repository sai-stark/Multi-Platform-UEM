import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosScepConfiguration } from '@/types/ios';
import { motion } from 'framer-motion';
import { Key } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface ScepPolicyCardProps extends BasePolicyCardProps {
    policy: IosScepConfiguration;
}

export function ScepPolicyCard({ policy, onClick }: ScepPolicyCardProps) {
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-warning"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Key className="w-5 h-5 text-warning" /> SCEP
                    </CardTitle>
                    <CardDescription>Certificate enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">
                        {(policy as any).scepName || 'Configured'}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
