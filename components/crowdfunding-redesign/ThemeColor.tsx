import React from 'react';
import { parseToHsl } from 'polished';

export function ThemeColor({ color = undefined }) {
  if (!color) {
    return null;
  }

  const hsl = parseToHsl(color);

  return (
    // eslint-disable-next-line react/no-unknown-property
    <style jsx global>
      {`
        :root {
          --primary: hsl(${hsl.hue}, ${hsl.saturation * 100}%, ${hsl.lightness * 100}%);
          --primary-foreground: hsl(${hsl.hue}, ${(hsl.saturation * 100) / 2}%, ${98}%);
        }
      `}
    </style>
  );
}
