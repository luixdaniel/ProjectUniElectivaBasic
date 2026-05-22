"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1], // ease-out-cubic
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
