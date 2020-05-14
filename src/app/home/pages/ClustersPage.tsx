import React from 'react';
import { connect } from 'react-redux';
import { Card, PageSection, DataList } from '@patternfly/react-core';
import { DataListItems } from '../HomeComponent';
import { ClusterContext } from '../duck/context';
import clusterSelectors from '../../cluster/duck/selectors';
import { ClusterActions } from '../../cluster/duck/actions';
import { createAddEditStatus, AddEditState, AddEditMode } from '../../common/add_edit_state';
import ClusterDataListItem from '../components/DataList/Clusters/ClusterDataListItem';

interface IClustersPageBaseProps {
  clusterList: any[]; // TODO type?
  clusterAssociatedPlans: { [clusterName: string]: any }; // TODO types? MigPlan? lift to a common import
  migMeta: { [key: string]: any }; // TODO types? lift to a common import
  watchClusterAddEditStatus: (id: string) => void;
  removeCluster: (id: string) => void;
}

// TODO replace the Card > DataList > DataListItem with a table? Talk to Vince.
const ClustersPageBase: React.FunctionComponent<IClustersPageBaseProps> = ({
  clusterList,
  clusterAssociatedPlans,
  migMeta,
  watchClusterAddEditStatus,
  removeCluster,
}: IClustersPageBaseProps) => (
  <PageSection>
    <Card>
      <DataList aria-label="data-list-main-container">
        <ClusterContext.Provider value={{ watchClusterAddEditStatus }}>
          <ClusterDataListItem
            dataList={clusterList}
            id={DataListItems.ClusterList}
            associatedPlans={clusterAssociatedPlans}
            migMeta={migMeta}
            removeCluster={removeCluster}
            isExpanded
            clusterCount={clusterList.length}
          />
        </ClusterContext.Provider>
      </DataList>
    </Card>
  </PageSection>
);

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
