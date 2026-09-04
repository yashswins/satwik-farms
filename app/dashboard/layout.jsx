import { Poppins } from 'next/font/google';

/**
 * Shared by the login page and the signed-in app (app/dashboard/(app)).
 * Nothing here fetches data or trusts anyone; the (app) layout does the
 * gating. Metadata: never indexed — see also the X-Robots-Tag header in
 * next.config.js, which covers responses this metadata cannot.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata = {
  title: { default: 'Dashboard', template: '%s · Dashboard' },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export const viewport = {
  themeColor: '#53B175',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const dynamic = 'force-dynamic';

// Runs before first paint so a saved Light/Dark choice never flashes the
// other theme. Reads the same key ThemeToggle writes. Allowed by the CSP
// ('unsafe-inline' is already required for Next's own hydration script).
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('sf-dashboard-theme');var s=document.getElementById('dashboard-theme-scope');if(s&&(t==='light'||t==='dark')){s.classList.add(t);}}catch(e){}})();`;

export default function DashboardRootLayout({ children }) {
  return (
    <div id="dashboard-theme-scope">
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      <div
        className={`${poppins.variable} min-h-screen bg-shop-bg font-poppins text-shop-text
                    dark:bg-[#0F1410] dark:text-[#D4EDD4]`}
      >
        {children}
      </div>
    </div>
  );
}
