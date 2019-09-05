import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Flex, Box } from '@rebass/emotion';
import {
  Page,
  PageSection,
} from '@patternfly/react-core';
import HeaderComponent from '../common/components/HeaderComponent';
import { Breadcrumb, BreadcrumbItem, BreadcrumbHeading } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import LogsContainer from './components/LogsContainer';
import { LogActions } from './duck';
import { PollingContext } from '../home/duck/context';


interface IProps {
  match: any;
  refreshLogs: (planName) => void;
}

const LogsComponent: React.FunctionComponent<IProps> = ({ match, refreshLogs }) => {
  const pollingContext = useContext(PollingContext);
  const onReturn = () => {
    pollingContext.startAllDefaultPolling();
  };

  const stopPolling = () => {
    pollingContext.stopAllPolling();
  };

  return (
    <Page header={HeaderComponent}>
      <PageSection>
        <Flex justifyContent="center">
          <Box flex="0 0 100%">
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to="/" onClick={() => onReturn()}>Home</Link>
              </BreadcrumbItem>
              <BreadcrumbItem to="#" isActive>{match.params.planId} Logs</BreadcrumbItem>
            </Breadcrumb>
          </Box>
        </Flex>
      </PageSection>
      <PageSection>
        <LogsContainer planName={match.params.planId} refreshLogs={refreshLogs} stopPolling={stopPolling}/>
      </PageSection>
    </Page>
  );
};

export default connect(
  null,
  dispatch => ({
    refreshLogs: (planName) => dispatch(LogActions.logsFetchRequest(planName)),
  })
)(LogsComponent);
