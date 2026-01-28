import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosWiFiConfiguration } from '@/types/ios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface WifiPolicyCardProps extends BasePolicyCardProps {
    policy: IosWiFiConfiguration;
}

export function WifiPolicyCard({ policy, onClick }: WifiPolicyCardProps) {
    const { t } = useLanguage();
    
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-info"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-info" /> {t('policy.wifi')}
                    </CardTitle>
                    <CardDescription>{t('policy.wifi.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-info hover:bg-info/90">{t('common.enabled')}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('policy.field.ssid')}</span>
                            <span className="font-medium">{policy.ssid}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('policy.field.encryptionType')}</span>
                            <span className="font-medium">{policy.encryptionType || 'None'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('policy.field.autoJoin')}</span>
                            <span className="font-medium">{policy.autoJoin ? t('common.yes') : t('common.no')}</span>
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
