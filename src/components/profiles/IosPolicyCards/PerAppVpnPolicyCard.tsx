import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosPerAppVpnPolicy } from '@/types/ios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface PerAppVpnPolicyCardProps extends BasePolicyCardProps {
    policy: IosPerAppVpnPolicy;
}

export function PerAppVpnPolicyCard({ policy, onClick }: PerAppVpnPolicyCardProps) {
    const { t } = useLanguage();

    return (
        <motion.div variants={itemVariants}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-violet-500" onClick={onClick}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-violet-500" /> Per-App VPN
                    </CardTitle>
                    <CardDescription>App-specific VPN routing</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-violet-500 hover:bg-violet-500/90">{t('common.enabled')}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Applications</span>
                            <span className="font-medium">{policy.applicationIds?.length || 0} app(s)</span>
                        </div>
                    </div>
                    <Button variant="secondary" className="w-full" onClick={onClick}>
                        {t('common.configure')}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
