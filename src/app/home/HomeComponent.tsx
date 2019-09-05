import React, { useEffect, useContext, useState } from 'react';
import { connect } from 'react-redux';
import {
  Card,
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
import { PollingContext } from '../home/duck/context';

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
export const DataItemsLength = 3;
export enum DataListItems {
  ClusterList = 'clusterList',
  StorageList = 'storageList',
  PlanList = 'planList',
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

  const pollingContext = useContext(PollingContext);
  useEffect(() => {
    pollingContext.startAllDefaultPolling();
  }, []);
  const [expandedStateObj, setExpandedStateObj] = useState(
    {
      'clusterList': false,
      'storageList': false,
      'planList': false,
    },
  );

  const handleExpand = (id: string) => {
    const expanded = !expandedStateObj[id];
    const newExpanded = Object.assign({}, expandedStateObj);
    Object.values(DataListItems).map(
      expandItem => newExpanded[expandItem] = false
    );
    newExpanded[id] = expanded;
    setExpandedStateObj(newExpanded);
  };

  return (
    <Page header={HeaderComponent}>
      <PageSection>
        <Grid gutter="md">
          <GridItem md={6} lg={4}>
            <DashboardCard
              type="clusters"
              title="Clusters"
              dataList={allClusters}
              isFetching={isFetchingClusters}
              isError={isClusterError}
              expandDetails={() => handleExpand(DataListItems.ClusterList)}

            />
          </GridItem>
          <GridItem md={6} lg={4}>
            <DashboardCard
              title="Replication Repositories"
              type="repositories"
              dataList={allStorage}
              isFetching={isFetchingStorage}
              isError={isStorageError}
              expandDetails={() => handleExpand(DataListItems.StorageList)}
            />
          </GridItem>
          <GridItem md={6} lg={4}>
            <DashboardCard
              type="plans"
              title="Migration Plans"
              planStatusCounts={planStatusCounts}
              dataList={allPlans}
              isFetching={isFetchingPlans}
              isError={isPlanError}
              expandDetails={() => handleExpand(DataListItems.PlanList)}
            />
          </GridItem>
          <GridItem span={12}>
            <Card>
              <DetailViewComponent expanded={expandedStateObj} handleExpandDetails={handleExpand} />
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
      {/* <PageSection>
        <TODO: footer content
      </PageSection> */}
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
