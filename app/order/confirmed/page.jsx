import { Suspense } from 'react';

import Confirmation from './Confirmation';

export const metadata = { title: 'Order Confirmed', robots: { index: false, follow: false } };

export default function ConfirmedPage() {
  return (
    <Suspense fallback={null}>
      <Confirmation />
    </Suspense>
  );
}
