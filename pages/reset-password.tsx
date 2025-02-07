import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { FormattedMessage, useIntl } from 'react-intl';

import { i18nGraphqlException } from '../lib/errors';
import { API_V2_CONTEXT, gql } from '../lib/graphql/helpers';
import useLoggedInUser from '../lib/hooks/useLoggedInUser';

import Avatar from '../components/Avatar';
import Body from '../components/Body';
import Container from '../components/Container';
import Header from '../components/Header';
import I18nFormatters, { getI18nLink } from '../components/I18nFormatters';
import Image from '../components/Image';
import LoadingGrid from '../components/LoadingGrid';
import MessageBox from '../components/MessageBox';
import { PasswordInput } from '../components/PasswordInput';
import { PasswordStrengthBar } from '../components/PasswordStrengthBar';
import StyledInput from '../components/StyledInput';
import StyledInputField from '../components/StyledInputField';
import { P } from '../components/Text';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const resetPasswordMutation = gql`
  mutation ResetPassword($password: String!) {
    setPassword(password: $password) {
      individual {
        id
      }
      token
    }
  }
`;

const resetPasswordAccountQuery = gql`
  query ResetPasswordAccount {
    loggedInAccount {
      id
      type
      slug
      name
      email
      imageUrl
    }
  }
`;

const ResetPasswordPage = ({ token }: { token: string }) => {
  const router = useRouter();
  const intl = useIntl();
  const graphqlContext = { ...API_V2_CONTEXT, headers: { Authorization: `Bearer ${token}` } };
  const { login, refetchLoggedInUser } = useLoggedInUser();
  const { data, loading } = useQuery(resetPasswordAccountQuery, { context: graphqlContext, skip: !token });
  const [resetPassword] = useMutation(resetPasswordMutation, { context: graphqlContext });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordScore, setPasswordScore] = useState(null);
  const [showError, setShowError] = useState(false);

  const submitResetPassword = async () => {
    if (passwordScore <= 1) {
      setPasswordError(
        <FormattedMessage
          defaultMessage="Password is too weak. Try to use more characters or use a password manager to generate a strong one."
          id="C2rcD0"
        />,
      );
      setShowError(true);
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await resetPassword({ variables: { password } });
      if (result.data.setPassword.token) {
        await login(result.data.setPassword.token);
      }
      await refetchLoggedInUser();
      await router.replace({ pathname: '/reset-password/completed' });
    } catch (error) {
      const errorMessage = i18nGraphqlException(intl, error);
      setPasswordError(errorMessage);
      setShowError(true);
      setPasswordLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Header
        menuItems={{ solutions: false, product: false, company: false, docs: false }}
        showSearch={false}
        showProfileAndChangelogMenu={false}
      />
      <Body>
        <div className="my-[4, 6] flex flex-col items-center">
          <Card className="w-full max-w-md px-4 py-5">
            <div className="flex justify-center">
              <Image
                alt="Open Collective Logo"
                src="/static/images/oc-logo-watercolor-256.png"
                height={64}
                width={64}
              />
            </div>

            <h1 className="mt-3 text-center text-2xl font-semibold">
              <FormattedMessage defaultMessage="Reset Password" id="xl27nc" />
            </h1>

            {loading ? (
              <div className="mt-6 mb-4 flex w-full justify-center">
                <LoadingGrid />
              </div>
            ) : (
              !data?.loggedInAccount && (
                <MessageBox type="error" my={4}>
                  {data?.error ? (
                    i18nGraphqlException(intl, data.error)
                  ) : (
                    <FormattedMessage
                      defaultMessage="Something went wrong while trying to reset your password. Please <TryAgainLink>try again</TryAgainLink> or <SupportLink>contact support</SupportLink> if the problem persists."
                      id="xbkUWS"
                      values={{
                        SupportLink: I18nFormatters.SupportLink,
                        TryAgainLink: getI18nLink({ href: '/signin' }),
                      }}
                    />
                  )}
                </MessageBox>
              )
            )}

            {data?.loggedInAccount && (
              <Container
                as="form"
                method="POST"
                noValidate
                data-cy="resetPassword-form"
                onSubmit={event => {
                  event.preventDefault();
                  submitResetPassword();
                }}
              >
                <div className="my-4 flex">
                  <Avatar collective={data.loggedInAccount} radius={40} mr={2} />
                  <div>
                    <P color="black.800" fontWeight="500" fontSize="14px" lineHeight="20px">
                      {data.loggedInAccount.name}
                    </P>
                    <P mt="2px" wordBreak="break-all" color="black.700" fontSize="13px">
                      {data.loggedInAccount.email}
                    </P>
                  </div>
                </div>

                <StyledInput
                  className="hidden"
                  id="email"
                  readOnly
                  autoComplete="email"
                  name="email"
                  value={data.loggedInAccount.email}
                  type="email"
                />

                {showError && passwordError && (
                  <MessageBox type="error" withIcon my={2}>
                    {passwordError}
                  </MessageBox>
                )}

                <StyledInputField
                  labelFontWeight="600"
                  labelFontSize="13px"
                  alignItems="left"
                  width="100%"
                  label={<FormattedMessage defaultMessage="New Password" id="Ev6SEF" />}
                  htmlFor="new-password"
                  my={2}
                  helpText={
                    <FormattedMessage
                      defaultMessage="Strong password recommended. Short or weak one restricted. <link>The strength of a password is a function of length, complexity, and unpredictability.</link>"
                      id="qaIW32"
                      values={{
                        link: getI18nLink({
                          href: 'https://en.wikipedia.org/wiki/Password_strength',
                          openInNewTab: true,
                        }),
                      }}
                    />
                  }
                >
                  <PasswordInput
                    id="new-password"
                    name="new-password"
                    autoFocus={true}
                    required={true}
                    onChange={({ target }) => {
                      setPassword(target.value);
                      setPasswordError(target.validationMessage);
                      setShowError(false);
                    }}
                    onKeyDown={e => {
                      if (e.key === ' ') {
                        e.preventDefault();
                      } else if (e.key === 'Enter') {
                        setPasswordError(e.target['validationMessage']);
                        setShowError(true);
                      }
                    }}
                    onBlur={() => setShowError(true)}
                    onInvalid={event => {
                      event.preventDefault();
                      setPasswordError(event.target['validationMessage']);
                    }}
                  />
                </StyledInputField>

                <PasswordStrengthBar alwaysShow password={password} onChangeScore={score => setPasswordScore(score)} />

                <div className="mb-6 mt-[26px] flex justify-center">
                  <Button disabled={!password} loading={passwordLoading} type="submit" size="default">
                    <FormattedMessage id="actions.continue" defaultMessage="Continue" />
                  </Button>
                </div>
              </Container>
            )}
          </Card>
        </div>
      </Body>
    </React.Fragment>
  );
};

ResetPasswordPage.getInitialProps = ({ query: { token } }) => {
  return { token };
};

// next.js export
// ts-unused-exports:disable-next-line
export default ResetPasswordPage;
