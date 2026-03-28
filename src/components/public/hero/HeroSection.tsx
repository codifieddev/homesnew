"use client";

import { useState, useEffect } from "react";
import { BadgeCheck } from "lucide-react";
import { EnquiryForm } from "@/components/public/forms/EnquiryForm";
import { AmbientOrbs } from "@/components/shared/motion/AmbientOrbs";
import {
  MotionReveal,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/shared/motion/MotionReveal";
import {
  useSiteTemplate,
  useTranslations,
} from "@/components/shared/LocaleProvider";
import { cn } from "@/lib/utils";

const SLIDES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09be15e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
];

export function HeroSection() {
  const t = useTranslations("home");
  const siteTemplate = useSiteTemplate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <AmbientOrbs />
      {/* Background Slider */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide}
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
            index === current ? "opacity-100" : "opacity-0"
          )}
          style={{ backgroundImage: `url(${slide})` }}
        />
      ))}
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
      <div className="absolute inset-0 bg-grid-pattern opacity-50 mix-blend-overlay" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Text & Stats */}
          <div className="lg:col-span-7 xl:col-span-6">
            {/* Eyebrow */}
            <MotionReveal className="mb-8 flex items-center gap-3">
              <div className="secondary-cta flex items-center gap-2 rounded-full px-3 py-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-primary font-medium">{t("hero.eyebrowVerified")}</span>
              </div>
              <div className="w-12 h-px bg-primary/30" />
              <span className="text-xs text-muted-foreground font-medium">{t("hero.eyebrowLocation")}</span>
            </MotionReveal>

            {/* Headline */}
            <MotionReveal delay={0.08}>
              <h1 className="mb-6 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] tracking-tight text-foreground">
                {t("hero.titleLine1")} <br className="hidden sm:block" />
              <span className="text-gradient-primary italic">Perfect</span>
                <br className="hidden sm:block" /> {t("hero.titleLine2")}
              </h1>
            </MotionReveal>

            <MotionReveal delay={0.16}>
              <p className="mb-12 max-w-lg text-lg leading-relaxed text-muted-foreground">
                {t("hero.description")}
              </p>
            </MotionReveal>

            {/* Stats */}
            <MotionStagger className="flex items-center gap-8">
              {[
                { num: "500+", label: t("hero.stats.families") },
                { num: "7",    label: t("hero.stats.projects") },
                { num: "100%", label: t("hero.stats.verified") },
              ].map((stat, i) => (
                <MotionStaggerItem key={i} className="flex flex-col gap-1">
                  <span className="font-serif text-3xl font-semibold text-foreground">{stat.num}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
                </MotionStaggerItem>
              ))}
            </MotionStagger>
            
            {/* Slide Indicators */}
            <MotionReveal delay={0.24} className="mt-12 flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={cn(
                    "w-8 h-1 rounded-full transition-all duration-300",
                    i === current ? "bg-primary" : "bg-primary/20"
                  )}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </MotionReveal>
          </div>

          {/* Right Column - Enquiry Form */}
          <MotionReveal
            delay={0.28}
            className="lg:col-span-5 xl:col-span-4 xl:col-start-9"
          >
            <div
              className={cn(
                "rounded-[1.9rem] p-6 sm:p-8",
                siteTemplate === "immersive" ? "surface-card" : "admin-panel"
              )}
            >
              <div className="mb-6">
                <h3 className="mb-2 font-serif text-2xl font-medium text-foreground">{t("hero.form.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("hero.form.subtitle")}</p>
              </div>
              <EnquiryForm variant="sidebar" className="[&_label_span]:text-muted-foreground [&_label:hover_span]:text-foreground" />
            </div>
          </MotionReveal>
          
        </div>
      </div>
    </section>
  );
}
