import React, { ReactNode, useRef } from 'react';
import { motion, useInView, UseInViewOptions, Variant, Transition } from 'framer-motion';

export interface InViewProps {
  children: ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: React.ElementType;
  className?: string;
}

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const defaultTransition: Transition = {
  duration: 0.35,
  ease: 'easeOut',
};

export function InView({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  viewOptions = { once: true, amount: 0.05 },
  as = 'div',
  className = '',
}: InViewProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  const MotionComponent = (motion[as as keyof typeof motion] || motion.div) as any;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
