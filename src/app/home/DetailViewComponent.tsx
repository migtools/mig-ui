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
import { startDataListPolling, stopDataListPolling } from '../common/duck/actions';
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
  migMeta: string;
  updatePlans: (updatedPlans) => void;
  startDataListPolling: (params) => void;
  stopDataListPolling: () => void;
  triggerPlanDelete: (string) => void;
  watchClusterAddEditStatus: (string) => void;
  watchStorageAddEditStatus: (string) => void;
}

interface IState {
  plansDisabled: boolean;
  expanded: {
    [s: string]: boolean;
  };
  modalType: string;
}

const DataItemsLength = 3;
enum DataListItems {
  ClusterList = 'clusterList',
  StorageList = 'storageList',
  PlanList = 'planList',
}

class DetailViewComponent extends Component<IProps, IState> {
  state = {
    expanded: {
      'clusterList': false,
      'storageList': false,
      'planList': false,
    },
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

  handleExpand = (id: string) => {
    const expanded = !this.state.expanded[id];
    const newExpanded = Object.assign({}, this.state.expanded);
    Object.values(DataListItems).map(
      expandItem => newExpanded[expandItem] = false
    );
    newExpanded[id] = expanded;
    this.setState({ expanded: newExpanded });
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
    this.props.triggerPlanDelete(plan.MigPlan.metadata.name);
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
              isLoading={this.props.isMigrating || this.props.isStaging}
              migMeta={this.props.migMeta}
              removeCluster={this.props.removeCluster}
              isExpanded={this.state.expanded[DataListItems.ClusterList]}
              toggleExpanded={this.handleExpand}
            />
          </ClusterContext.Provider>
          <StorageContext.Provider value={{ watchStorageAddEditStatus }}>
            <StorageDataListItem
              dataList={allStorage}
              id={DataListItems.StorageList}
              associatedPlans={storageAssociatedPlans}
              isLoading={this.props.isMigrating || this.props.isStaging}
              removeStorage={this.props.removeStorage}
              isExpanded={this.state.expanded[DataListItems.StorageList]}
              toggleExpanded={this.handleExpand}
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
              isLoading={this.props.isMigrating || this.props.isStaging}
              onStartPolling={this.handleStartPolling}
              onStopPolling={this.props.stopDataListPolling}
              isExpanded={this.state.expanded[DataListItems.PlanList]}
              toggleExpanded={this.handleExpand}
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
  const { isMigrating, isStaging } = state.plan;
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
    startDataListPolling: params => dispatch(startDataListPolling(params)),
    stopDataListPolling: () => dispatch(stopDataListPolling()),
    triggerPlanDelete: planName => dispatch(PlanActions.planDeleteRequest(planName)),
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
