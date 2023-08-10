import React from 'react';
import PropTypes from 'prop-types';
import { get, throttle } from 'lodash';
import memoizeOne from 'memoize-one';
import { ThemeProvider } from 'styled-components';
import { isHexColor } from 'validator';

import defaultTheme, { adjustLuminance, generateTheme } from '../lib/theme';

/**
 * A special `ThemeProvider` that plugs the custom collective theme, defined by the color
 * from `collective.settings.collectivePage.primaryColor`.
 */
export default class CollectiveThemeProvider extends React.PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    collective: PropTypes.shape({
      settings: PropTypes.shape({
        collectivePage: PropTypes.shape({
          primaryColor: PropTypes.string,
        }),
      }),
    }),
  };

  state = { newPrimaryColor: null };

  getTheme = memoizeOne(primaryColor => {
    if (!primaryColor) {
      return defaultTheme;
    } else if (!isHexColor(primaryColor)) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid custom color: ${primaryColor}`);
      return defaultTheme;
    } else {
      return generateTheme({
        colors: {
          ...defaultTheme.colors,
          primary: {
            900: adjustLuminance(primaryColor, 0.1),
            800: adjustLuminance(primaryColor, 0.2),
            700: adjustLuminance(primaryColor, 0.3),
            600: adjustLuminance(primaryColor, 0.42),
            500: adjustLuminance(primaryColor, 0.5),
            400: adjustLuminance(primaryColor, 0.6),
            300: adjustLuminance(primaryColor, 0.65),
            200: adjustLuminance(primaryColor, 0.72),
            100: adjustLuminance(primaryColor, 0.92),
            50: adjustLuminance(primaryColor, 0.97),
            base: primaryColor,
          },
        },
      });
    }
  });

  onPrimaryColorChange = throttle(newPrimaryColor => {
    this.setState({ newPrimaryColor });
  }, 2000);

  render() {
    const { collective, children } = this.props;
    const primaryColor = this.state.newPrimaryColor || get(collective, 'settings.collectivePage.primaryColor');
    return (
      <ThemeProvider theme={this.getTheme(primaryColor)}>
        {typeof children === 'function' ? (
          children({ onPrimaryColorChange: this.onPrimaryColorChange })
        ) : (
          <React.Fragment>{children}</React.Fragment>
        )}
      </ThemeProvider>
    );
  }
}
