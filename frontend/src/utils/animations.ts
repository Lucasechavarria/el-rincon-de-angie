export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { opacity: 0, transition: { duration: 0.4 } }
};

export const slideUp = {
    hidden: { y: 40, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
};

export const reveal = {
    hidden: { y: 100, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

export const floatAnimation = {
    animate: {
        y: [0, -20, 0],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export const premiumHover = {
    initial: { scale: 1, y: 0 },
    hover: { 
        scale: 1.02, 
        y: -10,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
};

export const pageTransition = {
    initial: { opacity: 0, filter: "blur(10px)", scale: 0.98 },
    animate: { 
        opacity: 1, 
        filter: "blur(0px)", 
        scale: 1,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { 
        opacity: 0, 
        filter: "blur(10px)",
        scale: 1.02,
        transition: { duration: 0.4 }
    }
};
