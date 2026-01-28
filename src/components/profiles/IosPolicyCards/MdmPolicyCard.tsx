import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RestrictionsComposite } from '@/components/profiles/IosPolicies/RestrictionsPolicy';
import { IosMdmConfiguration } from '@/types/ios';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Server } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface MdmPolicyCardProps extends BasePolicyCardProps {
    policy: IosMdmConfiguration;
    restrictionsPolicy?: RestrictionsComposite;
}

export function MdmPolicyCard({ policy, restrictionsPolicy, onClick }: MdmPolicyCardProps) {
    const { t } = useLanguage();
    
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-success"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Server className="w-5 h-5 text-success" /> {t('policy.mdm')}
                    </CardTitle>
                    <CardDescription>{t('policy.mdm.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-destructive hover:bg-destructive/90">{t('common.enabled')}</Badge>
                    </div>
                    {restrictionsPolicy && (
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('policy.field.allowCamera')}</span>
                                <span
                                    className={
                                        restrictionsPolicy.security?.allowCamera
                                            ? 'text-success font-medium'
                                            : 'text-destructive font-medium'
                                    }
                                >
                                    {restrictionsPolicy.security?.allowCamera ? t('common.yes') : t('common.no')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('policy.field.allowScreenCapture')}</span>
                                <span
                                    className={
                                        restrictionsPolicy.security?.allowScreenCapture
                                            ? 'text-success font-medium'
                                            : 'text-destructive font-medium'
                                    }
                                >
                                    {restrictionsPolicy.security?.allowScreenCapture ? t('common.yes') : t('common.no')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Factory Reset</span>
                                <span
                                    className={
                                        restrictionsPolicy.misc?.allowFactoryReset
                                            ? 'text-success font-medium'
                                            : 'text-destructive font-medium'
                                    }
                                >
                                    {restrictionsPolicy.misc?.allowFactoryReset ? t('common.yes') : t('common.no')}
                                </span>
                            </div>
                        </div>
                    )}
                    <Button variant="secondary" className="w-full" onClick={onClick}>
                        {t('common.configure')}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
