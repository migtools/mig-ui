/** @jsx jsx */
import { jsx } from '@emotion/core';
import theme from '../../../theme';
import { Box, Flex, Text } from '@rebass/emotion';
import { css } from '@emotion/core';
import Loader from 'react-loader-spinner';
import { Button, CardBody } from '@patternfly/react-core';
import LogItem from './LogItem';
// const LogItem = lazy(() => import('./LogItem'));

const LogBody = ({
  isFetchingLogs,
  log,
  downloadAllHandle,
  ...props
}) => {
  return (
    <CardBody style={{ minHeight: `${window.innerHeight * 0.6}px`, textAlign: 'center'}}>
      <Flex css={css`height: 100%; text-align: center; align-items: center`}>
      {isFetchingLogs ? (
        <Box flex="1" m="auto">
          <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100"/>
          <Text fontSize={[2, 3, 4]}>Fetching logs</Text>
        </Box>)
        : log === '' ? (
          <Box flex="1" m="auto">
            <Text fontSize={[2, 3, 4]}>Select pod to display logs</Text>
            <Text fontSize={[2, 3, 4]}>or</Text>
            <Button onClick={downloadAllHandle} variant="primary">Download Logs</Button>
          </Box>)
          : (<LogItem log={log} />)}
      </Flex>
    </CardBody>);
};

export default LogBody;
