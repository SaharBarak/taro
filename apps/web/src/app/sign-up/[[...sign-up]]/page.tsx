import { SignUp } from '@clerk/nextjs';
import styles from './page.module.css';

export const metadata = {
  title: 'הרשמה',
  description: 'הצטרפו לסינק והתחילו להשפיע על הקהילה שלכם',
};

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>הצטרפו לסינק</h1>
        <p className={styles.subtitle}>יצרו חשבון והתחילו להצביע על נושאים מקומיים</p>
        <div className={styles.clerkContainer}>
          <SignUp
            appearance={{
              elements: {
                rootBox: styles.clerkRoot,
                card: styles.clerkCard,
                headerTitle: styles.clerkTitle,
                headerSubtitle: styles.clerkSubtitle,
                formButtonPrimary: styles.clerkButton,
              },
            }}
            signInUrl="/sign-in"
            forceRedirectUrl="/onboarding"
          />
        </div>
      </div>
    </div>
  );
}
