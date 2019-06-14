import React, { Component } from 'react';
import { connect } from 'react-redux';
import clusterOperations from '../cluster/duck/operations';
import storageOperations from '../storage/duck/operations';
import planOperations from '../plan/duck/operations';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';
import planSelectors from '../plan/duck/selectors';
import planSagas from '../plan/duck/sagas';
import { Creators as PlanCreators } from '../plan/duck/actions';
import ClusterDataListItem from './components/DataList/Clusters/ClusterDataListItem';
import StorageDataListItem from './components/DataList/Storage/StorageDataListItem';
import PlanDataListItem from './components/DataList/Plans/PlanDataListItem';
import { DataList } from '@patternfly/react-core';

interface IProps {
  allClusters: any[];
  allStorage: any[];
  allPlans: any[];
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
  startPolling: () => void;
  stopPolling: () => void;
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

  render() {
    const {
      allStorage,
      allClusters,
      migStorageList,
      allPlans,
      clusterAssociatedPlans,
      storageAssociatedPlans,
    } = this.props;
    const { isWizardOpen } = this.state;

    const isAddPlanDisabled = allClusters.length < 2 || allStorage.length < 1;

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
          <PlanDataListItem
            planList={allPlans}
            id="plansList"
            clusterList={allClusters}
            storageList={allStorage}
            onPlanSubmit={this.handlePlanSubmit}
            plansDisabled={isAddPlanDisabled}
            onStageTriggered={this.handleStageTriggered}
            isLoading={this.props.isMigrating || this.props.isStaging}
            onStartPolling={this.props.startPolling}
            onStopPolling={this.props.stopPolling}
          />
        </DataList>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const allClusters = clusterSelectors.getAllClusters(state);
  const allStorage = storageSelectors.getAllStorage(state);
  const allPlans = planSelectors.getAllPlans(state);
  const clusterAssociatedPlans = clusterSelectors.getAssociatedPlans(state);
  const storageAssociatedPlans = storageSelectors.getAssociatedPlans(state);

  const { migStorageList } = state.storage;
  const { isMigrating, isStaging } = state.plan;
  const migMeta = state.migMeta;

  return {
    allClusters,
    allStorage,
    migStorageList,
    allPlans,
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
    putPlan: planValues => dispatch(planOperations.putPlan(planValues)),
    runStage: plan => dispatch(planOperations.runStage(plan)),
    updateStageProgress: (plan, progress) =>
      dispatch(PlanCreators.updateStageProgress(plan.planName, progress)),
    stagingSuccess: plan => dispatch(PlanCreators.stagingSuccess(plan.planName)),
    startPolling: () => dispatch(PlanCreators.startPolling()),
    stopPolling: () => dispatch(PlanCreators.stopPolling()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailViewComponent);
