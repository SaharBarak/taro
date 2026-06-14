'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GradientText } from '@/components/ui/GradientText';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import type { LegalSection } from './LegalPage';
import styles from './LegalPage.module.css';

interface LegalContentProps {
  title: string;
  intro?: string;
  updated?: string;
  sections: LegalSection[];
}

const BRAND_EASE = [0.22, 1, 0.36, 1] as const;

/** Stable, locale-agnostic anchor id for a section. */
function sectionId(index: number): string {
  return `legal-section-${index + 1}`;
}

/**
 * Interactive luminous body for the shared legal layout: animated header,
 * sticky table-of-contents with active-section tracking, and a comfortable
 * reading panel. All motion degrades cleanly under reduced-motion.
 */
export function LegalContent({ title, intro, updated, sections }: LegalContentProps) {
  const reducedMotion = useReducedMotion();
  const ids = useMemo(() => sections.map((_, i) => sectionId(i)), [sections]);
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '');

  // Track the section closest to the top of the viewport for TOC highlighting.
  useEffect(() => {
    if (typeof window === 'undefined' || ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  const handleJump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    el.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    el.focus({ preventScroll: true });
  };

  const titleInitial = reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <motion.div
          initial={titleInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: BRAND_EASE }}
        >
          <Eyebrow>מסמך משפטי</Eyebrow>
        </motion.div>

        <motion.h1
          className={styles.title}
          initial={titleInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.08, ease: BRAND_EASE }}
        >
          <GradientText>{title}</GradientText>
        </motion.h1>

        <motion.span
          className={styles.rule}
          aria-hidden
          initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: reducedMotion ? 0 : 0.2, ease: BRAND_EASE }}
        />

        {intro && (
          <motion.p
            className={styles.intro}
            initial={titleInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.28, ease: BRAND_EASE }}
          >
            {intro}
          </motion.p>
        )}

        {updated && (
          <motion.p
            className={styles.updated}
            initial={titleInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.36, ease: BRAND_EASE }}
          >
            {updated}
          </motion.p>
        )}
      </header>

      <div className={styles.body}>
        {sections.length > 1 && (
          <nav className={styles.toc} aria-label="ניווט בסעיפים">
            <span className={styles.tocLabel}>בעמוד זה</span>
            <ul className={styles.tocList}>
              {sections.map((section, i) => {
                const id = ids[i];
                const isActive = id === activeId;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => handleJump(e, id)}
                      className={styles.tocLink}
                      aria-current={isActive ? 'true' : undefined}
                      data-active={isActive || undefined}
                    >
                      <span className={styles.tocMarker} aria-hidden />
                      {section.heading}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <article className={styles.panel}>
          {sections.map((section, i) => {
            const id = ids[i];
            return (
              <AnimatedFadeInUp key={id} delay={reducedMotion ? 0 : 0.04}>
                <section
                  id={id}
                  tabIndex={-1}
                  className={styles.section}
                  aria-labelledby={`${id}-heading`}
                >
                  <h2 id={`${id}-heading`} className={styles.heading}>
                    <span className={styles.headingMarker} aria-hidden />
                    {section.heading}
                  </h2>

                  {section.paragraphs?.map((p, j) => (
                    <p key={j} className={styles.paragraph}>
                      {p}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className={styles.bullets}>
                      {section.bullets.map((b, k) => (
                        <li key={k} className={styles.bullet}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </AnimatedFadeInUp>
            );
          })}
        </article>
      </div>
    </div>
  );
}
