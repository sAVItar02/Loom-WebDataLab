import type { Variants } from 'framer-motion';

export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

export const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};

export const horizontalItemVariants: Variants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
            ease: 'easeInOut',
        },
    },
};

export const pageTransitionVariants: Variants = {
    initial: { opacity: 0, y: 8 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.18,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -6,
        transition: {
            duration: 0.14,
            ease: 'easeIn',
        },
    },
};
