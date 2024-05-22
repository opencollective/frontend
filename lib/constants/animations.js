import { css, keyframes } from 'styled-components';

// library

// ts-unused-exports:disable-next-line
export const rotate = keyframes`
  0%    { transform: rotate(0deg); }
  100%  { transform: rotate(360deg); }
`;

// ts-unused-exports:disable-next-line
export const fadeIn = keyframes`
  0%    { opacity: 0; }
  100%  { opacity: 1; }
`;

export const rotateMixin = css`
  animation: ${rotate} 0.8s infinite linear;
`;
