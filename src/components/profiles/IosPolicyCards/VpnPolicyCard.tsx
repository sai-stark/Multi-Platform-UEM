import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosVpnPolicy } from '@/types/ios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface VpnPolicyCardProps extends BasePolicyCardProps {
    policy: IosVpnPolicy;
}

export function VpnPolicyCard({ policy, onClick }: VpnPolicyCardProps) {
    const { t } = useLanguage();

    return (
        <motion.div variants={itemVariants}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-emerald-500" onClick={onClick}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="w-5 h-5 text-emerald-500" /> VPN
                    </CardTitle>
                    <CardDescription>Virtual private network</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-emerald-500 hover:bg-emerald-500/90">{t('common.enabled')}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">VPN Type</span>
                            <span className="font-medium">{policy.vpnType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remote Address</span>
                            <span className="font-medium truncate max-w-[150px]">{policy.remoteAddress || '-'}</span>
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
