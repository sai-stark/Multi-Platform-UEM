import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Grid } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

export function ApplicationsPolicyCard({ onClick }: BasePolicyCardProps) {
    const { t } = useLanguage();
    
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-orange-500"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Grid className="w-5 h-5 text-orange-500" /> {t('policy.applications')}
                    </CardTitle>
                    <CardDescription>{t('policy.applications.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                        {t('common.configure')}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
