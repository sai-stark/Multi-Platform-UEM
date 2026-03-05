import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="max-w-md w-full p-8 bg-card border rounded-2xl shadow-xl flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-4 bg-destructive/10 text-destructive rounded-full ring-8 ring-destructive/5">
                    <AlertCircle className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong</h2>
                    <p className="text-sm text-muted-foreground">
                        An unexpected error occurred while rendering the application.
                    </p>
                </div>

                <div className="w-full max-h-32 overflow-y-auto bg-muted/50 p-3 rounded-lg text-left border">
                    <p className="font-mono text-xs text-destructive break-words">
                        {error.message || "Unknown error"}
                    </p>
                </div>

                <div className="pt-2 w-full">
                    <Button onClick={resetErrorBoundary} className="w-full gap-2 h-11" size="lg">
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </Button>
                </div>
            </div>
        </div>
    );
}
