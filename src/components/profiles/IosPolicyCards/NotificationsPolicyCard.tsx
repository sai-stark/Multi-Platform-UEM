import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationPolicy } from '@/types/models';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface NotificationsPolicyCardProps extends BasePolicyCardProps {
    policies: NotificationPolicy[];
}

export function NotificationsPolicyCard({ policies, onClick }: NotificationsPolicyCardProps) {
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-purple-500"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-500" /> Notifications
                    </CardTitle>
                    <CardDescription>App notification settings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge>Active</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Configured Apps</span>
                            <span className="font-medium">{policies.length} Apps</span>
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
