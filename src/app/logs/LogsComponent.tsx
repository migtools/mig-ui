import React from 'react';
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

interface IProps {
  match: any;
}

const LogsComponent: React.FunctionComponent<IProps> = ({ match }) => {
  return (
    <Page header={HeaderComponent}>
      <PageSection>
        <Flex justifyContent="center">
          <Box flex="0 0 100%">
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to="/">Home</Link>
              </BreadcrumbItem>
              <BreadcrumbItem to="#" isActive>{match.params.planId} Logs</BreadcrumbItem>
            </Breadcrumb>
          </Box>
        </Flex>
      </PageSection>
      <PageSection>
        <LogsContainer planName={match.params.planId} />
      </PageSection>
    </Page>
  );
};

export default LogsComponent;
