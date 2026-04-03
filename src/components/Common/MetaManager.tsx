import React, { useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { normalizeImageUrl } from '../../utils/images';

export const MetaManager: React.FC = () => {
  const { getSiteSetting, loading } = useSettings();

  useEffect(() => {
    if (loading) return;

    const siteName = getSiteSetting('site_name') || 'Aligarh Attar House';
    const siteDescription = getSiteSetting('site_description') || 'Pure Attars, Oud & Islamic Lifestyle Products from Aligarh';
    const faviconUrl = normalizeImageUrl(getSiteSetting('favicon_url'));

    // Update Page Title
    if (document.title !== siteName) {
      document.title = siteName;
    }

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', siteDescription);

    // Update Favicon
    if (faviconUrl) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (link) {
        link.href = faviconUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'shortcut icon';
        newLink.href = faviconUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [getSiteSetting, loading]);

  return null; // This component doesn't render any UI
};

export default MetaManager;
