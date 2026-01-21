import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosMailPolicy } from '@/types/models';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface MailPolicyCardProps extends BasePolicyCardProps {
    policy: IosMailPolicy;
}

export function MailPolicyCard({ policy, onClick }: MailPolicyCardProps) {
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-purple-500"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-500" /> Mail
                    </CardTitle>
                    <CardDescription>Email configuration</CardDescription>
                </CardHeader>
                <CardContent>
                    <Badge>Active</Badge>
                    <p className="text-sm mt-2 text-muted-foreground">{policy.name}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
