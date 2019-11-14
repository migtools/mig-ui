import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import clusterOperations from '../cluster/duck/operations';
import storageOperations from '../storage/duck/operations';
import planOperations from '../plan/duck/operations';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';
import planSelectors from '../plan/duck/selectors';
import { PlanActions } from '../plan/duck/actions';
import { ClusterActions } from '../cluster/duck/actions';
import { StorageActions as StorageActions } from '../storage/duck/actions';
import ClusterDataListItem from './components/DataList/Clusters/ClusterDataListItem';
import StorageDataListItem from './components/DataList/Storage/StorageDataListItem';
import PlanDataListItem from './components/DataList/Plans/PlanDataListItem';
import { DataList } from '@patternfly/react-core';
import {
  PlanContext,
  ClusterContext,
  StorageContext,
} from './duck/context';
import { createAddEditStatus, AddEditState, AddEditMode, isAddEditButtonDisabled } from '../common/add_edit_state';
import { StatusPollingInterval } from '../common/duck/sagas';
import { PollingActions } from '../common/duck/actions';
import { LogActions } from '../logs/duck';


interface IProps {
  allClusters: any[];
  allStorage: any[];
  plansWithStatus: any[];
  clusterAssociatedPlans: any;
  storageAssociatedPlans: any;
  migStorageList: any[];
  removeStorage: (id) => void;
  removePlan: (id) => void;
  removeCluster: (id) => void;
  runStage: (plan) => void;
  runMigration: (plan, disableQuiesce) => void;
  updateStageProgress: (plan, progress) => void;
  stagingSuccess: (plan) => void;
  migMeta: string;
  updatePlans: (updatedPlans) => void;
  planCloseAndDeleteRequest: (string) => void;
  watchClusterAddEditStatus: (string) => void;
  watchStorageAddEditStatus: (string) => void;
  handleExpandDetails: (string) => void;
  expanded: {
    [s: string]: boolean;
  };
}

enum DataListItems {
  ClusterList = 'clusterList',
  StorageList = 'storageList',
  PlanList = 'planList',
}

const DetailViewComponent: React.FunctionComponent<IProps> = (props) => {
  const {
    allClusters,
    allStorage,
    removeStorage,
    removePlan,
    removeCluster,
    runStage,
    runMigration,
    planCloseAndDeleteRequest,
    plansWithStatus,
    clusterAssociatedPlans,
    storageAssociatedPlans,
    watchClusterAddEditStatus,
    watchStorageAddEditStatus,
    migMeta,
    handleExpandDetails,
    expanded
  } = props;

  const [isAddPlanDisabled, setAddPlanDisabled] = useState(true);



  useEffect(() => {
    if (allClusters.length > 1 && allStorage.length > 0) {
      setAddPlanDisabled(false);
    } else {
      setAddPlanDisabled(true);
    }
  }, [allClusters, allStorage]);



  const handleStageTriggered = plan => {
    runStage(plan);
  };
  const handleRunMigration = (plan, disableQuiesce) => {
    runMigration(plan, disableQuiesce);
  };

  const handleDeletePlan = plan => {
    planCloseAndDeleteRequest(plan.MigPlan.metadata.name);
  };


  return (
    <React.Fragment>
      <DataList aria-label="data-list-main-container">
        <ClusterContext.Provider value={{ watchClusterAddEditStatus }}>
          <ClusterDataListItem
            dataList={allClusters}
            id={DataListItems.ClusterList}
            associatedPlans={clusterAssociatedPlans}
            migMeta={migMeta}
            removeCluster={removeCluster}
            isExpanded={expanded[DataListItems.ClusterList]}
            toggleExpanded={handleExpandDetails}
            clusterCount={allClusters.length}
          />
        </ClusterContext.Provider>
        <StorageContext.Provider value={{ watchStorageAddEditStatus }}>
          <StorageDataListItem
            dataList={allStorage}
            id={DataListItems.StorageList}
            associatedPlans={storageAssociatedPlans}
            removeStorage={removeStorage}
            isExpanded={expanded[DataListItems.StorageList]}
            toggleExpanded={handleExpandDetails}
            storageCount={allStorage.length}
          />
        </StorageContext.Provider>
        <PlanContext.Provider value={{
          handleStageTriggered,
          handleDeletePlan,
          handleRunMigration
        }}>
          <PlanDataListItem
            id={DataListItems.PlanList}
            planList={plansWithStatus}
            clusterList={allClusters}
            storageList={allStorage}
            plansDisabled={isAddPlanDisabled}
            isExpanded={expanded[DataListItems.PlanList]}
            toggleExpanded={handleExpandDetails}
            planCount={plansWithStatus.length}
          />
        </PlanContext.Provider>
      </DataList>
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  const allClusters = clusterSelectors.getAllClusters(state);
  const allStorage = storageSelectors.getAllStorage(state);
  const plansWithStatus = planSelectors.getPlansWithStatus(state);
  const clusterAssociatedPlans = clusterSelectors.getAssociatedPlans(state);
  const storageAssociatedPlans = storageSelectors.getAssociatedPlans(state);

  const { migStorageList } = state.storage;
  const migMeta = state.migMeta;
  return {
    allClusters,
    allStorage,
    migStorageList,
    plansWithStatus,
    clusterAssociatedPlans,
    storageAssociatedPlans,
    migMeta,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    removeCluster: id => dispatch(clusterOperations.removeCluster(id)),
    removeStorage: id => dispatch(storageOperations.removeStorage(id)),
    runStage: plan => dispatch(planOperations.runStage(plan)),
    runMigration: (plan, disableQuiesce) => dispatch(planOperations.runMigration(plan, disableQuiesce)),
    updateStageProgress: (plan, progress) =>
      dispatch(PlanActions.updateStageProgress(plan.planName, progress)),
    stagingSuccess: plan => dispatch(PlanActions.stagingSuccess(plan.planName)),
    updatePlans: updatedPlans => dispatch(PlanActions.updatePlans(updatedPlans)),
    planCloseAndDeleteRequest: planName => dispatch(PlanActions.planCloseAndDeleteRequest(planName)),
    watchClusterAddEditStatus: (clusterName) => {
      // Push the add edit status into watching state, and start watching
      dispatch(ClusterActions.setClusterAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      ));
      dispatch(ClusterActions.watchClusterAddEditStatus(clusterName));
    },
    watchStorageAddEditStatus: (storageName) => {
      // Push the add edit status into watching state, and start watching
      dispatch(StorageActions.setStorageAddEditStatus(
        createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
      ));
      dispatch(StorageActions.watchStorageAddEditStatus(storageName));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailViewComponent);
