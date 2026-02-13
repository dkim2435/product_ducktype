import { useEffect } from 'react';

const FONT_MAP: Record<string, string> = {
  default: "'Roboto Mono', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', monospace",
  mono: "monospace",
  'roboto-mono': "'Roboto Mono', monospace",
  'fira-code': "'Fira Code', monospace",
  'source-code-pro': "'Source Code Pro', monospace",
};

const ALT_FONTS: Record<string, string> = {
  'fira-code': 'Fira+Code:wght@300;400;500;700',
  'source-code-pro': 'Source+Code+Pro:wght@300;400;500;700',
};

const CJK_FONTS: Record<string, string> = {
  ko: 'Noto+Sans+KR:wght@400;700',
  ja: 'Noto+Sans+JP:wght@400;700',
  zh: 'Noto+Sans+SC:wght@400;700',
};

function loadGoogleFont(id: string, fontParam: string) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
  document.head.appendChild(link);
}

export function useFontLoader(fontFamily: string, language: string) {
  // Load alternative font when selected
  useEffect(() => {
    const fontParam = ALT_FONTS[fontFamily];
    if (fontParam) loadGoogleFont(`gfont-${fontFamily}`, fontParam);
    document.documentElement.style.setProperty(
      '--font-family',
      FONT_MAP[fontFamily] || FONT_MAP.default
    );
  }, [fontFamily]);

  // Load CJK fonts when CJK language is selected
  useEffect(() => {
    const fontParam = CJK_FONTS[language];
    if (fontParam) loadGoogleFont(`gfont-cjk-${language}`, fontParam);
  }, [language]);
}
