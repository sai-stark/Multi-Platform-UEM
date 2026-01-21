import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LockScreenMessagePolicy } from '@/types/models';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface LockScreenMessagePolicyCardProps extends BasePolicyCardProps {
    policy: LockScreenMessagePolicy;
}

export function LockScreenMessagePolicyCard({ policy, onClick }: LockScreenMessagePolicyCardProps) {
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-teal-500"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-teal-500" /> Lock Screen
                    </CardTitle>
                    <CardDescription>Lock screen messages</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge>Active</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        {policy.assetTagInformation && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Asset Tag</span>
                                <span className="font-medium truncate max-w-[150px]">
                                    {policy.assetTagInformation}
                                </span>
                            </div>
                        )}
                        {policy.lockScreenFootnote && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Footnote</span>
                                <span className="font-medium truncate max-w-[150px]">
                                    {policy.lockScreenFootnote}
                                </span>
                            </div>
                        )}
                        {!policy.assetTagInformation && !policy.lockScreenFootnote && (
                            <div className="text-sm text-muted-foreground italic">
                                No message configured
                            </div>
                        )}
                    </div>
                    <Button variant="secondary" className="w-full" onClick={onClick}>
                        View Policy
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
