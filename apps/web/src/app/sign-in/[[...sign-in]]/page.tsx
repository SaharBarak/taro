import { SignIn } from '@clerk/nextjs';
import styles from './page.module.css';

export const metadata = {
  title: 'התחברות',
  description: 'התחברו לחשבון הסינק שלכם',
};

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>ברוכים השבים</h1>
        <p className={styles.subtitle}>התחברו כדי להצביע על נושאים מקומיים</p>
        <div className={styles.clerkContainer}>
          <SignIn
            appearance={{
              elements: {
                rootBox: styles.clerkRoot,
                card: styles.clerkCard,
                headerTitle: styles.clerkTitle,
                headerSubtitle: styles.clerkSubtitle,
                formButtonPrimary: styles.clerkButton,
              },
            }}
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
