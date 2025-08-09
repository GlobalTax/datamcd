import React, { useEffect } from "react";

interface SeoProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
}

export const Seo: React.FC<SeoProps> = ({ title, description, canonicalUrl }) => {
  useEffect(() => {
    // Title (keep under 60 chars when possible)
    if (title) {
      document.title = title.slice(0, 60);
    }

    // Meta description (max ~160 chars)
    if (description) {
      let meta = document.querySelector("meta[name='description']") as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description.slice(0, 160));
    }

    // Canonical link
    const url = canonicalUrl || (typeof window !== "undefined" ? window.location.href : undefined);
    if (url) {
      let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    }
  }, [title, description, canonicalUrl]);

  return null;
};

export default Seo;
