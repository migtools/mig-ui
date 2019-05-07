/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Card } from '@rebass/emotion';

const dynamicColor = props =>
  css`
    color: ${props.color};
  `;
export const AlertCard = styled(Card)`
  ${dynamicColor};
  text-align: center;
`;
