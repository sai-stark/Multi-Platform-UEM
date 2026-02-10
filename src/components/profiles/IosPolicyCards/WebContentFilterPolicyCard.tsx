import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosWebContentFilterPolicy } from '@/types/ios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface WebContentFilterPolicyCardProps extends BasePolicyCardProps {
    policy: IosWebContentFilterPolicy;
}

export function WebContentFilterPolicyCard({ policy, onClick }: WebContentFilterPolicyCardProps) {
    const { t } = useLanguage();

    return (
        <motion.div variants={itemVariants}>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-orange-500" onClick={onClick}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="w-5 h-5 text-orange-500" /> Web Content Filter
                    </CardTitle>
                    <CardDescription>URL filtering and content restrictions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-orange-500 hover:bg-orange-500/90">{t('common.enabled')}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Auto Filter</span>
                            <span className="font-medium">{policy.autoFilterEnabled ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Permitted URLs</span>
                            <span className="font-medium">{policy.permittedUrls?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Blocked URLs</span>
                            <span className="font-medium">{policy.denyListUrls?.length || 0}</span>
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
