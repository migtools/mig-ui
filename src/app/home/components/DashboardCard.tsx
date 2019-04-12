import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Card } from '@rebass/emotion';
import theme from './../../../theme';
const dynamicColor = props =>
  css`
    color: ${props.color};
  `;

export default styled(Card)`
  ${dynamicColor};
  width: 20em;
  margin: 10px;
  padding: 10px;
  text-align: center;
  border-radius: 1px;
  height: 11em;
  background-color: #ffffff;
  -moz-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
  -webkit-box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
  box-shadow: 0 0.0625rem 0.125rem 0 rgba(3, 3, 3, 0.2);
  border-top: 1px solid ${theme.colors.navy}

`;
