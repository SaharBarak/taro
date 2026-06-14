'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Typography';
import { AnimatedFadeInUp } from '@/components/animations';
import { useReducedMotion } from '@/hooks';
import styles from './Team.module.css';

type Accent = 'blue' | 'green' | 'purple' | 'amber';

interface Member {
  name: string;
  role: string;
  bio: string;
  accent: Accent;
}

const TEAM: Member[] = [
  {
    name: 'דנה כהן',
    role: 'מייסדת ומנכ״לית',
    bio: 'יזמית טכנולוגיה עם רקע בממשל מקומי. מאמינה שהדרך לשנות את הדמוקרטיה מתחילה ברשות אחת.',
    accent: 'blue',
  },
  {
    name: 'יוסי לוי',
    role: 'מנהל טכנולוגיות',
    bio: 'מומחה בלוקצ׳יין ואבטחת מידע. בנה מערכות מאומתות שמשרתות מיליוני משתמשים.',
    accent: 'green',
  },
  {
    name: 'מיכל אברהם',
    role: 'מנהלת מוצר',
    bio: 'עשור של פיתוח מוצרים דיגיטליים, עם דגש על חוויית משתמש ונגישות אמיתית לכולם.',
    accent: 'purple',
  },
  {
    name: 'אורי שמעוני',
    role: 'פיתוח עסקי',
    bio: 'רקע בעבודה מול רשויות מקומיות וממשלה. מגשר בין הטכנולוגיה לצרכים של הקהילה.',
    accent: 'amber',
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');
}

export function Team() {
  const reducedMotion = useReducedMotion();

  return (
    <section className={`${styles.team} lc-band-tint`} aria-label="הצוות">
      <div className={styles.inner}>
        <div className={styles.header}>
          <Eyebrow>הצוות</Eyebrow>

          <AnimatedFadeInUp>
            <Heading level={2} weight="extrabold" className={styles.headline}>
              האנשים מאחורי תַּרְאוּ.
            </Heading>
          </AnimatedFadeInUp>

          <AnimatedFadeInUp delay={0.1}>
            <p className={styles.sub}>
              צוות קטן של מומחים בטכנולוגיה, ממשל מקומי וחוויית משתמש — מאוחדים תחת
              חזון אחד: להחזיר את הקול לתושבים.
            </p>
          </AnimatedFadeInUp>
        </div>

        <div className={styles.grid}>
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard
                variant="interactive"
                glow={member.accent}
                className={styles.memberCard}
              >
                <span
                  className={`${styles.avatar} ${styles[`avatar_${member.accent}`]}`}
                  aria-hidden="true"
                >
                  {getInitials(member.name)}
                </span>
                <h3 className={styles.memberName}>{member.name}</h3>
                <span className={styles.memberRole}>{member.role}</span>
                <p className={styles.memberBio}>{member.bio}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
