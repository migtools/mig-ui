import React, { Component } from 'react';
import { connect } from 'react-redux';
import clusterOperations from '../cluster/duck/operations';
import storageOperations from '../storage/duck/operations';
import planOperations from '../plan/duck/operations';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';
import planSelectors from '../plan/duck/selectors';
import { Creators as PlanCreators } from '../plan/duck/actions';
import { startDataListPolling, stopDataListPolling } from '../common/duck/actions';
import ClusterDataListItem from './components/DataList/Clusters/ClusterDataListItem';
import StorageDataListItem from './components/DataList/Storage/StorageDataListItem';
import PlanDataListItem from './components/DataList/Plans/PlanDataListItem';
import { DataList } from '@patternfly/react-core';
import { PlanContext } from './duck/context';
import { StatusPollingInterval } from '../common/duck/sagas';

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
  putPlan: (planValues) => void;
  runStage: (plan) => void;
  updateStageProgress: (plan, progress) => void;
  stagingSuccess: (plan) => void;
  isStaging?: boolean;
  isMigrating?: boolean;
  migMeta: string;
  updatePlans: (updatedPlans) => void;
  startDataListPolling: (params) => void;
  stopDataListPolling: () => void;
}

interface IState {
  expanded: any[];
  plansDisabled: boolean;
  isOpen: boolean;
  isWizardOpen: boolean;
  modalType: string;
}

class DetailViewComponent extends Component<IProps, IState> {
  state = {
    expanded: [],
    plansDisabled: true,
    isOpen: false,
    isWizardOpen: false,
    modalType: '',
  };

  componentDidMount() {
    const { allClusters, allStorage } = this.props;
    if (allClusters.length > 1 && allStorage.length > 0) {
      this.setState({ plansDisabled: false });
    }
  }
  componentDidUpdate(prevProps, prevState) {
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

  handleWizardToggle = () => {
    this.setState(({ isWizardOpen }) => ({
      isWizardOpen: !isWizardOpen,
    }));
  };
  handlePlanSubmit = planWizardValues => {
    this.props.putPlan(planWizardValues);
  };
  
  handleStageTriggered = plan => {
    this.props.runStage(plan);
  };

  handleDeletePlan = id => {
    this.props.removePlan(id);
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
      migStorageList,
      plansWithStatus,
      clusterAssociatedPlans,
      storageAssociatedPlans,
    } = this.props;
    const { isWizardOpen } = this.state;

    const isAddPlanDisabled = allClusters.length < 2 || allStorage.length < 1;
    const { 
      handleStageTriggered,
      handleDeletePlan,
     } = this;
    return (
      <React.Fragment>
        <DataList aria-label="data-list-main-container">
          <ClusterDataListItem
            dataList={allClusters}
            id="clusterList"
            associatedPlans={clusterAssociatedPlans}
            isLoading={this.props.isMigrating || this.props.isStaging}
            migMeta={this.props.migMeta}
            removeCluster={this.props.removeCluster}
          />
          <StorageDataListItem
            dataList={allStorage}
            id="storageList"
            associatedPlans={storageAssociatedPlans}
            isLoading={this.props.isMigrating || this.props.isStaging}
            removeStorage={this.props.removeStorage}
          />
          <PlanContext.Provider value={{ handleStageTriggered, handleDeletePlan }}>
            <PlanDataListItem
              planList={plansWithStatus}
              clusterList={allClusters}
              storageList={allStorage}
              onPlanSubmit={this.handlePlanSubmit}
              plansDisabled={isAddPlanDisabled}
              isLoading={this.props.isMigrating || this.props.isStaging}
              onStartPolling={this.handleStartPolling}
              onStopPolling={this.props.stopDataListPolling}
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
    removePlan: id => dispatch(planOperations.removePlan(id)),
    putPlan: planValues => dispatch(planOperations.putPlan(planValues)),
    runStage: plan => dispatch(planOperations.runStage(plan)),
    updateStageProgress: (plan, progress) =>
      dispatch(PlanCreators.updateStageProgress(plan.planName, progress)),
    stagingSuccess: plan => dispatch(PlanCreators.stagingSuccess(plan.planName)),
    updatePlans: updatedPlans => dispatch(PlanCreators.updatePlans(updatedPlans)),
    startDataListPolling: params => dispatch(startDataListPolling(params)),
    stopDataListPolling: () => dispatch(stopDataListPolling()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailViewComponent);
