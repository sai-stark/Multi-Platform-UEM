import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RestrictionsComposite } from '@/components/profiles/IosPolicies/RestrictionsPolicy';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Ban } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface RestrictionsPolicyCardProps extends BasePolicyCardProps {
    policy: RestrictionsComposite;
}

export function RestrictionsPolicyCard({ policy, onClick }: RestrictionsPolicyCardProps) {
    const { t } = useLanguage();
    
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-destructive"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Ban className="w-5 h-5 text-destructive" /> {t('policy.restrictions')}
                    </CardTitle>
                    <CardDescription>{t('policy.restrictions.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-destructive hover:bg-destructive/90">{t('common.enabled')}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('policy.field.allowCamera')}</span>
                            <span
                                className={
                                    policy.security?.allowCamera
                                        ? 'text-success font-medium'
                                        : 'text-destructive font-medium'
                                }
                            >
                                {policy.security?.allowCamera ? t('common.yes') : t('common.no')}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('policy.field.allowScreenCapture')}</span>
                            <span
                                className={
                                    policy.security?.allowScreenCapture
                                        ? 'text-success font-medium'
                                        : 'text-destructive font-medium'
                                }
                            >
                                {policy.security?.allowScreenCapture ? t('common.yes') : t('common.no')}
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
                                {policy.misc?.allowFactoryReset ? t('common.yes') : t('common.no')}
                            </span>
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
