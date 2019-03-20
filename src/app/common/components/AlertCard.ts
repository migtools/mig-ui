import styled from '@emotion/styled';
import { Global, css } from '@emotion/core';
import { Flex, Box, Card, Image, Heading, Text } from '@rebass/emotion';

const dynamicColor = props =>
  css`
    color: ${props.color};
  `;
export const AlertCard = styled(Card)`
  ${dynamicColor};
`;
