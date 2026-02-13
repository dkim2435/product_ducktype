export interface ThemeColors {
  bg: string;
  main: string;
  caret: string;
  sub: string;
  subAlt: string;
  text: string;
  error: string;
  errorExtra: string;
  colorfulError: string;
  colorfulErrorExtra: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  unlockLevel: number;
  premium?: boolean;
  premiumSet?: string;
}
