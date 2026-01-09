'use client';

import { motion } from 'framer-motion';
import { Heading, Text } from '@/components/ui/Typography';
import { Card, CardContent } from '@/components/ui/Card';
import { AnimatedFadeInUp, AnimatedWords } from '@/components/animations';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import styles from './Features.module.css';

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'אף אחד לא שואל אותנו',
    description:
      'הרשויות מקבלות החלטות שמשפיעות על חיינו בלי להתייעץ. אין מנגנון שמחייב אותם להקשיב. עד עכשיו.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    title: 'קונצנזוס אזרחי מקומי',
    description:
      'יוצרים רוב אזרחי שקוף ומוכח שאי אפשר להתעלם ממנו. אולטימטום של לגיטימציה מהעם לרשות.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: 'מבוזר לחלוטין',
    description:
      'אין גוף מרכזי ששולט. הפלטפורמה שייכת לאזרחים. בלוקצ׳יין לרישום, IPFS לאחסון. אף אחד לא יכול לצנזר או לשנות.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'אימות מיקום GPS',
    description:
      'רק תושבי הרשות יכולים להצביע על הנושאים שלה. אימות גאוגרפי מונע מניפולציות מבחוץ.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'הכסף עובד בשבילכם',
    description:
      'כשנוצר רוב והרשות מסרבת להתיישר - הכסף שנצבר מההצבעות הולך לצעדים משפטיים, תקשורתיים ופוליטיים לאכיפה.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'הכוח חוזר לעם',
    description:
      'זו הדרך היחידה להתנגד. ליצור עובדות בשטח. רוב אזרחי שקוף שמחזיר את הכוח למקום שהוא שייך - אליכם.',
  },
];

export function Features() {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <AnimatedFadeInUp>
            <Text size="lg" color="accent" weight="semibold" align="center">
              למה זה קיים
            </Text>
          </AnimatedFadeInUp>
          <AnimatedFadeInUp delay={0.1}>
            <Heading level={2} align="center">
              <AnimatedWords text="הדרך היחידה להתנגד" delay={0.2} />
            </Heading>
          </AnimatedFadeInUp>
          <AnimatedFadeInUp delay={0.2}>
            <Text size="xl" color="secondary" align="center" className={styles.description}>
              אין אלטרנטיבה. הרשויות לא שואלות, לא מתייעצות, לא מקשיבות.
              תֵּרָאוּ היא הכלי היחיד ליצור קונצנזוס אזרחי שקוף שאי אפשר להתעלם ממנו.
            </Text>
          </AnimatedFadeInUp>
        </div>

        {/* Features Grid */}
        <motion.div
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <Card variant="default" padding="lg" interactive className={styles.card}>
                <CardContent>
                  <div className={styles.iconWrapper}>{feature.icon}</div>
                  <h3 className={styles.cardTitle}>{feature.title}</h3>
                  <Text size="base" color="secondary">
                    {feature.description}
                  </Text>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
