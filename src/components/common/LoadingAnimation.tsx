
import { motion } from 'framer-motion';
import { Laptop, Shield, Smartphone, Tablet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingAnimationProps {
    className?: string;
    message?: string;
}

export const LoadingAnimation = ({ className, message = "Synchronizing policies..." }: LoadingAnimationProps) => {
    const [currentIcon, setCurrentIcon] = useState(0);
    const icons = [
        <Smartphone key="phone" className="w-6 h-6 text-primary" />,
        <Tablet key="tablet" className="w-6 h-6 text-primary" />,
        <Laptop key="laptop" className="w-6 h-6 text-primary" />
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIcon((prev) => (prev + 1) % icons.length);
        }, 1500);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`flex flex-col items-center justify-center p-8 min-h-[300px] ${className}`}>
            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Rotating Rings */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-primary/30 border-l-transparent rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                    className="absolute inset-2 border-2 border-t-transparent border-r-indigo-400 border-b-transparent border-l-indigo-400 rounded-full opacity-70"
                />

                {/* Central Pulse Shield */}
                <div className="relative z-10">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Shield className="w-10 h-10 text-primary fill-primary/10" />
                    </motion.div>
                </div>

                {/* Orbiting Device Icon */}
                <motion.div
                    className="absolute"
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 8,
                        ease: "linear"
                    }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <motion.div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background p-1.5 rounded-full shadow-sm border border-border"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={currentIcon} // Animation trigger
                    >
                        {icons[currentIcon]}
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex flex-col items-center gap-1"
            >
                <h3 className="text-lg font-semibold text-foreground">CDOT UEM</h3>
                <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
            </motion.div>
        </div>
    );
};
