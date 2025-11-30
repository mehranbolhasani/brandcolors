'use client'

import { Twitter, X  } from 'lucide-react'
import { motion } from "motion/react"


/**
 * Hero Section Component
 * 
 * This is a placeholder component for the hero section.
 * You can customize the content and design as needed.
 */
export function HeroSection() {
  return (
    <section className="relative -top-17 overflow-hidden h-[calc(100%-80px)] flex items-center justify-center rounded-3xl bg-amber-500/25 backdrop-blur-2xl backdrop-brightness-105 backdrop-saturate-200 z-10">
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4">
          {/* Placeholder content - customize as needed */}
          <h1 className="text-5xl md:text-6xl font-normal tracking-tighter">
            <motion.span
              className="inline-flex"
              style={{}}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.1, ease: "easeInOut", delay: 0.2 }}
            >
              Brand
            </motion.span>
            <motion.span
              className="inline-flex items-center justify-center text-amber-500 aspect-square w-12 h-12 align-middle -mx-2"
              style={{}}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.1, ease: "easeInOut", delay: 0.4 }}
            >
              <X className="flex w-12 h-12" style={{ transformOrigin: "50% 50%" }} />
            </motion.span>
            <motion.span
              className="inline-flex"
              style={{}}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.1, ease: "easeInOut", delay: 0.25 }}
            >
              Colors
            </motion.span>
            <motion.span
              className="inline-flex mx-2"
              style={{}}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.1, ease: "easeInOut", delay: 0.3 }}
            >
              ·
            </motion.span>
            <motion.span
              className="inline-flex text-foreground/30"
              style={{}}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.1, ease: "easeInOut", delay: 0.35 }}
            >
              Directory
            </motion.span>
          </h1>
          <motion.p 
          initial={{ transform: "translateY(30px)", opacity: 0, filter: "blur(10px)" }}
          animate={{ transform: "translateY(0px)", opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.1, ease: "easeInOut", delay: 0.3 }}
          className="text-2xl text-foreground/70 max-w-2xl mx-auto tracking-tight font-normal">
            A growing collection of official brand colors
          </motion.p>
          <motion.p 
          initial={{ transform: "translateY(30px)", opacity: 0, filter: "blur(10px)" }}
          animate={{ transform: "translateY(0px)", opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.1, ease: "easeInOut", delay: 0.4 }}
          className="text-lg text-foreground/70 max-w-2xl mx-auto mt-6">
            <a href="https://brandxcolors.com" className="text-primary">
              <Twitter className="h-5 w-5 inline-block mr-1" />
              @mhrnb
            </a>
          </motion.p>
        </div>
      </div>
    </section>

    
  )
}

