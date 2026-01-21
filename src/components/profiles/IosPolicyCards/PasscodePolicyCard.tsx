import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosPasscodeRestrictionPolicy, PasscodeRestrictionPolicy } from '@/types/models';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface PasscodePolicyCardProps extends BasePolicyCardProps {
    policy: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
}

export function PasscodePolicyCard({ policy, onClick }: PasscodePolicyCardProps) {
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-primary"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" /> Passcode
                    </CardTitle>
                    <CardDescription>Device security</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge>Active</Badge>
                        <span className="text-xs text-muted-foreground">
                            Modified {new Date().toLocaleDateString()}
                        </span>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Complexity</span>
                            <span className="font-medium capitalize">
                                {'complexity' in policy ? policy.complexity || 'Simple' : 'Simple'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Min Length</span>
                            <span className="font-medium">{policy.minLength} chars</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Max Failed Attempts</span>
                            <span className="font-medium">
                                {'maximumFailedAttempts' in policy
                                    ? policy.maximumFailedAttempts || 'Unlimited'
                                    : 'Unlimited'}
                            </span>
                        </div>
                    </div>
                    <Button variant="secondary" className="w-full" onClick={onClick}>
                        View Policy
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
