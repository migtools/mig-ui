import React, { Component } from 'react';
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
import { PollingActions } from '../common/duck/actions';
import ClusterDataListItem from './components/DataList/Clusters/ClusterDataListItem';
import StorageDataListItem from './components/DataList/Storage/StorageDataListItem';
import PlanDataListItem from './components/DataList/Plans/PlanDataListItem';
import { DataList } from '@patternfly/react-core';
import {
  PlanContext,
  ClusterContext,
  StorageContext,
} from './duck/context';
import { StatusPollingInterval } from '../common/duck/sagas';
import { createAddEditStatus, AddEditState, AddEditMode } from '../common/add_edit_state';
import { DataListItems } from './HomeComponent';


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
  planUpdateRequest: (planValues) => void;
  runStage: (plan) => void;
  updateStageProgress: (plan, progress) => void;
  stagingSuccess: (plan) => void;
  isStaging?: boolean;
  isMigrating?: boolean;
  isClosing?: boolean;
  migMeta: string;
  updatePlans: (updatedPlans) => void;
  startDataListPolling: (params) => void;
  stopDataListPolling: () => void;
  planCloseAndDeleteRequest: (string) => void;
  watchClusterAddEditStatus: (string) => void;
  watchStorageAddEditStatus: (string) => void;
  handleExpandDetails: (string) => void;
  expanded: {
    [s: string]: boolean;
  };
}

interface IState {
  plansDisabled: boolean;
  modalType: string;
}

export class DetailViewComponent extends Component<IProps, IState> {
  state = {
    plansDisabled: true,
    modalType: '',
  };

  componentDidMount = () => {
    const { allClusters, allStorage } = this.props;
    if (allClusters.length > 1 && allStorage.length > 0) {
      this.setState({ plansDisabled: false });
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      (prevProps.allClusters !== this.props.allClusters ||
        prevProps.allStorage !== this.props.allStorage) &&
      (this.props.allClusters.length > 1 && this.props.allStorage.length > 0)
    ) {
      this.setState({ plansDisabled: false });
    }
  }

  handleRemoveItem = (type, id) => {
    switch (type) {
      case 'cluster':
        this.props.removeCluster(id);
        break;
      case 'storage':
        this.props.removeStorage(id);
        break;
      case 'plan':
        this.props.removePlan(id);
        break;
    }
  };

  handlePlanSubmit = planWizardValues => {
    this.props.planUpdateRequest(planWizardValues);
  };

  handleStageTriggered = plan => {
    this.props.runStage(plan);
  };

  handleDeletePlan = plan => {
    this.props.planCloseAndDeleteRequest(plan.MigPlan.metadata.name);
  };

  handlePlanPoll = response => {
    if (response && response.isSuccessful === true) {
      this.props.updatePlans(response.updatedPlans);
      return true;
    }

    return false;
  };

  handleStartPolling = () => {
    const params = {
      asyncFetch: planOperations.fetchPlansGenerator,
      callback: this.handlePlanPoll,
      delay: StatusPollingInterval,
      retryOnFailure: true,
      retryAfter: 5,
      stopAfterRetries: 2,
    };
    this.props.startDataListPolling(params);
  };

  render() {
    const {
      allStorage,
      allClusters,
      plansWithStatus,
      clusterAssociatedPlans,
      storageAssociatedPlans,
      watchClusterAddEditStatus,
      watchStorageAddEditStatus,
      stopDataListPolling,
      removeCluster,
      removeStorage,
      migMeta,
      isMigrating,
      isStaging,
      expanded,
      handleExpandDetails,
      isClosing,
    } = this.props;

    const isAddPlanDisabled = allClusters.length < 2 || allStorage.length < 1;
    const { handleStageTriggered, handleDeletePlan } = this;
    return (
      <React.Fragment>
        <DataList aria-label="data-list-main-container">
          <ClusterContext.Provider value={{ watchClusterAddEditStatus }}>
            <ClusterDataListItem
              dataList={allClusters}
              id={DataListItems.ClusterList}
              associatedPlans={clusterAssociatedPlans}
              isLoading={isMigrating || isStaging}
              migMeta={migMeta}
              removeCluster={removeCluster}
              isExpanded={expanded[DataListItems.ClusterList]}
              toggleExpanded={handleExpandDetails}
            />
          </ClusterContext.Provider>
          <StorageContext.Provider value={{ watchStorageAddEditStatus }}>
            <StorageDataListItem
              dataList={allStorage}
              id={DataListItems.StorageList}
              associatedPlans={storageAssociatedPlans}
              isLoading={isMigrating || isStaging || isClosing}
              removeStorage={removeStorage}
              isExpanded={expanded[DataListItems.StorageList]}
              toggleExpanded={handleExpandDetails}
            />
          </StorageContext.Provider>
          <PlanContext.Provider value={{ handleStageTriggered, handleDeletePlan }}>
            <PlanDataListItem
              id={DataListItems.PlanList}
              planList={plansWithStatus}
              clusterList={allClusters}
              storageList={allStorage}
              onPlanSubmit={this.handlePlanSubmit}
              plansDisabled={isAddPlanDisabled}
              isLoading={isMigrating || isStaging}
              onStartPolling={this.handleStartPolling}
              onStopPolling={stopDataListPolling}
              isExpanded={expanded[DataListItems.PlanList]}
              isClosing={isClosing}
              toggleExpanded={handleExpandDetails}
            />
          </PlanContext.Provider>
        </DataList>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const allClusters = clusterSelectors.getAllClusters(state);
  const allStorage = storageSelectors.getAllStorage(state);
  const plansWithStatus = planSelectors.getPlansWithStatus(state);
  const clusterAssociatedPlans = clusterSelectors.getAssociatedPlans(state);
  const storageAssociatedPlans = storageSelectors.getAssociatedPlans(state);

  const { migStorageList } = state.storage;
  const { isMigrating, isStaging, isClosing } = state.plan;
  const migMeta = state.migMeta;
  return {
    allClusters,
    allStorage,
    migStorageList,
    plansWithStatus,
    clusterAssociatedPlans,
    storageAssociatedPlans,
    isMigrating,
    isStaging,
    isClosing,
    migMeta,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    removeCluster: id => dispatch(clusterOperations.removeCluster(id)),
    removeStorage: id => dispatch(storageOperations.removeStorage(id)),
    planUpdateRequest: planValues => dispatch(PlanActions.planUpdateRequest(planValues)),
    runStage: plan => dispatch(planOperations.runStage(plan)),
    updateStageProgress: (plan, progress) =>
      dispatch(PlanActions.updateStageProgress(plan.planName, progress)),
    stagingSuccess: plan => dispatch(PlanActions.stagingSuccess(plan.planName)),
    updatePlans: updatedPlans => dispatch(PlanActions.updatePlans(updatedPlans)),
    startDataListPolling: params => dispatch(PollingActions.startDataListPolling(params)),
    stopDataListPolling: () => dispatch(PollingActions.stopDataListPolling()),
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
