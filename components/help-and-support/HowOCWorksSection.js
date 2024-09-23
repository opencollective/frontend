import React from 'react';
import { ArrowRight2 } from '@styled-icons/icomoon/ArrowRight2';
import { FormattedMessage } from 'react-intl';

import NextIllustration from '../collectives/HomeNextIllustration';
import { Box, Flex } from '../Grid';
import Link from '../Link';
import { SectionDescription, SectionTitle } from '../marketing/Text';
import { Span } from '../Text';

const HowOCWorks = () => (
  <Flex flexDirection="column" px={3} alignItems="center" my="58px">
    <Box textAlign="center" mb={3} width={['304px', '660px', 1, null, '1152px']}>
      <SectionTitle mb={3}>
        <FormattedMessage id="helpAndSupport.howOCWorks" defaultMessage="This is how Open Collective works" />
      </SectionTitle>
    </Box>
    <Box textAlign="center" width={['288px', '660px', '768px']}>
      <SectionDescription mb="24px">
        <FormattedMessage
          id="helpAndSupport.howOCWorks.description"
          defaultMessage="Open Collective enables all kinds of collaborative groups, initiatives, and projects to raise, manage, and spend money transparently."
        />
      </SectionDescription>
      <Link href="/how-it-works">
        <Span color="ocBrandColors.600" fontSize="16px" lineHeight="24px">
          <FormattedMessage defaultMessage="How it works" id="howItWorks" />
        </Span>
        <Span ml="8px">
          <ArrowRight2 color="#1869F5" size="18" />
        </Span>
      </Link>
    </Box>
    <Box display={['none', 'block', null, null, 'none']} mt="16px">
      <NextIllustration
        src="/static/images/help-and-support/transparency-illustration.png"
        alt="How open collective illustration"
        width={660}
        height={390}
      />
    </Box>
    <Box display={['none', null, null, null, 'block']} mt="16px">
      <NextIllustration
        src="/static/images/help-and-support/transparency-illustration-lg.png"
        alt="How open collective illustration"
        width={862}
        height={441}
      />
    </Box>
    <Flex flexDirection={['column', null, 'row']} alignItems="center" my={['56px', null, '127px']}>
      <Box order={[null, 1]} display={[null, null, 'none']}>
        <SectionTitle mb={3}>
          <FormattedMessage id="helpAndSupport.getToKnowUs" defaultMessage="Get to know us!" />
        </SectionTitle>
      </Box>
      <Box mt="16px" order={[null, 3]} width={['216px', '320px']}>
        <NextIllustration
          src="/static/images/help-and-support/getToKnowUs-illustration.png"
          alt="How open collective illustration"
          width={320}
          height={300}
        />
      </Box>
      <Box
        textAlign={['center', null, 'left']}
        width={['288px', '660px', '417px']}
        order={[null, 2]}
        mr={['20px', null, '32px']}
      >
        <SectionTitle mb={3} display={['none', null, 'block']}>
          <FormattedMessage id="helpAndSupport.getToKnowUs" defaultMessage="Get to know us!" />
        </SectionTitle>
        <SectionDescription mb={['16px', '24px']}>
          <FormattedMessage
            id="helpAndSupport.getToKnowUs.description"
            defaultMessage="We know making the case up the chain is not always easy. For all you heroes inside companies, we put together some resources to help you succeed."
          />
        </SectionDescription>
        <Link href="/how-it-works">
          <Span color="ocBrandColors.600" fontSize="16px" lineHeight="24px">
            <FormattedMessage defaultMessage="Know more about us" id="knowMoreAboutUs" />
          </Span>
          <Span ml="8px">
            <ArrowRight2 color="#1869F5" size="18" />
          </Span>
        </Link>
      </Box>
    </Flex>
  </Flex>
);

export default HowOCWorks;
