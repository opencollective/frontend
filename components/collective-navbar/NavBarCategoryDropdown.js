import React from 'react';
import PropTypes from 'prop-types';
import { themeGet } from '@styled-system/theme-get';
import { useIntl } from 'react-intl';
import { Scrollchor } from 'react-scrollchor';
import styled, { css } from 'styled-components';

import { getSectionsCategoryDetails, SECTIONS_CATEGORY_ICON } from '../../lib/collective-sections';

import Container from '../Container';
import { Box, Flex } from '../Grid';
import Image from '../Image';
import Link from '../Link';
import { Dropdown, DropdownArrow, DropdownContent } from '../StyledDropdown';
import StyledLink from '../StyledLink';
import { Span } from '../Text';

import { NAVBAR_CATEGORIES } from './constants';

const CategoryContainer = styled(Container).attrs({ px: [1, 3, 0] })`
  display: block;
  width: 100%;

  span {
    font-size: 14px;
    line-height: 16px;
    text-decoration: none;
    white-space: nowrap;
    color: ${themeGet('colors.black.800')};
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 500;
    /** To compensate the space taken by the font-weight difference */
    &::after {
      display: block;
      content: attr(aria-label);
      font-weight: 700;
      height: 1px;
      color: transparent;
      overflow: hidden;
      visibility: hidden;
    }
  }

  &:focus,
  &:hover,
  &:focus span,
  &:hover span {
    text-decoration: none;
    font-weight: 700;
    outline: 0;
    color: ${themeGet('colors.black.800')};
  }

  &::after {
    content: '';
    display: block;
    width: 0%;
    height: 3px;
    background: ${themeGet('colors.primary.500')};
    transition: width 0.3s;
    float: center;
    opacity: 0;
  }

  ${props =>
    props.$isSelected &&
    css`
      @media (min-width: 64em) {
        &::after {
          width: 100%;
          margin: 0 auto;
          opacity: 1;
        }
      }
    `}

  @media (max-width: 64em) {
    border-top: 1px solid #e1e1e1;
    &::after {
      display: none;
    }
  }
`;

const MenuItem = styled('li')`
  display: flex;
  align-items: center;

  & > a {
    padding: 12px;

    @media (max-width: 40em) {
      padding-top: 4px;
    }
  }

  &,
  & > a {
    width: 100%;
    text-align: left;
    font-style: normal;
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;
    letter-spacing: -0.4px;
    outline: none;

    &:hover,
    &:focus {
      text-decoration: underline;
    }

    &:not(:hover) {
      color: #313233;
    }
  }
`;

const CategoryDropdown = styled(Dropdown)`
  @media (max-width: 64em) {
    ${DropdownArrow} {
      display: none !important;
    }
    ${DropdownContent} {
      display: block;
      position: relative;
      box-shadow: none;
      border: none;
      padding-left: 48px;
    }
  }
`;

const getLinkProps = (useAnchor, collective, category) => {
  const anchor = `#category-${category}`;
  if (useAnchor) {
    return { href: anchor };
  } else {
    return { as: Link, href: `/${collective.slug}${anchor}` };
  }
};

export const NavBarCategory = ({ category, collective }) => {
  const intl = useIntl();
  const categoryDetails = getSectionsCategoryDetails(intl, collective, category);
  return (
    <Flex>
      <Flex alignItems="center" minWidth={32} mr={2}>
        <Image width={32} height={32} alt="" src={categoryDetails.img || SECTIONS_CATEGORY_ICON.CONTRIBUTE} />
      </Flex>
      <Flex alignItems="center">
        <Span
          textTransform="uppercase"
          fontSize="14px"
          fontWeight="500"
          color="black.800"
          letterSpacing="0.02em"
          aria-label={categoryDetails.title}
        >
          {categoryDetails.title}
        </Span>
      </Flex>
    </Flex>
  );
};

NavBarCategory.propTypes = {
  category: PropTypes.oneOf(Object.values(NAVBAR_CATEGORIES)).isRequired,
  collective: PropTypes.object.isRequired,
};

const NavBarScrollContainer = ({ useAnchor, category, children }) =>
  useAnchor ? <Scrollchor to={`#category-${category}`}>{children}</Scrollchor> : children;

NavBarScrollContainer.propTypes = {
  category: PropTypes.oneOf(Object.values(NAVBAR_CATEGORIES)).isRequired,
  useAnchor: PropTypes.bool,
  children: PropTypes.node,
};

const NavBarCategoryDropdown = ({ useAnchor, collective, category, isSelected, links }) => {
  const displayedLinks = links.filter(link => !link.hide);

  return (
    <CategoryDropdown trigger="hover" tabIndex="-1">
      <NavBarScrollContainer category={category} useAnchor={useAnchor}>
        <CategoryContainer
          mr={[0, null, 3]}
          $isSelected={isSelected}
          {...getLinkProps(useAnchor, collective, category)}
          onClick={e => {
            // Remove focus to make sure dropdown gets closed
            if (document.activeElement?.contains(e.target)) {
              document.activeElement.blur();
            }
          }}
        >
          <Flex pt="15px" pb="14px" px={[3, 1, 3, 1]}>
            <NavBarCategory category={category} collective={collective} />
          </Flex>
        </CategoryContainer>
      </NavBarScrollContainer>
      {displayedLinks.length > 0 && (
        <React.Fragment>
          <DropdownArrow />
          <DropdownContent>
            <Box as="ul" p={0} m={0} minWidth={184}>
              {displayedLinks.map(({ route, title }) => (
                <MenuItem key={route}>
                  <StyledLink as={Link} href={route}>
                    {title}
                  </StyledLink>
                </MenuItem>
              ))}
            </Box>
          </DropdownContent>
        </React.Fragment>
      )}
    </CategoryDropdown>
  );
};

NavBarCategoryDropdown.propTypes = {
  category: PropTypes.oneOf(Object.values(NAVBAR_CATEGORIES)).isRequired,
  collective: PropTypes.shape({
    slug: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool,
  useAnchor: PropTypes.bool,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      route: PropTypes.string,
      title: PropTypes.node,
      hide: PropTypes.bool,
    }),
  ),
};

export default NavBarCategoryDropdown;
