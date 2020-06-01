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
  Button,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ClusterContext } from '../../duck/context';
import clusterSelectors from '../../../cluster/duck/selectors';
import { ClusterActions } from '../../../cluster/duck/actions';
import { createAddEditStatus, AddEditState, AddEditMode } from '../../../common/add_edit_state';
import ClustersTable from './components/ClustersTable';
import AddEditClusterModal from './components/AddEditClusterModal';
import { useOpenModal } from '../../duck/hooks';
import { ICluster, IClusterAssociatedPlans } from '../../../cluster/duck/types';
import { IMigMeta } from '../../../../mig_meta';
import { IReduxState } from '../../../../reducers';

interface IClustersPageBaseProps {
  clusterList: ICluster[];
  clusterAssociatedPlans: IClusterAssociatedPlans;
  migMeta: IMigMeta;
  watchClusterAddEditStatus: (clusterName: string) => void;
  removeCluster: (clusterName: string) => void;
}

const ClustersPageBase: React.FunctionComponent<IClustersPageBaseProps> = ({
  clusterList,
  clusterAssociatedPlans,
  migMeta,
  watchClusterAddEditStatus,
  removeCluster,
}: IClustersPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);

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
        <Card>
          <CardBody>
            <ClusterContext.Provider value={{ watchClusterAddEditStatus }}>
              {!clusterList ? null : clusterList.length === 0 ? (
                <EmptyState variant="full">
                  <EmptyStateIcon icon={AddCircleOIcon} />
                  <Title size="lg">Add source and target clusters for the migration</Title>
                  <Button onClick={toggleAddEditModal} variant="primary">
                    Add cluster
                  </Button>
                </EmptyState>
              ) : (
                <ClustersTable
                  clusterList={clusterList}
                  associatedPlans={clusterAssociatedPlans}
                  migMeta={migMeta}
                  removeCluster={removeCluster}
                  toggleAddEditModal={toggleAddEditModal}
                />
              )}
              <AddEditClusterModal isOpen={isAddEditModalOpen} onHandleClose={toggleAddEditModal} />
            </ClusterContext.Provider>
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
};

const mapStateToProps = (state: IReduxState) => ({
  clusterList: clusterSelectors.getAllClusters(state),
  clusterAssociatedPlans: clusterSelectors.getAssociatedPlans(state),
  migMeta: state.migMeta,
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
});

export const ClustersPage = connect(mapStateToProps, mapDispatchToProps)(ClustersPageBase);
