import Image from 'next/image';

export const APP_STORE_URL = 'https://apps.apple.com/us/app/satwikfarms/id6759561187';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.satwikfarms';

// Store badges for ordering CTAs. App Store first (Apple guideline); the
// Play badge is rendered the same height or slightly larger (Google guideline).
export default function AppStoreBadges({ className = '', height = 48 }) {
  const appStoreWidth = Math.round(height * (180 / 54));
  const playHeight = height + 2;
  const playWidth = Math.round(playHeight * (195 / 58));

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block hover:scale-105 transition-transform duration-300"
      >
        <Image
          src="/images/app-store-download.svg"
          alt="Download the Satwik Farms app on the App Store"
          width={appStoreWidth}
          height={height}
          loading="lazy"
        />
      </a>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block hover:scale-105 transition-transform duration-300"
      >
        <Image
          src="/images/play-store-download.svg"
          alt="Get the Satwik Farms app on Google Play"
          width={playWidth}
          height={playHeight}
          loading="lazy"
        />
      </a>
    </div>
  );
}
