import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosPerDomainVpnPolicy } from '@/types/ios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface PerDomainVpnPolicyCardProps extends BasePolicyCardProps {
    policy: IosPerDomainVpnPolicy;
}

export function PerDomainVpnPolicyCard({ policy, onClick }: PerDomainVpnPolicyCardProps) {
    const { t } = useLanguage();

    return (
        <motion.div variants={itemVariants}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-teal-500" onClick={onClick}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-teal-500" /> Per-Domain VPN
                    </CardTitle>
                    <CardDescription>Domain-based VPN routing</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-teal-500 hover:bg-teal-500/90">{t('common.enabled')}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Safari Domains</span>
                            <span className="font-medium">{policy.safariDomains?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Associated Domains</span>
                            <span className="font-medium">{policy.associatedDomains?.length || 0}</span>
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
