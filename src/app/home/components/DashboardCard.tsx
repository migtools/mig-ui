import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Card } from '@rebass/emotion';

const dynamicColor = props =>
  css`
    color: ${props.color};
  `;

export default styled(Card)`
  ${dynamicColor};
  width: 20em;
  flex= 1;
  margin: 10px;
  padding: 10px;
  text-align: center;
  border-radius: 5px;
  height: 10em;
  -webkit-box-shadow: 7px 7px 20px -4px rgba(0, 0, 0, 0.27);
  -moz-box-shadow: 7px 7px 20px -4px rgba(0, 0, 0, 0.27);
  box-shadow: 7px 7px 20px -4px rgba(0, 0, 0, 0.27);
  background: #ffffff;
`;
