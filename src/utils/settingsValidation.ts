import type { Settings, CaretStyle, FontFamily, ProfileFrame, ParticleTier } from '../types/settings';
import { DEFAULT_SETTINGS, CARET_UNLOCK, FONT_UNLOCK } from '../constants/defaults';
import { themes } from '../constants/themes';
import { PROFILE_FRAMES } from '../constants/profileFrames';
import { PARTICLE_TIERS } from '../constants/particles';
import { getEffectiveLevel } from './admin';

/**
 * Validates settings against the player's effective level.
 * If any setting requires a higher level than the player has,
 * it falls back to the default value.
 */
export function validateSettings(settings: Settings, level: number, userId?: string | null): Settings {
  const effectiveLevel = getEffectiveLevel(level, userId);
  let validated = { ...settings };

  // Validate caret style
  const caretUnlock = CARET_UNLOCK[settings.caretStyle as CaretStyle];
  if (caretUnlock !== undefined && effectiveLevel < caretUnlock) {
    validated.caretStyle = DEFAULT_SETTINGS.caretStyle;
  }

  // Validate font
  const fontUnlock = FONT_UNLOCK[settings.fontFamily as FontFamily];
  if (fontUnlock !== undefined && effectiveLevel < fontUnlock) {
    validated.fontFamily = DEFAULT_SETTINGS.fontFamily;
  }

  // Validate theme
  const theme = themes.find(t => t.id === settings.theme);
  if (theme && effectiveLevel < theme.unlockLevel) {
    validated.theme = DEFAULT_SETTINGS.theme;
  }

  // Validate profile frame
  const frame = PROFILE_FRAMES.find(f => f.id === settings.profileFrame);
  if (frame && effectiveLevel < frame.unlockLevel) {
    validated.profileFrame = DEFAULT_SETTINGS.profileFrame;
  }

  // Validate particle tier
  const tier = PARTICLE_TIERS.find(t => t.id === settings.particleTier);
  if (tier && effectiveLevel < tier.unlockLevel) {
    validated.particleTier = DEFAULT_SETTINGS.particleTier;
  }

  return validated;
}
