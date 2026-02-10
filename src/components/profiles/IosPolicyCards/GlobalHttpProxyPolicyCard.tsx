import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosGlobalHttpProxyPolicy } from '@/types/ios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface GlobalHttpProxyPolicyCardProps extends BasePolicyCardProps {
    policy: IosGlobalHttpProxyPolicy;
}

export function GlobalHttpProxyPolicyCard({ policy, onClick }: GlobalHttpProxyPolicyCardProps) {
    const { t } = useLanguage();

    return (
        <motion.div variants={itemVariants}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-blue-500" onClick={onClick}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" /> Global HTTP Proxy
                    </CardTitle>
                    <CardDescription>Network proxy configuration</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-blue-500 hover:bg-blue-500/90">{t('common.enabled')}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-medium">{policy.proxyType}</span>
                        </div>
                        {policy.proxyType === 'Manual' && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Server</span>
                                <span className="font-medium">{policy.proxyServer || '-'}</span>
                            </div>
                        )}
                        {policy.proxyType === 'Automatic' && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">PAC URL</span>
                                <span className="font-medium truncate max-w-[150px]">{policy.proxyPacUrl || '-'}</span>
                            </div>
                        )}
                    </div>
                    <Button variant="secondary" className="w-full" onClick={onClick}>
                        {t('common.configure')}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
