import React from 'react';
import {
  Bullseye,
  Button,
  CardBody,
  EmptyState,
  Title,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import LogItem from './LogItem';
import { connect } from 'react-redux';
import { Spinner } from '@patternfly/react-core';
import { FunctionComponent } from 'react';
import { LogActions } from '../../../../logs/duck';
import { IPlanLogSources } from '../../../../../client/resources/discovery';

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
          </EmptyState>
        ) : log.length > 0 ? (
          <LogItem log={log} />
        ) : (
          <Grid hasGutter>
            <GridItem>Select pod to display logs</GridItem>
            <GridItem>or</GridItem>
            <Button
              onClick={(_) => requestDownloadAll(report)}
              variant="primary"
              disabled={!report}
            >
              Download Logs
            </Button>
          </Grid>
        )}
      </Bullseye>
    </CardBody>
  );
};

export default connect(
  (state) => ({
    log: state.logs.log,
    report: state.logs.report,
    isFetchingLogs: state.logs.isFetchingLogs,
  }),
  (dispatch) => ({
    requestDownloadAll: (report) => dispatch(LogActions.requestDownloadAll(report)),
  })
)(LogBody);
