import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IosPasscodeRestrictionPolicy, PasscodeRestrictionPolicy } from '@/types/models';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { BasePolicyCardProps, itemVariants } from './types';

interface PasscodePolicyCardProps extends BasePolicyCardProps {
    policy: PasscodeRestrictionPolicy | IosPasscodeRestrictionPolicy;
}

export function PasscodePolicyCard({ policy, onClick }: PasscodePolicyCardProps) {
    const { t } = useLanguage();
    
    return (
        <motion.div variants={itemVariants}>
            <Card
                className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-primary"
                onClick={onClick}
            >
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" /> {t('policy.passcode')}
                    </CardTitle>
                    <CardDescription>{t('policy.passcode.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <Badge>{t('common.enabled')}</Badge>
                        <span className="text-xs text-muted-foreground">
                            {t('profileDetails.lastModified')} {new Date().toLocaleDateString()}
                        </span>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('policy.field.complexPasscode')}</span>
                            <span className="font-medium capitalize">
                                {'complexity' in policy ? policy.complexity || 'Simple' : 'Simple'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('policy.field.minLength')}</span>
                            <span className="font-medium">{policy.minLength} chars</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t('policy.field.maxFailedAttempts')}</span>
                            <span className="font-medium">
                                {'maximumFailedAttempts' in policy
                                    ? policy.maximumFailedAttempts || 'Unlimited'
                                    : 'Unlimited'}
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
