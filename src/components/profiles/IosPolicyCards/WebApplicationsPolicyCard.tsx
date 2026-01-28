import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WebApplicationPolicy } from '@/types/models';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface WebApplicationsPolicyCardProps extends BasePolicyCardProps {
    policies: WebApplicationPolicy[];
}

export function WebApplicationsPolicyCard({ policies, onClick }: WebApplicationsPolicyCardProps) {
    const { t } = useLanguage();
    
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-blue-500"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" /> {t('policy.webApplications')}
                    </CardTitle>
                    <CardDescription>{t('policy.webApplications.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge>{t('common.enabled')}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('nav.webApplications')}</span>
                            <span className="font-medium">{policies.length}</span>
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
