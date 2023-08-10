import { clamp } from 'lodash';
import { darken, getContrast, getLuminance, setLightness, transparentize } from 'polished';

import { getButtonSizes, getButtonStyles } from './variants/button';
// Import defaults
import defaultBreakpoints from './breakpoints';
import defaultColors from './colors';
import defaultSpaces from './spaces';

/**
 * Ensures that the contrast is at least 7/1, as recommended by the [W3c](https://webaim.org/articles/contrast)
 */
export const adjustColorContrast = color => {
  const contrast = getContrast(color, '#fff');
  if (contrast >= 7) {
    return color;
  } else {
    const contrastDiff = (7 - contrast) / 21;
    return darken(contrastDiff, color);
  }
};

export const adjustLuminance = (color, value) => {
  const adjustedColor = adjustColorContrast(color);
  const luminance = getLuminance(adjustedColor);
  // Allow a deviation to up to 20% of the default luminance. Don't apply this to really
  // dark colors (luminance < 0.05)
  const luminanceAdjustment = luminance < 0.05 ? -0.1 : luminance / 5;

  return setLightness(clamp(value + luminanceAdjustment, 0, 0.97), adjustedColor);
};

export const generateTheme = ({ colors = defaultColors, space = defaultSpaces } = {}) => ({
  colors,
  space,
  breakpoints: defaultBreakpoints,
  buttons: getButtonStyles({ colors }),
  buttonSizes: getButtonSizes(),
  messageTypes: {
    white: {
      backgroundColor: colors.white.full,
      borderColor: colors.black[200],
    },
    dark: {
      backgroundColor: transparentize(0.2, colors.black[900]),
      borderColor: colors.black[900],
      color: colors.white.full,
    },
    info: {
      backgroundColor: colors.blue[50],
      borderColor: colors.blue[400],
      color: colors.black[800],
    },
    success: {
      backgroundColor: colors.green[50],
      borderColor: colors.green[500],
      color: colors.black[800],
    },
    warning: {
      backgroundColor: colors.yellow[50],
      borderColor: colors.yellow[500],
      color: colors.black[800],
    },
    error: {
      backgroundColor: colors.red[50],
      borderColor: colors.red[500],
      color: colors.black[800],
    },
  },
  sizes: {
    navbarHeight: 64,
  },
});

// Generate and export main theme
const theme = generateTheme();
export default theme;
