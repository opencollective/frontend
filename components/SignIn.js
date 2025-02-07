import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { FormattedMessage } from 'react-intl';

import Container from './Container';
import { WebsiteName } from './I18nFormatters';
import Image from './Image';
import Link from './Link';
import { PasswordInput } from './PasswordInput';
import StyledButton from './StyledButton';
import StyledInput from './StyledInput';
import StyledInputField from './StyledInputField';
import StyledLink from './StyledLink';
import StyledLinkButton from './StyledLinkButton';
import { Span } from './Text';

/**
 * Component for handing user sign-in or redirecting to sign-up.
 */
export default class SignIn extends React.Component {
  static propTypes = {
    /** handles the email input submission, a.k.a Sign In */
    onSubmit: PropTypes.func.isRequired,
    /** handles the redirect from sign-in, a.k.a Join Free. Accepts URLs (string) or custom action func */
    onSecondaryAction: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
    /** When set to true, will show a spinner in Sign In button and will disable all actions */
    loading: PropTypes.bool,
    /** Whether user can click on "Join Free" */
    showSecondaryAction: PropTypes.bool,
    /** Set this to true to display the unknown email message */
    unknownEmail: PropTypes.bool,
    /** Set this to true to display the password field */
    passwordRequired: PropTypes.bool,
    /** Label, defaults to "Continue with your email" */
    label: PropTypes.node,
    /** Set the value of email input */
    email: PropTypes.string.isRequired,
    /** Set the value of password input */
    password: PropTypes.string,
    /** handles changes in the email input */
    onEmailChange: PropTypes.func.isRequired,
    /** handles changes in the password input */
    onPasswordChange: PropTypes.func.isRequired,
    /** Oauth Sign In **/
    isOAuth: PropTypes.bool,
    /** Oauth App Name **/
    oAuthAppName: PropTypes.string,
    /** Oauth App Image **/
    oAuthAppImage: PropTypes.string,
    /** Show/hide subheading **/
    showSubHeading: PropTypes.bool,
    /** Show/hide Open Collective Logo **/
    showOCLogo: PropTypes.bool,
    /** whether the input needs to be auto-focused */
    autoFocus: PropTypes.bool,
  };

  static defaultProps = {
    showSubHeading: true,
    showOCLogo: true,
    autoFocus: true,
  };

  constructor(props) {
    super(props);
    this.state = { error: null, showError: false };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.unknownEmail !== this.props.unknownEmail) {
      this.setState({ unknownEmail: this.props.unknownEmail });
    }
  }

  renderSecondaryAction(message) {
    const { loading, onSecondaryAction } = this.props;
    return typeof onSecondaryAction === 'string' ? (
      <StyledLink
        as={Link}
        href={onSecondaryAction}
        disabled={loading}
        fontSize="14px"
        data-cy="signin-secondary-action-btn"
        $underlineOnHover
      >
        {message}
      </StyledLink>
    ) : (
      <StyledLinkButton
        fontSize="14px"
        onClick={onSecondaryAction}
        disabled={loading}
        data-cy="signin-secondary-action-btn"
        $underlineOnHover
      >
        {message}
      </StyledLinkButton>
    );
  }

  getSignInPageHeading(unknownEmail) {
    if (this.props.isOAuth && unknownEmail) {
      return <FormattedMessage defaultMessage="Sign in to your Open Collective account" id="sAWx+H" />;
    } else if (this.props.isOAuth) {
      return <FormattedMessage defaultMessage="Continue with your Open Collective account" id="07Y/8I" />;
    } else {
      return this.props.label || <FormattedMessage defaultMessage="Continue with your email" id="6zdt+y" />;
    }
  }

  getSignInPageSubHeading(oAuthAppName) {
    if (this.props.isOAuth) {
      return (
        <FormattedMessage defaultMessage="and connect with {oAuthAppName}" id="boQlk1" values={{ oAuthAppName }} />
      );
    } else {
      return <FormattedMessage defaultMessage="Sign in or create a personal account to continue" id="qxlyPu" />;
    }
  }

  render() {
    const { onSubmit, loading, email, password, onEmailChange, onPasswordChange, label } = this.props;
    const { error, showError } = this.state;
    return (
      <React.Fragment>
        <Head>
          {/* Add title hint for 1password and perhaps other password managers*/}
          <title>Sign In - Open Collective</title>
        </Head>
        <div className="max-w-[390px] px-5 md:px-0">
          {this.props.isOAuth ? (
            <React.Fragment>
              <div className="mb-10 flex justify-center">
                <div className="min-w-[104px]">
                  <Image src="/static/images/oc-logo-oauth.png" height={104} width={104} />
                </div>
                <div className="ml-6 mr-6 mt-8 min-w-[40px]">
                  <Image src="/static/images/oauth-flow-connect.png" height={40} width={40} />
                </div>
                <div className="min-w-[104px]">
                  <img src={this.props.oAuthAppImage} alt="" height={104} width={104} style={{ borderRadius: 10 }} />
                </div>
              </div>
            </React.Fragment>
          ) : (
            this.props.showOCLogo && (
              <div className="flex justify-center">
                <Image src="/static/images/oc-logo-watercolor-256.png" height={128} width={128} />
              </div>
            )
          )}
          <label
            htmlFor="email"
            className={`flex font-bold text-[${label ? '24px' : ['24px', '32px']}] mb-3 mt-3 text-center`}
          >
            {label || this.getSignInPageHeading(this.state.unknownEmail)}
          </label>
          {this.props.showSubHeading && (
            <div className="mb-[50px] flex justify-center text-base font-normal text-gray-500">
              {this.getSignInPageSubHeading(this.props.oAuthAppName)}
            </div>
          )}
          {!this.state.unknownEmail ? (
            <React.Fragment>
              <Container
                as="form"
                method="POST"
                noValidate
                data-cy="signIn-form"
                onSubmit={event => {
                  event.preventDefault();
                  if (error) {
                    return;
                  }
                  onSubmit();
                  this.setState({ unknownEmail: this.props.unknownEmail });
                }}
              >
                <StyledInputField
                  style={{ display: this.props.passwordRequired ? 'none' : 'block' }}
                  labelFontWeight={600}
                  labelFontSize="13px"
                  alignItems="left"
                  width="100%"
                  label={<FormattedMessage id="Form.yourEmail" defaultMessage="Your email address" />}
                  htmlFor="email"
                  my={2}
                >
                  <StyledInput
                    error={!!error}
                    fontSize="14px"
                    id="email"
                    autoComplete="email"
                    name="email"
                    minWidth={120}
                    onChange={({ target }) => {
                      target.value = target.value.trim();
                      onEmailChange(target.value);
                      this.setState({ error: target.validationMessage, showError: false });
                    }}
                    onKeyDown={e => {
                      // See https://github.com/facebook/react/issues/6368
                      if (e.key === ' ') {
                        e.preventDefault();
                      } else if (e.key === 'Enter') {
                        onEmailChange(e.target.value);
                        this.setState({ error: e.target.validationMessage, showError: true });
                      }
                    }}
                    onBlur={() => this.setState({ showError: true })}
                    onInvalid={event => {
                      event.preventDefault();
                      this.setState({ error: event.target.validationMessage });
                    }}
                    placeholder="e.g., yourname@yourhost.com"
                    autoFocus={this.props.autoFocus}
                    required
                    value={email}
                    type="email"
                    width={1}
                  />
                </StyledInputField>
                <StyledInputField
                  style={{ display: this.props.passwordRequired ? 'block' : 'none' }}
                  labelFontWeight={600}
                  labelFontSize="13px"
                  alignItems="left"
                  width="100%"
                  label={<FormattedMessage id="Form.yourPassword" defaultMessage="Your password" />}
                  htmlFor="password"
                  my={2}
                >
                  <PasswordInput
                    key={this.props.passwordRequired ? 'required' : 'initial'}
                    fontSize="14px"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    autoFocus={this.props.passwordRequired ? true : false}
                    required={this.props.passwordRequired ? true : false}
                    onChange={({ target }) => {
                      if (!this.props.passwordRequired) {
                        return;
                      }
                      onPasswordChange(target.value);
                      this.setState({ error: target.validationMessage, showError: false });
                    }}
                    onKeyDown={e => {
                      // See https://github.com/facebook/react/issues/6368
                      if (e.key === ' ') {
                        e.preventDefault();
                      } else if (e.key === 'Enter') {
                        onPasswordChange(e.target.value);
                        this.setState({ error: e.target.validationMessage, showError: true });
                      }
                    }}
                    onBlur={() => this.setState({ showError: true })}
                    onInvalid={event => {
                      event.preventDefault();
                      this.setState({ error: event.target.validationMessage });
                    }}
                  />
                </StyledInputField>
                {error && showError && (
                  <Span display="block" color="red.500" pt={2} fontSize="10px" lineHeight="14px" aria-live="assertive">
                    {error}
                  </Span>
                )}
                <div className="mb-6 mt-[26px] flex justify-center">
                  <StyledButton
                    data-cy="signin-btn"
                    buttonStyle="primary"
                    fontWeight="500"
                    disabled={!email}
                    loading={loading}
                    minWidth={157}
                    type="submit"
                    whiteSpace="nowrap"
                  >
                    <FormattedMessage id="actions.continue" defaultMessage="Continue" />
                  </StyledButton>
                </div>
              </Container>

              {this.props.showSecondaryAction && !this.props.passwordRequired && (
                <div>
                  <div className="mr-1 flex justify-center text-sm text-neutral-500">
                    <FormattedMessage defaultMessage="Don't have one?" id="1KQrEf" />
                  </div>
                  <div className="mt-2 flex justify-center text-sm">
                    {this.renderSecondaryAction(<FormattedMessage defaultMessage="Create an account" id="0vL5u1" />)}
                  </div>
                </div>
              )}

              {this.props.passwordRequired && (
                <div>
                  <div className="mr-1 flex justify-center text-sm text-neutral-500">
                    <FormattedMessage defaultMessage="Want to receive a login link?" id="4WXVC+" />
                    &nbsp;
                    <StyledLinkButton
                      fontSize="14px"
                      onClick={() => onSubmit({ sendLink: true })}
                      disabled={loading}
                      data-cy="signin-secondary-action-btn"
                      $underlineOnHover
                    >
                      <FormattedMessage defaultMessage="Send me an email" id="bDtPKE" />
                    </StyledLinkButton>
                  </div>

                  <div className="mr-1 mt-2 flex justify-center text-sm text-neutral-500">
                    <FormattedMessage defaultMessage="Lost your password?" id="I54CU/" />
                    &nbsp;
                    <StyledLinkButton
                      fontSize="14px"
                      onClick={() => onSubmit({ resetPassword: true })}
                      disabled={loading}
                      data-cy="signin-secondary-action-btn"
                      $underlineOnHover
                    >
                      <FormattedMessage defaultMessage="Reset my password" id="OXLLjP" />
                    </StyledLinkButton>
                  </div>
                </div>
              )}
            </React.Fragment>
          ) : (
            <Container
              textAlign="center"
              display="block"
              color="black.800"
              fontSize="14px"
              lineHeight="20px"
              aria-live="assertive"
              fontWeight={400}
            >
              <FormattedMessage
                defaultMessage="{email} does not exist on {WebsiteName}. Would you like to create an account with this email?"
                id="uuvv0g"
                values={{ email: <strong>{email}</strong>, WebsiteName }}
              />{' '}
              <div className="mt-6">
                <span className="mr-10">
                  {this.renderSecondaryAction(<FormattedMessage defaultMessage="Yes, create an account" id="axw0EY" />)}
                </span>
                <StyledLink onClick={() => this.setState({ unknownEmail: false })} $underlineOnHover={true}>
                  <FormattedMessage defaultMessage="No, use a different email" id="uxL7Ai" />
                </StyledLink>
              </div>
            </Container>
          )}
        </div>
      </React.Fragment>
    );
  }
}
