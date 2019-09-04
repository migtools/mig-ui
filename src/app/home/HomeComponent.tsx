import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Flex, Box, Text } from '@rebass/emotion';
import {
  Page,
  PageSection,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import HeaderComponent from '../common/components/HeaderComponent';
import DetailViewComponent from './DetailViewComponent';
import DashboardCard from './components/Card/DashboardCard';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';
import planSelectors from '../plan/duck/selectors';

interface IProps {
  allClusters: any[];
  allStorage: any[];
  allPlans: any[];
  isFetchingClusters: boolean;
  isFetchingStorage: boolean;
  isFetchingPlans: boolean;
  isClusterError: boolean;
  isStorageError: boolean;
  isPlanError: boolean;
  planStatusCounts: any;
}

const HomeComponent: React.FunctionComponent<IProps> = (props) => {
  const {
    allClusters,
    allStorage,
    allPlans,
    isFetchingClusters,
    isFetchingStorage,
    isFetchingPlans,
    isClusterError,
    isStorageError,
    isPlanError,
    planStatusCounts
  } = props;


  return (
    <Page header={HeaderComponent}>
      <PageSection>
        <Grid gutter="md">
          <GridItem span={4}>
            <DashboardCard
              type="clusters"
              title="Clusters"
              dataList={allClusters}
              isFetching={isFetchingClusters}
              isError={isClusterError}
            />
          </GridItem>
          <GridItem span={4}>
            <DashboardCard
              title="Replication Repositories"
              type="repositories"
              dataList={allStorage}
              isFetching={isFetchingStorage}
              isError={isStorageError}
            />
          </GridItem>
          <GridItem span={4}>
            <DashboardCard
              type="plans"
              title="Migration Plans"
              planStatusCounts={planStatusCounts}
              dataList={allPlans}
              isFetching={isFetchingPlans}
              isError={isPlanError}
            />
          </GridItem>
        </Grid>
      </PageSection>
      <PageSection>
        <Flex justifyContent="center">
          <Box flex="0 0 100%">
            <DetailViewComponent />
          </Box>
        </Flex>
      </PageSection>
      <PageSection>
        {/* <TODO: footer content */}
      </PageSection>
    </Page>
  );
};

export default connect(
  state => ({
    planStatusCounts: planSelectors.getCounts(state),
    allClusters: clusterSelectors.getAllClusters(state),
    allStorage: storageSelectors.getAllStorage(state),
    allPlans: planSelectors.getPlansWithStatus(state),
    loggingIn: state.auth.loggingIn,
    user: state.auth.user,
    isFetchingClusters: state.cluster.isFetching,
    isFetchingStorage: state.storage.isFetching,
    isFetchingPlans: state.plan.isFetching,
    isClusterError: state.cluster.isError,
    isStorageError: state.storage.isError,
    isPlanError: state.plan.isError,
  }),
  dispatch => ({
    onLogout: () => console.debug('TODO: IMPLEMENT: user logged out.'),
  })
)(HomeComponent);

