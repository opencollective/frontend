import React from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash';
import NextLink from 'next/link'; // eslint-disable-line no-restricted-imports
import { Scrollchor } from 'react-scrollchor';

class Link extends React.Component {
  static propTypes = {
    href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    target: PropTypes.string,
    animate: PropTypes.object,
    className: PropTypes.string,
    title: PropTypes.string,
    onClick: PropTypes.func,
    openInNewTab: PropTypes.bool,
    children: PropTypes.node.isRequired,
    'data-cy': PropTypes.string,
    innerRef: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { isIframe: false };
    this.isHash = props.href && this.constructRoutePath(props.href).substr(0, 1) === '#';
  }

  componentDidMount() {
    this.setState({ isIframe: window.self !== window.top });
  }

  constructRoutePath(href) {
    if (typeof href === 'string') {
      return href;
    } else if (href) {
      return href.pathname;
    } else {
      return '';
    }
  }

  render() {
    const { href, children, className, openInNewTab, innerRef, ...restProps } = this.props;
    if (this.isHash) {
      const route = this.constructRoutePath(href);
      const afterAnimate = () => {
        if (window.history) {
          history.pushState({ ...history.state, as: location.pathname + route }, undefined, route);
        }
      };
      return (
        <Scrollchor
          animate={this.props.animate}
          to={route.substr(1)}
          className={className}
          disableHistory={true}
          afterAnimate={afterAnimate}
        >
          {children}
        </Scrollchor>
      );
    } else {
      return (
        <NextLink
          {...pick(this.props, ['href', 'scroll', 'title', 'onClick'])}
          ref={innerRef}
          className={className}
          {...restProps}
          data-cy={this.props['data-cy']}
          {...(openInNewTab || this.state.isIframe ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
        >
          {children}
        </NextLink>
      );
    }
  }
}

/**
 * @typedef {{ target?: string, href?: string | Record<string, any>, animate?: any, className?: string, title?: string, onClick?: () => void, openInNewTab?: boolean, className?: string, children?: any, 'data-cy'?: string  } & React.HTMLAnchorElement} LinkProps
 * @type React.ForwardRefRenderFunction<HTMLAnchorElement, LinkProps>
 */
export default React.forwardRef((props, ref) => <Link innerRef={ref} {...props} />);
