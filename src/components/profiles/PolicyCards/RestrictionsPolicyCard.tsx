import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RestrictionsComposite } from '@/components/profiles/Policies/RestrictionsPolicy';
import { motion } from 'framer-motion';
import { Ban } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface RestrictionsPolicyCardProps extends BasePolicyCardProps {
    policy: RestrictionsComposite;
}

export function RestrictionsPolicyCard({ policy, onClick }: RestrictionsPolicyCardProps) {
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-destructive"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Ban className="w-5 h-5 text-destructive" /> Restrictions
                    </CardTitle>
                    <CardDescription>Feature control</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-destructive hover:bg-destructive/90">Active</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Camera</span>
                            <span
                                className={
                                    policy.security?.allowCamera
                                        ? 'text-success font-medium'
                                        : 'text-destructive font-medium'
                                }
                            >
                                {policy.security?.allowCamera ? 'Allowed' : 'Blocked'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Screen Capture</span>
                            <span
                                className={
                                    policy.security?.allowScreenCapture
                                        ? 'text-success font-medium'
                                        : 'text-destructive font-medium'
                                }
                            >
                                {policy.security?.allowScreenCapture ? 'Allowed' : 'Blocked'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Factory Reset</span>
                            <span
                                className={
                                    policy.misc?.allowFactoryReset
                                        ? 'text-success font-medium'
                                        : 'text-destructive font-medium'
                                }
                            >
                                {policy.misc?.allowFactoryReset ? 'Allowed' : 'Blocked'}
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
