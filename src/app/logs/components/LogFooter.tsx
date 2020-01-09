/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Box, Flex, Text } from '@rebass/emotion';
import { css } from '@emotion/core';
import { Button, CardFooter } from '@patternfly/react-core';
import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { LogActions } from '../duck';
import { PodUnselected } from './LogsContainer';
import { IPlanLogSources } from '../../../client/resources/discovery';

interface IProps {
  podIndex: number;
  cluster: string;
  isFetchingLogs: boolean;
  report: IPlanLogSources;
  requestDownloadLog: (logPath) => void;
  requestReport: (planName) => void;
  planName: string;
}

const LogFooter: FunctionComponent<IProps> = ({
  podIndex,
  cluster,
  report,
  isFetchingLogs,
  planName,
  requestDownloadLog,
  requestReport,
}) => {

  const requestDownload = (_) => {
    requestDownloadLog(report[cluster][podIndex].log);
  };

  return (<CardFooter style={{ height: '5%' }}>
    {isFetchingLogs ? null : (
      <Flex>
        <Box flex="0" mx="1em">
          <Button
            onClick={requestDownload}
            isDisabled={!report || podIndex === PodUnselected}
            variant="primary"
          >
            Download Selected
          </Button>
        </Box>
        <Box flex="0" mx="1em">
          <Button onClick={() => requestReport(planName)} variant="secondary">Refresh</Button>
        </Box>
      </Flex>
    )}
  </CardFooter>);
};

export default connect(
  state => ({
    report: state.logs.report,
    isFetchingLogs: state.logs.isFetchingLogs,
  }),
  dispatch => ({
    requestDownloadLog: (logPath) => dispatch(LogActions.requestDownloadLog(logPath)),
    requestReport: (planName) => dispatch(LogActions.reportFetchRequest(planName)),
  }),
)(LogFooter);
