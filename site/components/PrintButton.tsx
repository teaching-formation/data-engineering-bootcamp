"use client";

/** Déclenche l'impression navigateur → l'utilisateur enregistre en PDF. */
export default function PrintButton() {
  return (
    <button className="pdf-btn" onClick={() => window.print()} aria-label="Télécharger en PDF">
      📄 Télécharger en PDF
    </button>
  );
}
