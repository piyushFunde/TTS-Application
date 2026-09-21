import React from 'react';

const LANGUAGES = [
  { code: 'ALL', name: 'All Languages' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
];

export default function LanguageSelector({ selectedLang, setSelectedLang }) {
  return (
    <div className="language-selector-group">
      <label className="field-label" htmlFor="language-select">
        Filter by Language
      </label>
      <div className="language-pills">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`lang-pill ${selectedLang === lang.code ? 'active' : ''}`}
            onClick={() => setSelectedLang(lang.code)}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
