import WelcomeForm from './WelcomeForm';

export const metadata = {
  title: 'Welcome',
  robots: { index: false, follow: false }, // transactional, not a landing page
};

export default function WelcomePage() {
  return <WelcomeForm />;
}
