"use client";
import { useEffect } from "react";

/** Widget Google Translate (fr ↔ en), identique à la version Quarto. */
export default function GoogleTranslate() {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    (window as unknown as { googleTranslateElementInit?: () => void }).googleTranslateElementInit = () => {
      const g = (window as unknown as { google?: any }).google;
      if (g?.translate) {
        new g.translate.TranslateElement(
          {
            pageLanguage: "fr",
            includedLanguages: "en,fr",
            layout: g.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(s);
  }, []);

  return <div id="google_translate_element" className="gtranslate" />;
}
