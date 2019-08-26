/** @jsx jsx */
import { jsx } from '@emotion/core';
import { TextArea } from '@patternfly/react-core';
import theme from '../../../theme';
import styled from '@emotion/styled';
import { Box } from '@rebass/emotion';

const LogItem = ({ log }) => {

  const StyledTextArea = styled(TextArea)`
    height: 100%;
    width: 100%;
    color: ${theme.colors.lightGray1};
    background: #222;
  `;

  const SyledBox = styled(Box)`
    height: 100%;
    width: 100%;
  `;
  return (
    <SyledBox>
      <StyledTextArea id="logArea" value={log} />
    </SyledBox>
  );
};

export default LogItem;
