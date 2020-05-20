import React from 'react';
import { connect } from 'react-redux';
import { Card, PageSection } from '@patternfly/react-core';
import { DataListItems } from '../../HomeComponent';
import { ClusterContext } from '../../duck/context';
import clusterSelectors from '../../../cluster/duck/selectors';
import { ClusterActions } from '../../../cluster/duck/actions';
import { createAddEditStatus, AddEditState, AddEditMode } from '../../../common/add_edit_state';
import ClustersTable from './components/ClustersTable';
import AddEditClusterModal from './components/AddEditClusterModal';
import { useOpenModal } from '../../duck/hooks';

interface IClustersPageBaseProps {
  clusterList: any[]; // TODO type?
  clusterAssociatedPlans: { [clusterName: string]: any }; // TODO types? MigPlan? lift to a common import
  migMeta: { [key: string]: any }; // TODO types? lift to a common import
  watchClusterAddEditStatus: (id: string) => void;
  removeCluster: (id: string) => void;
}

// TODO replace the Card > DataList > DataListItem with a table.
// Use column headers and pagination from https://docs.google.com/presentation/d/1JU_Lw1A-gUO4gBRofZzi74aONcknYRHbqBl_xHxikYQ/edit#slide=id.g8482032e20_0_3
// Use icons from https://marvelapp.com/58cgihg/screen/61031650
const ClustersPageBase: React.FunctionComponent<IClustersPageBaseProps> = ({
  clusterList,
  clusterAssociatedPlans,
  migMeta,
  watchClusterAddEditStatus,
  removeCluster,
}: IClustersPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);
  return (
    <PageSection>
      <Card>
        <ClusterContext.Provider value={{ watchClusterAddEditStatus }}>
          <ClustersTable
            clusterList={clusterList}
            associatedPlans={clusterAssociatedPlans}
            migMeta={migMeta}
            removeCluster={removeCluster}
            isExpanded
            clusterCount={clusterList.length}
            toggleAddEditModal={toggleAddEditModal}
          />
          <AddEditClusterModal isOpen={isAddEditModalOpen} onHandleClose={toggleAddEditModal} />
        </ClusterContext.Provider>
      </Card>
    </PageSection>
  );
};

// TODO type for state arg? inherit from reducer?
const mapStateToProps = (state) => ({
  clusterList: clusterSelectors.getAllClusters(state),
  clusterAssociatedPlans: clusterSelectors.getAssociatedPlans(state),
  migMeta: state.migMeta,
});

// TODO types for dispatch arg and args of each action prop?
const mapDispatchToProps = (dispatch) => ({
  watchClusterAddEditStatus: (clusterName) => {
    // Push the add edit status into watching state, and start watching
    dispatch(
      ClusterActions.setClusterAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      )
    );
    dispatch(ClusterActions.watchClusterAddEditStatus(clusterName));
  },
  removeCluster: (name) => dispatch(ClusterActions.removeClusterRequest(name)),
});

export const ClustersPage = connect(mapStateToProps, mapDispatchToProps)(ClustersPageBase);
