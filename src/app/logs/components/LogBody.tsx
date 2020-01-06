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
import { connect } from 'react-redux';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import { IPlanLogSources } from '../../../client/resources/convension';
import { FunctionComponent } from 'react';
import { LogActions } from '../duck';

interface IProps {
  isFetchingLogs: boolean;
  report: IPlanLogSources;
  log: string;
  requestDownloadAll: (report) => void;
}

const LogBody: FunctionComponent<IProps> = ({
  isFetchingLogs,
  log,
  report,
  requestDownloadAll,
}) => {
  return (
    <CardBody style={{ minHeight: `${window.innerHeight * 0.6}px`, textAlign: 'center' }}>
      <Bullseye>
        {isFetchingLogs ? (
          <EmptyState variant="small">
            <div className="pf-c-empty-state__icon">
              <Spinner size="xl" />
            </div>
            <Title headingLevel="h2" size="xl">
              Loading...
            </Title>
          </EmptyState>)
          : log.length > 0 ? <LogItem log={log} />
            :
            <Box flex="1" m="auto">
              <Text fontSize={[2, 3, 4]}>Select pod to display logs</Text>
              <Text fontSize={[2, 3, 4]}>or</Text>
              <Button
                onClick={(_) => requestDownloadAll(report)}
                variant="primary"
                disabled={!report}
              >
                Download Logs
              </Button>
            </Box>}
      </Bullseye>
    </CardBody>);
};

export default connect(
  state => ({
    log: state.logs.log,
    report: state.logs.report,
    isFetchingLogs: state.logs.isFetchingLogs,
  }),
  dispatch => ({
    requestDownloadAll: (report) => dispatch(LogActions.requestDownloadAll(report))
  })
)(LogBody);
