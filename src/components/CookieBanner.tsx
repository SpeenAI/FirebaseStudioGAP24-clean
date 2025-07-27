'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { getCookie, setCookie } from 'cookies-next';

export const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = getCookie('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Set cookie for 1 year
    setCookie('cookie_consent', 'true', { maxAge: 60 * 60 * 24 * 365 });
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-center sm:text-left">
          Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die Nutzung unserer Seite stimmen Sie der Verwendung von Cookies zu. 
          Lesen Sie unsere{' '}
          <Link href="/datenschutz" className="font-bold underline hover:text-gray-300">
            Datenschutzerklärung
          </Link>.
        </p>
        <div className="flex-shrink-0">
          <Button onClick={handleAccept}>Akzeptieren</Button>
        </div>
      </div>
    </div>
  );
};
