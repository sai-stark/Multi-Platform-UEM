import { motion } from 'framer-motion';

// Shared animation variants for policy cards
export const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
};

export type MotionDivProps = React.ComponentProps<typeof motion.div>;

export interface BasePolicyCardProps {
    onClick: () => void;
}
