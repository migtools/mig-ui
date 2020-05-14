import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import clusterSagas from '../cluster/duck/sagas';
import storageSagas from '../storage/duck/sagas';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';
import planSelectors from '../plan/duck/selectors';
import { PlanActions } from '../plan/duck/actions';
import { ClusterActions } from '../cluster/duck/actions';
import { StorageActions } from '../storage/duck/actions';
import ClusterDataListItem from './components/DataList/Clusters/ClusterDataListItem';
import StorageDataListItem from './components/DataList/Storage/StorageDataListItem';
import PlanDataListItem from './components/DataList/Plans/PlanDataListItem';
import { DataList } from '@patternfly/react-core';
import { PlanContext, ClusterContext, StorageContext } from './duck/context';
import {
  createAddEditStatus,
  AddEditState,
  AddEditMode,
  isAddEditButtonDisabled,
} from '../common/add_edit_state';
import { IAddPlanDisabledObjModel } from './AddPlanDisabledObjModel';

interface IProps {
  clusterList: any[];
  storageList: any[];
  planList: any[];
  clusterAssociatedPlans: any;
  storageAssociatedPlans: any;
  migStorageList: any[];
  removeStorage: (id) => void;
  removePlan: (id) => void;
  removeCluster: (id) => void;
  runStageRequest: (plan) => void;
  runMigrationRequest: (plan, disableQuiesce) => void;
  updateStageProgress: (plan, progress) => void;
  stagingSuccess: (plan) => void;
  migMeta: string;
  updatePlans: (updatedPlans) => void;
  migrationCancelRequest: (migrationName: string) => void;
  planCloseAndDeleteRequest: (string) => void;
  watchClusterAddEditStatus: (string) => void;
  watchStorageAddEditStatus: (string) => void;
  expanded: {
    [s: string]: boolean;
  };
}

enum DataListItems {
  ClusterList = 'clusterList',
  StorageList = 'storageList',
  PlanList = 'planList',
}

// --- TODO ---
// The contents of this component need to be broken up into the ClustersPage, StoragesPage, and PlansPage
// components, each of which should be their own react-redux `connect` exports.
// Thanks to the already-separated PlanContext, ClusterContext and StorageContext, this should be pretty easy!

const DetailViewComponent: React.FunctionComponent<IProps> = (props) => {
  const {
    clusterList,
    storageList,
    removeStorage,
    removePlan,
    removeCluster,
    runStageRequest,
    runMigrationRequest,
    migrationCancelRequest,
    planCloseAndDeleteRequest,
    planList,
    clusterAssociatedPlans,
    storageAssociatedPlans,
    watchClusterAddEditStatus,
    watchStorageAddEditStatus,
    migMeta,
    expanded,
  } = props;

  const [addPlanDisabledObj, setAddPlanDisabledObj] = useState<
    IAddPlanDisabledObjModel | undefined
  >({
    isAddPlanDisabled: true,
    disabledText: '',
  });

  useEffect(() => {
    if (clusterList.length < 2) {
      setAddPlanDisabledObj({
        isAddPlanDisabled: true,
        disabledText: 'A minimum of 2 clusters is required to create a plan.',
      });
      return;
    } else if (storageList.length < 1) {
      setAddPlanDisabledObj({
        isAddPlanDisabled: true,
        disabledText: 'A minimum of 1 replication repository is required to create a plan.',
      });
      return;
    } else {
      setAddPlanDisabledObj({
        isAddPlanDisabled: false,
        disabledText: 'Click to create a plan.',
      });
    }
  }, [clusterList, storageList]);

  const handleStageTriggered = (plan) => {
    runStageRequest(plan);
  };
  const handleRunMigration = (plan, disableQuiesce) => {
    runMigrationRequest(plan, disableQuiesce);
  };

  const handleDeletePlan = (plan) => {
    planCloseAndDeleteRequest(plan.MigPlan.metadata.name);
  };

  const handleMigrationCancelRequest = (migrationName) => {
    migrationCancelRequest(migrationName);
  };

  return (
    <React.Fragment>
      <DataList aria-label="data-list-main-container">
        {expanded[DataListItems.PlanList] && (
          <PlanContext.Provider
            value={{
              handleStageTriggered,
              handleDeletePlan,
              handleRunMigration,
              handleMigrationCancelRequest,
              planList,
              clusterList,
              storageList,
            }}
          >
            <PlanDataListItem
              id={DataListItems.PlanList}
              planList={planList}
              clusterList={clusterList}
              storageList={storageList}
              addPlanDisabledObj={addPlanDisabledObj}
              isExpanded
              planCount={planList.length}
            />
          </PlanContext.Provider>
        )}
      </DataList>
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  const clusterList = clusterSelectors.getAllClusters(state);
  const storageList = storageSelectors.getAllStorage(state);
  const planList = planSelectors.getPlansWithStatus(state);
  const clusterAssociatedPlans = clusterSelectors.getAssociatedPlans(state);
  const storageAssociatedPlans = storageSelectors.getAssociatedPlans(state);

  const { migStorageList } = state.storage;
  const migMeta = state.migMeta;
  return {
    clusterList,
    storageList,
    migStorageList,
    planList,
    clusterAssociatedPlans,
    storageAssociatedPlans,
    migMeta,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    runStageRequest: (plan) => dispatch(PlanActions.runStageRequest(plan)),
    runMigrationRequest: (plan, disableQuiesce) =>
      dispatch(PlanActions.runMigrationRequest(plan, disableQuiesce)),
    removeCluster: (name) => dispatch(ClusterActions.removeClusterRequest(name)),
    removeStorage: (name) => dispatch(StorageActions.removeStorageRequest(name)),
    updateStageProgress: (plan, progress) =>
      dispatch(PlanActions.updateStageProgress(plan.planName, progress)),
    stagingSuccess: (plan) => dispatch(PlanActions.stagingSuccess(plan.planName)),
    updatePlans: (updatedPlans) => dispatch(PlanActions.updatePlans(updatedPlans)),
    planCloseAndDeleteRequest: (planName) =>
      dispatch(PlanActions.planCloseAndDeleteRequest(planName)),
    migrationCancelRequest: (migrationName) =>
      dispatch(PlanActions.migrationCancelRequest(migrationName)),

    watchClusterAddEditStatus: (clusterName) => {
      // Push the add edit status into watching state, and start watching
      dispatch(
        ClusterActions.setClusterAddEditStatus(
          createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
        )
      );
      dispatch(ClusterActions.watchClusterAddEditStatus(clusterName));
    },
    watchStorageAddEditStatus: (storageName) => {
      // Push the add edit status into watching state, and start watching
      dispatch(
        StorageActions.setStorageAddEditStatus(
          createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
        )
      );
      dispatch(StorageActions.watchStorageAddEditStatus(storageName));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailViewComponent);
