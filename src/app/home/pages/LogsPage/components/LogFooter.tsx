import React from 'react';
import { Button, CardFooter, Grid, GridItem } from '@patternfly/react-core';
import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { LogActions } from '../../../../logs/duck';
import { LogUnselected, ILogSource } from './LogsContainer';
import { IPlanLogSources } from '../../../../../client/resources/discovery';
import { DefaultRootState } from '../../../../../configureStore';

interface IProps {
  logSource: ILogSource;
  cluster: string;
  isFetchingLogs: boolean;
  report: any;
  requestDownloadLog: (logPath: any) => void;
  requestReport: (planName: string) => void;
  planName: string;
}

const LogFooter: FunctionComponent<IProps> = ({
  logSource,
  cluster,
  report,
  isFetchingLogs,
  planName,
  requestDownloadLog,
  requestReport,
}) => {
  const requestDownload = () => {
    requestDownloadLog(
      report[cluster][logSource.podIndex].containers[logSource.containerIndex].log
    );
  };

  return (
    <CardFooter style={{ height: '5%' }}>
      {isFetchingLogs ? null : (
        <Grid hasGutter>
          <GridItem>
            <Button
              onClick={requestDownload}
              isDisabled={!report || logSource.podIndex === LogUnselected}
              variant="primary"
            >
              Download Selected
            </Button>
          </GridItem>
          <GridItem>
            <Button onClick={() => requestReport(planName)} variant="secondary">
              Refresh
            </Button>
          </GridItem>
        </Grid>
      )}
    </CardFooter>
  );
};

export default connect(
  (state: DefaultRootState) => ({
    report: state.logs.report,
    isFetchingLogs: state.logs.isFetchingLogs,
  }),
  (dispatch) => ({
    requestDownloadLog: (logPath: string) => dispatch(LogActions.requestDownloadLog(logPath)),
    requestReport: (planName: string) => dispatch(LogActions.reportFetchRequest(planName)),
  })
)(LogFooter);
