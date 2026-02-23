import { EnterpriseService } from '@/api/services/enterprise';
import { LoadingAnimation } from '@/components/common/LoadingAnimation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAssetUrl } from '@/config/env';
import { useEnterprise } from '@/contexts/EnterpriseContext';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/utils/errorUtils';
import { AndroidEnterprise, AndroidEnterpriseSignup } from '@/types/models';
import {
    AlertCircle,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    Copy,
    ExternalLink,
    Loader2,
    Mail,
    RefreshCw,
    Shield,
    SkipForward,
    Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

// Mock mode toggle - set via environment variable OR URL parameter ?mock=true
// Default to true until backend is ready
const getIsMockMode = () => {
    // Check URL parameter for explicit override
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mock') === 'false') return false;
        if (urlParams.get('mock') === 'true') return true;
    }
    // Check environment variables
    if (import.meta.env.VITE_MOCK_API === 'true') return true;
    if (import.meta.env.VITE_MOCK_API === 'false') return false;
    // Default to mock mode since backend is not ready
    return true;
};

const MOCK_MODE = getIsMockMode();

// Mock delay to simulate API calls
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type SetupStep = 1 | 2 | 3 | 4;

interface FormData {
    enterpriseDisplayName: string;
    contactEmail: string;
}

interface FormErrors {
    enterpriseDisplayName?: string;
    contactEmail?: string;
}

export default function EnterpriseSetup() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { skipEnrollment, markEnrolled } = useEnterprise();

    // State
    const [currentStep, setCurrentStep] = useState<SetupStep>(1);
    const [loading, setLoading] = useState(false);
    const [enterprise, setEnterprise] = useState<AndroidEnterprise | null>(null);
    const [signupData, setSignupData] = useState<AndroidEnterpriseSignup | null>(null);
    const [formData, setFormData] = useState<FormData>({
        enterpriseDisplayName: '',
        contactEmail: ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [copied, setCopied] = useState(false);
    const [finalizationStatus, setFinalizationStatus] = useState<'pending' | 'success' | 'error'>('pending');

    // Track if we've already processed the callback to prevent duplicate calls
    const [callbackProcessed, setCallbackProcessed] = useState(false);

    // Check for callback params on mount and when URL changes
    useEffect(() => {
        const enterpriseToken = searchParams.get('enterpriseToken');
        const signId = searchParams.get('signId');

        if (enterpriseToken && signId && !callbackProcessed) {
            // We're in the callback flow
            setCallbackProcessed(true);
            setCurrentStep(4);
            handleFinalization(enterpriseToken, signId);
        } else if (!enterpriseToken && !signId && currentStep === 1) {
            // Normal flow - check enterprise status (only on initial load)
            checkEnterpriseStatus();
        }
    }, [searchParams]);

    // Step 1: Check Enterprise Status
    const checkEnterpriseStatus = async () => {
        setLoading(true);
        try {
            if (MOCK_MODE) {
                await mockDelay(1500);
                // Mock: Enterprise not found, proceed to setup
                setEnterprise(null);
                setCurrentStep(2);
            } else {
                const result = await EnterpriseService.getEnterprise('android');
                // Validate that we have actual enterprise data, not just an empty response
                if (result && result.id && result.enterpriseDisplayName) {
                    setEnterprise(result);
                    // Enterprise exists, show success state
                    toast({
                        title: "Enterprise Already Configured",
                        description: `${result.enterpriseDisplayName} is already set up.`,
                    });
                } else {
                    // No valid enterprise data, proceed to Step 2
                    setCurrentStep(2);
                }
            }
        } catch (error: any) {
            // Any error (404, network, etc.) means no enterprise configured
            console.log('Enterprise not found or error occurred, proceeding to setup', error?.response?.status || error?.message);
            setCurrentStep(2);
        } finally {
            setLoading(false);
        }
    };

    // Form validation
    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.enterpriseDisplayName.trim()) {
            errors.enterpriseDisplayName = 'Display name is required';
        } else if (formData.enterpriseDisplayName.length < 3) {
            errors.enterpriseDisplayName = 'Display name must be at least 3 characters';
        }

        if (!formData.contactEmail.trim()) {
            errors.contactEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
            errors.contactEmail = 'Please enter a valid email address';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Step 2: Submit form and get signup URL
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            if (MOCK_MODE) {
                await mockDelay(1000);
                // Mock signup response
                const mockSignup: AndroidEnterpriseSignup = {
                    id: 'mock-signup-' + Date.now(),
                    enterpriseDisplayName: formData.enterpriseDisplayName,
                    contactEmail: formData.contactEmail,
                    signupURL: `https://play.google.com/work/adminsignup?token=mock-${Date.now()}&callbackUrl=${encodeURIComponent(window.location.origin + '/android/enterprise/callback')}`,
                    enterpriseSignupType: 'AndroidEnterpriseSignup'
                };
                setSignupData(mockSignup);
                setCurrentStep(3);
            } else {
                const result = await EnterpriseService.createEnterpriseSignup('android', {
                    enterpriseDisplayName: formData.enterpriseDisplayName,
                    contactEmail: formData.contactEmail
                });
                setSignupData(result);
                setCurrentStep(3);
            }

            toast({
                title: "Signup Initiated",
                description: "Please complete the Google signup process.",
            });
        } catch (error) {
            console.error('Failed to create signup', error);
            toast({
                title: "Error",
                description: getErrorMessage(error, "Failed to initiate enterprise signup. Please try again."),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 4: Handle finalization callback
    const handleFinalization = async (enterpriseToken: string, signId: string) => {
        setLoading(true);
        setFinalizationStatus('pending');
        try {
            if (MOCK_MODE) {
                await mockDelay(2000);
                // Mock: Always succeed and mark as enrolled
                markEnrolled();
                setFinalizationStatus('success');
                toast({
                    title: "Setup Complete!",
                    description: "Your Android Enterprise has been successfully configured.",
                });
            } else {
                await EnterpriseService.setEnterpriseToken('android', signId, enterpriseToken);
                // Mark as enrolled in context so EnrollmentGuard allows dashboard access
                markEnrolled();
                setFinalizationStatus('success');
                toast({
                    title: "Setup Complete!",
                    description: "Your Android Enterprise has been successfully configured.",
                });
            }
        } catch (error) {
            console.error('Finalization failed', error);
            setFinalizationStatus('error');
            toast({
                title: "Error",
                description: getErrorMessage(error, "Failed to complete enterprise binding. Please try again."),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Copy signup URL to clipboard
    const handleCopyUrl = async () => {
        if (!signupData?.signupURL) return;

        try {
            await navigator.clipboard.writeText(signupData.signupURL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: "Copied!",
                description: "Signup URL copied to clipboard.",
            });
        } catch (error) {
            console.error('Failed to copy', error);
        }
    };

    // Open signup URL in new tab
    const handleOpenSignup = () => {
        if (signupData?.signupURL) {
            window.open(signupData.signupURL, '_blank');
        }
    };

    // Simulate callback for mock mode
    const handleMockCallback = () => {
        if (signupData) {
            navigate(`/android/enterprise/callback?enterpriseToken=mock-token-${Date.now()}&signId=${signupData.id}`);
        }
    };

    // Go to dashboard (or back to originating page) after success
    const handleGoToDashboard = () => {
        const returnTo = searchParams.get('returnTo') || '/';
        navigate(returnTo);
    };

    // Retry setup
    const handleRetry = () => {
        setCurrentStep(1);
        setFinalizationStatus('pending');
        checkEnterpriseStatus();
    };

    // Skip enrollment for now
    const handleSkip = () => {
        // Use context function to update both localStorage AND React state
        skipEnrollment();
        toast({
            title: "Setup Skipped",
            description: "Android features will be limited until Enterprise is configured.",
        });
        // Navigate back to where the user came from
        const returnTo = searchParams.get('returnTo') || '/';
        navigate(returnTo);
    };

    // Step indicator component
    const StepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                    <div
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                            transition-all duration-300
                            ${currentStep === step
                                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                : currentStep > step
                                    ? 'bg-green-500 text-white'
                                    : 'bg-muted text-muted-foreground'
                            }
                        `}
                    >
                        {currentStep > step ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            step
                        )}
                    </div>
                    {step < 4 && (
                        <div
                            className={`w-16 h-1 mx-2 transition-colors duration-300 ${
                                currentStep > step ? 'bg-green-500' : 'bg-muted'
                            }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    // Render Step 1: Status Check
    const renderStep1 = () => (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Checking Enterprise Status</CardTitle>
                <CardDescription>
                    Verifying your organization's Android Enterprise configuration...
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
                <LoadingAnimation message="Checking status..." />
            </CardContent>
        </Card>
    );

    // Render Step 2: Information Form
    const renderStep2 = () => (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Enterprise Information</CardTitle>
                <CardDescription>
                    Enter your organization's details to begin the Android Enterprise setup.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Enterprise Display Name</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="displayName"
                                placeholder="My Organization"
                                value={formData.enterpriseDisplayName}
                                onChange={(e) => setFormData(prev => ({ ...prev, enterpriseDisplayName: e.target.value }))}
                                className={`pl-10 ${formErrors.enterpriseDisplayName ? 'border-destructive' : ''}`}
                            />
                        </div>
                        {formErrors.enterpriseDisplayName && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors.enterpriseDisplayName}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Contact Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@organization.com"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                                className={`pl-10 ${formErrors.contactEmail ? 'border-destructive' : ''}`}
                            />
                        </div>
                        {formErrors.contactEmail && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {formErrors.contactEmail}
                            </p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                    
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-foreground"
                        onClick={handleSkip}
                        disabled={loading}
                    >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip for now
                    </Button>
                </form>

                {MOCK_MODE && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Mock Mode: API calls are simulated
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // Render Step 3: Google Signup
    const renderStep3 = () => (
        <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <img
                        src={getAssetUrl('/Assets/android.png')}
                        alt="Android"
                        className="w-10 h-10"
                    />
                </div>
                <CardTitle>Complete Google Signup</CardTitle>
                <CardDescription>
                    Complete the Managed Google Play signup to link your organization.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Signup URL Display */}
                <div className="space-y-2">
                    <Label>Signup URL</Label>
                    <div className="flex gap-2">
                        <Input
                            value={signupData?.signupURL || ''}
                            readOnly
                            className="font-mono text-xs"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyUrl}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-sm">Instructions:</h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">1</span>
                            Click "Open Google Signup" to start the process
                        </li>
                        <li className="flex gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">2</span>
                            Sign in with your Google Workspace admin account
                        </li>
                        <li className="flex gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">3</span>
                            Accept the terms and complete the binding
                        </li>
                        <li className="flex gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">4</span>
                            You'll be redirected back here automatically
                        </li>
                    </ol>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button onClick={handleOpenSignup} className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Google Signup
                    </Button>

                    {MOCK_MODE && (
                        <Button
                            variant="outline"
                            onClick={handleMockCallback}
                            className="w-full"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Simulate Callback (Mock)
                        </Button>
                    )}
                </div>

                {/* Enterprise Info Summary */}
                {signupData && (
                    <div className="border-t pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Enterprise:</span>
                            <span className="font-medium">{signupData.enterpriseDisplayName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Contact:</span>
                            <span className="font-medium">{signupData.contactEmail}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // Render Step 4: Finalization
    const renderStep4 = () => (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className={`
                    mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4
                    ${finalizationStatus === 'success'
                        ? 'bg-green-500/10'
                        : finalizationStatus === 'error'
                            ? 'bg-destructive/10'
                            : 'bg-primary/10'
                    }
                `}>
                    {finalizationStatus === 'success' ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : finalizationStatus === 'error' ? (
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    ) : (
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    )}
                </div>
                <CardTitle>
                    {finalizationStatus === 'success'
                        ? 'Setup Complete!'
                        : finalizationStatus === 'error'
                            ? 'Setup Failed'
                            : 'Finalizing Setup...'
                    }
                </CardTitle>
                <CardDescription>
                    {finalizationStatus === 'success'
                        ? 'Your Android Enterprise has been successfully configured.'
                        : finalizationStatus === 'error'
                            ? 'There was a problem completing the enterprise binding.'
                            : 'Completing the enterprise binding with Google...'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {finalizationStatus === 'pending' && (
                    <LoadingAnimation message="Binding enterprise..." />
                )}

                {finalizationStatus === 'success' && (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            You can now manage Android devices.
                        </p>
                        <Button onClick={handleGoToDashboard} className="w-full">
                            Go to Dashboard
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {finalizationStatus === 'error' && (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please try the setup process again.
                        </p>
                        <Button onClick={handleRetry} variant="outline" className="w-full">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // Render enterprise already exists state
    const renderEnterpriseExists = () => (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle>Enterprise Already Configured</CardTitle>
                <CardDescription>
                    Your Android Enterprise is already set up and active.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {enterprise && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">{enterprise.enterpriseDisplayName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium">{enterprise.enterpriseType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Contact:</span>
                            <span className="font-medium">{enterprise.contactEmail}</span>
                        </div>
                    </div>
                )}
                <Button onClick={handleGoToDashboard} className="w-full">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <MainLayout>
            <div className="space-y-6 max-w-4xl mx-auto py-8">
                {/* Page Header */}
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Android Enterprise Setup
                    </h1>
                    <p className="text-muted-foreground">
                        Configure Android Enterprise to manage Android devices in your organization
                    </p>
                </header>

                {/* Step Indicator */}
                {!enterprise && <StepIndicator />}

                {/* Main Content */}
                <div className="min-h-[400px]">
                    {enterprise ? renderEnterpriseExists() : (
                        <>
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                            {currentStep === 4 && renderStep4()}
                        </>
                    )}
                </div>

                {/* Debug Info (only in mock mode) */}
                {MOCK_MODE && (
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Mock Mode Enabled • Current Step: {currentStep}
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
