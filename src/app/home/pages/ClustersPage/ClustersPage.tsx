import React from 'react';
import { connect } from 'react-redux';
import {
  Card,
  PageSection,
  TextContent,
  Text,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  Title,
  Bullseye,
  Spinner,
  Button,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ClusterContext } from '../../duck/context';
import clusterSelectors from '../../../cluster/duck/selectors';
import { ClusterActions } from '../../../cluster/duck/actions';
import { createAddEditStatus, AddEditState, AddEditMode } from '../../../common/add_edit_state';
import ClustersTable from './components/ClustersTable';
import AddEditClusterModal from './components/AddEditClusterModal';
import { useOpenModal } from '../../duck';
import { ICluster } from '../../../cluster/duck/types';
import { IMigMeta } from '../../../auth/duck/types';
import { IPlanCountByResourceName } from '../../../common/duck/types';
import AddCircleOIcon from '@patternfly/react-icons/dist/js/icons/add-circle-o-icon';
import { DefaultRootState } from '../../../../configureStore';

interface IClustersPageBaseProps {
  clusterList: ICluster[];
  clusterAssociatedPlans: IPlanCountByResourceName;
  migMeta: IMigMeta;
  watchClusterAddEditStatus: (clusterName: string) => void;
  removeCluster: (clusterName: string) => void;
  isFetchingInitialClusters: boolean;
  setCurrentCluster: (currentCluster: ICluster) => void;
  currentCluster: ICluster;
}

const ClustersPageBase: React.FunctionComponent<IClustersPageBaseProps> = ({
  clusterList,
  clusterAssociatedPlans,
  migMeta,
  watchClusterAddEditStatus,
  removeCluster,
  isFetchingInitialClusters,
  setCurrentCluster,
  currentCluster,
}: IClustersPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);

  const renderEmptyState = () => (
    <EmptyState variant="full" className={spacing.my_2xl}>
      <EmptyStateIcon icon={AddCircleOIcon} />
      <Title headingLevel="h3" size="lg">
        Add source and target clusters for the migration
      </Title>
      <Button onClick={toggleAddEditModal} variant="primary">
        Add cluster
      </Button>
    </EmptyState>
  );

  return (
    <>
      <PageSection variant="light">
        <TextContent>
          <Text component="h1" className={spacing.mbAuto}>
            Clusters
          </Text>
        </TextContent>
      </PageSection>
      <PageSection>
        {isFetchingInitialClusters ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              <ClusterContext.Provider value={{ watchClusterAddEditStatus }}>
                {!clusterList ? null : clusterList.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <ClustersTable
                    clusterList={clusterList}
                    associatedPlans={clusterAssociatedPlans}
                    migMeta={migMeta}
                    removeCluster={removeCluster}
                    toggleAddEditModal={toggleAddEditModal}
                    setCurrentCluster={setCurrentCluster}
                    currentCluster={currentCluster}
                  />
                )}
                <AddEditClusterModal
                  isOpen={isAddEditModalOpen}
                  onHandleClose={toggleAddEditModal}
                />
              </ClusterContext.Provider>
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

const mapStateToProps = (state: DefaultRootState) => ({
  clusterList: clusterSelectors.getAllClusters(state),
  clusterAssociatedPlans: clusterSelectors.getAssociatedPlans(state),
  isFetchingInitialClusters: state.cluster.isFetchingInitialClusters,
  migMeta: state.auth.migMeta,
  currentCluster: state.cluster.currentCluster,
});

const mapDispatchToProps = (dispatch) => ({
  watchClusterAddEditStatus: (clusterName: string) => {
    // Push the add edit status into watching state, and start watching
    dispatch(
      ClusterActions.setClusterAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      )
    );
    dispatch(ClusterActions.watchClusterAddEditStatus(clusterName));
  },
  removeCluster: (clusterName: string) =>
    dispatch(ClusterActions.removeClusterRequest(clusterName)),
  setCurrentCluster: (currentCluster: ICluster) =>
    dispatch(ClusterActions.setCurrentCluster(currentCluster)),
});

export const ClustersPage = connect(mapStateToProps, mapDispatchToProps)(ClustersPageBase);
