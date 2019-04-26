import React, { Component } from 'react';
import { connect } from 'react-redux';

import { PlusCircleIcon } from '@patternfly/react-icons';

import DetailViewItem from './components/DetailViewItem';
import clusterOperations from '../cluster/duck/operations';
import storageOperations from '../storage/duck/operations';
import planOperations from '../plan/duck/operations';
import AddClusterModal from '../cluster/components/AddClusterModal';
import AddStorageModal from '../storage/components/AddStorageModal';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';
import planSelectors from '../plan/duck/selectors';
import { Creators as PlanCreators } from '../plan/duck/actions';
import Wizard from '../plan/components/Wizard';
import { css } from '@emotion/core';

import {
  Button,
  ButtonVariant,
  DataList,
  InputGroup,
  TextInput,
} from '@patternfly/react-core';

interface IProps {
  filteredClusterList: any[];
  filteredStorageList: any[];
  filteredPlanList: any[];
  allClusters: any[];
  allStorage: any[];
  allPlans: any[];
  clusterAssociatedPlans: any;
  storageAssociatedPlans: any;
  migStorageList: any[];
  removeStorage: (id) => void;
  removePlan: (id) => void;
  removeCluster: (id) => void;
  updateClusterSearchTerm: (searchTerm) => void;
  updateStorageSearchTerm: (searchTerm) => void;
  addPlanSuccess: (plan) => void;
  runStage: (plan) => void;
  updateStageProgress: (plan, progress) => void;
  stagingSuccess: (plan) => void;
  isStaging?: boolean;
  isMigrating?: boolean;
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
    this.props.updateClusterSearchTerm('');
    this.props.updateStorageSearchTerm('');
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      (
        prevProps.allClusters !== this.props.allClusters ||
        prevProps.allStorage !== this.props.allStorage
      ) &&
      (
        this.props.allClusters.length > 1 &&
        this.props.allStorage.length > 0
      )
    ) {
      this.setState({ plansDisabled: false });
    }
  }
  handleToggle = (id, forceOpen?) => {
    const expanded = this.state.expanded;
    const index = expanded.indexOf(id);
    let newExpanded;
    if (forceOpen) {
      // this.setState(() => ({ expanded }));
      newExpanded =
        index >= 0
          ?
          [...expanded]
          : [...expanded, id];

      this.setState(() => ({ expanded: newExpanded }));

    } else {
      newExpanded =
        index >= 0
          ? [
            ...expanded.slice(0, index),
            ...expanded.slice(index + 1, expanded.length),
          ]
          : [...expanded, id];

      this.setState(() => ({ expanded: newExpanded }));
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
  }

  handleWizardToggle = () => {
    this.setState(({ isWizardOpen }) => ({
      isWizardOpen: !isWizardOpen,
    }));
  }
  handleClusterSearch = (val, otherval) => {
    this.props.updateClusterSearchTerm(val);
  }

  handleStorageSearch = (val, otherval) => {
    this.props.updateStorageSearchTerm(val);
  }

  handlePlanSubmit = (plan) => {
    this.props.addPlanSuccess(plan);
  }

  handleStageTriggered = (plan) => {
    this.props.runStage(plan);
  }

  render() {
    const {
      filteredClusterList,
      filteredStorageList,
      allStorage,
      allClusters,
      migStorageList,
      filteredPlanList,
      allPlans,
      clusterAssociatedPlans,
      storageAssociatedPlans,
    } = this.props;
    const { isWizardOpen } = this.state;

    const isAddPlanDisabled = allClusters.length < 2 || allStorage.length < 1;

    return (
      <React.Fragment>
        <DataList aria-label="Expandable data list example"
          //@ts-ignore
          css={css`
            pf-c-data-list__expandable-content { padding: 0 !important; }
          `}
        >
          <DetailViewItem
            isExpanded={this.state.expanded.includes('clusterList')}
            onToggle={this.handleToggle}
            filteredDataList={filteredClusterList}
            allData={allClusters}
            onSearch={this.handleClusterSearch}
            id="clusterList"
            title="Clusters"
            type="cluster"
            associatedPlans={clusterAssociatedPlans}
            addButton={
              <AddClusterModal
                onToggle={() => this.handleToggle('clusterList', true)}
                trigger={<Button variant="link">
                  <PlusCircleIcon /> Add cluster
                </Button>}
              />
            }
            onRemoveItem={this.handleRemoveItem}
          />
          <DetailViewItem
            isExpanded={this.state.expanded.includes('repositoryList')}
            onToggle={this.handleToggle}
            filteredDataList={filteredStorageList}
            allData={allStorage}
            onSearch={this.handleStorageSearch}
            id="repositoryList"
            title="Replication Repositories"
            type="storage"
            associatedPlans={storageAssociatedPlans}
            addButton={
              <AddStorageModal
                onToggle={() => this.handleToggle('repositoryList', true)}
                trigger={<Button variant="link">
                  <PlusCircleIcon /> Add repository
                </Button>}
              />
            }
            onRemoveItem={this.handleRemoveItem}
          />
          <DetailViewItem
            isExpanded={this.state.expanded.includes('plansList')}
            onToggle={this.handleToggle}
            filteredDataList={filteredPlanList}
            onWizardToggle={this.handleWizardToggle}
            allData={allPlans}
            id="plansList"
            title="Migration Plans"
            type="plans"
            addButton={
              <Wizard
                isOpen={isWizardOpen}
                onToggle={this.handleWizardToggle}
                onExpandToggle={() => this.handleToggle('plansList', true)}
                clusterList={allClusters}
                storageList={migStorageList}
                onPlanSubmit={this.handlePlanSubmit}
                trigger={<Button variant="link" isDisabled={isAddPlanDisabled}>
                  <PlusCircleIcon /> Add plan
                </Button>}
              />
            }
            onRemoveItem={this.handleRemoveItem}
            plansDisabled={isAddPlanDisabled}
            onStageTriggered={this.handleStageTriggered}
            isLoading={this.props.isMigrating || this.props.isStaging}
          />
        </DataList>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const filteredClusterList = clusterSelectors.getVisibleClusters(state);
  const allClusters = clusterSelectors.getAllClusters(state);
  const filteredStorageList = storageSelectors.getVisibleStorage(state);
  const allStorage = storageSelectors.getAllStorage(state);
  const filteredPlanList = planSelectors.getVisiblePlans(state);
  const allPlans = planSelectors.getAllPlans(state);


  const clusterAssociatedPlans = allClusters.reduce((associatedPlans, cluster) => {
    const clusterName = cluster.MigCluster.metadata.name;
    associatedPlans[clusterName] = allPlans.reduce((count, plan) => {
      const isAssociated = plan.sourceCluster === clusterName || plan.targetCluster === clusterName;
      return isAssociated ? count + 1 : count;
    }, 0);
    return associatedPlans;
  }, {});

  const storageAssociatedPlans = allStorage.reduce((associatedPlans, storage) => {
    const storageName = storage.metadata.name;
    associatedPlans[storageName] = allPlans.reduce((count, plan) => {
      const isAssociated = plan.selectedStorage === storageName;
      return isAssociated ? count + 1 : count;
    }, 0);
    return associatedPlans;
  }, {});

  const { migStorageList } = state.storage;
  const { isMigrating, isStaging } = state.plan;
  return {
    allClusters,
    filteredClusterList,
    allStorage,
    filteredStorageList,
    migStorageList,
    filteredPlanList,
    allPlans,
    clusterAssociatedPlans,
    storageAssociatedPlans,
    isMigrating,
    isStaging
  };
}
const mapDispatchToProps = dispatch => {
  return {
    updateClusterSearchTerm: searchTerm => dispatch(clusterOperations.updateSearchTerm(searchTerm)),
    updateStorageSearchTerm: searchTerm => dispatch(storageOperations.updateSearchTerm(searchTerm)),
    removeCluster: id => dispatch(clusterOperations.removeCluster(id)),
    removeStorage: id => dispatch(storageOperations.removeStorage(id)),
    addPlanSuccess: plan => dispatch(PlanCreators.addPlanSuccess(plan)),
    runStage: plan => dispatch(planOperations.runStage(plan)),
    updateStageProgress: (plan, progress) => dispatch(PlanCreators.updateStageProgress(plan.planName, progress)),
    stagingSuccess: plan => dispatch(PlanCreators.stagingSuccess(plan.planName)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetailViewComponent);
