/** @jsx jsx */
import { jsx } from '@emotion/core';
import theme from '../../../theme';
import { Box, Flex, Text } from '@rebass/emotion';
import { css } from '@emotion/core';
import {
  Bullseye,
  Button,
  CardBody,
  EmptyState,
  Title
} from '@patternfly/react-core';
import LogItem from './LogItem';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
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
        <Bullseye>
          <EmptyState variant="small">
            <div className="pf-c-empty-state__icon">
              <Spinner size="xl" />
            </div>
            <Title headingLevel="h2" size="xl">
              Loading...
            </Title>
          </EmptyState>
        </Bullseye>)
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
