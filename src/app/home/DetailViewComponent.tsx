import React, { Component } from 'react';
import { DataList } from '@patternfly/react-core';
import { connect } from 'react-redux';

import DetailViewItem from './components/DetailViewItem';
import DynamicModal from '../common/DynamicModalComponent';
import clusterOperations from '../cluster/duck/operations';
import storageOperations from '../storage/duck/operations';
import Wizard from '../plan/components/Wizard';
interface IProps {
  clusterList: any[];
  migStorageList: any[];
  removeStorage: (id) => void;
  removePlan: (id) => void;
  removeCluster: (id) => void;
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
    plansDisabled: false,
    isOpen: false,
    isWizardOpen: false,
    modalType: '',
  };
  componentDidMount() {
    const { clusterList, migStorageList } = this.props;
    if (clusterList.length > 1 && migStorageList.length > 1) {
      this.setState({ plansDisabled: false });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.clusterList !== this.props.clusterList ||
      prevProps.migStorageList !== this.props.migStorageList
    ) {
      if (
        this.props.clusterList.length > 1 &&
        this.props.migStorageList.length > 0
      ) {
        this.setState({ plansDisabled: false });
      }
    }
  }
  handleToggle = id => {
    const expanded = this.state.expanded;
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0
        ? [
            ...expanded.slice(0, index),
            ...expanded.slice(index + 1, expanded.length),
          ]
        : [...expanded, id];
    this.setState(() => ({ expanded: newExpanded }));
  }

  handleRemoveItem = (type, id) => {
    if (type === 'cluster') {
      this.props.removeCluster(id);
    }
    if (type === 'storage') {
      this.props.removeStorage(id);
    }
    if (type === 'plan') {
      this.props.removePlan(id);
    }
  }

  handleModalToggle = type => {
    this.setState(({ isOpen, modalType }) => ({
      isOpen: !isOpen,
      modalType: type,
    }));
  }

  handleWizardToggle = () => {
    this.setState(({ isWizardOpen }) => ({
      isWizardOpen: !isWizardOpen,
    }));
  }

  render() {
    const { clusterList, migStorageList } = this.props;
    const { isWizardOpen } = this.state;
    return (
      <React.Fragment>
        <DataList aria-label="Expandable data list example">
          <DetailViewItem
            isExpanded={this.state.expanded.includes('clusterList')}
            onToggle={this.handleToggle}
            dataList={clusterList}
            id="clusterList"
            title="Clusters"
            type="cluster"
            onAddItem={() => this.handleModalToggle('cluster')}
            onRemoveItem={this.handleRemoveItem}
          />
          <DetailViewItem
            isExpanded={this.state.expanded.includes('repositoryList')}
            onToggle={this.handleToggle}
            dataList={migStorageList}
            id="repositoryList"
            title="Storage"
            type="storage"
            onAddItem={() => this.handleModalToggle('storage')}
            onRemoveItem={this.handleRemoveItem}
          />
          <DetailViewItem
            isExpanded={this.state.expanded.includes('plansList')}
            onToggle={this.handleToggle}
            dataList={[]}
            id="plansList"
            title="Plans"
            type="plans"
            onAddItem={() => this.handleWizardToggle()}
            onRemoveItem={this.handleRemoveItem}
            plansDisabled={this.state.plansDisabled}
          />
        </DataList>
        <Wizard
          isOpen={isWizardOpen}
          onWizardToggle={this.handleWizardToggle}
          clusterList={clusterList}
          storageList={migStorageList}
        />
        <DynamicModal
          onHandleModalToggle={this.handleModalToggle}
          isOpen={this.state.isOpen}
          modalType={this.state.modalType}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const clusterList = state.cluster.clusterList.map(c => c.MigCluster);
  const { migStorageList } = state.storage;
  return {
    clusterList,
    migStorageList,
  };
}
const mapDispatchToProps = dispatch => {
  return {
    removeCluster: id => dispatch(clusterOperations.removeCluster(id)),
    removeStorage: id => dispatch(storageOperations.removeStorage(id)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetailViewComponent);
