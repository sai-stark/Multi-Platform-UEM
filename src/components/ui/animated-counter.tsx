import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export interface AnimatedCounterProps {
    value: number | string;
    className?: string;
    duration?: number;
}

export function AnimatedCounter({
    value,
    className,
    duration = 1.5,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);

    // Parse numeric value, stripping commas and whitespace
    const rawString = String(value).replace(/,/g, "").trim();
    const numericValue = parseFloat(rawString);
    const isNumber = !isNaN(numericValue) && isFinite(numericValue);

    const motionValue = useMotionValue(0);
    const rounded = useTransform(motionValue, (latest) => {
        // Preserve integer vs float formatting
        const isInteger = Number.isInteger(numericValue);
        return isInteger
            ? Math.round(latest).toLocaleString("en-US")
            : latest.toLocaleString("en-US", { maximumFractionDigits: 1 });
    });

    useEffect(() => {
        if (!isNumber) return;
        const controls = animate(motionValue, numericValue, {
            duration,
            ease: [0.16, 1, 0.3, 1], // expo-out easing
        });
        return controls.stop;
    }, [numericValue, duration, motionValue, isNumber]);

    if (!isNumber) {
        return <span className={className}>{value}</span>;
    }

    return (
        <motion.span ref={ref} className={className}>
            {rounded}
        </motion.span>
    );
}
