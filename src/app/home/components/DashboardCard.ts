import styled from '@emotion/styled';
import { Global, css } from '@emotion/core';
import { Flex, Box, Card, Image, Heading, Text } from '@rebass/emotion';

const dynamicColor = props =>
  css`
    color: ${props.color};
  `;
export default styled(Card)`
  ${dynamicColor};
  text-align: center;
  border-radius: 5px;
  height: 10em;
  -webkit-box-shadow: 7px 7px 20px -4px rgba(0, 0, 0, 0.27);
  -moz-box-shadow: 7px 7px 20px -4px rgba(0, 0, 0, 0.27);
  box-shadow: 7px 7px 20px -4px rgba(0, 0, 0, 0.27);
  background: #ffffff;
`;
