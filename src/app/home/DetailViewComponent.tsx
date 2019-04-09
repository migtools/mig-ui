import React, { Component } from 'react';
import { DataList, Button } from '@patternfly/react-core';
import { connect } from 'react-redux';

import { PlusCircleIcon } from '@patternfly/react-icons';

import DetailViewItem from './components/DetailViewItem';
import clusterOperations from '../cluster/duck/operations';
import storageOperations from '../storage/duck/operations';
import AddClusterModal from '../cluster/components/AddClusterModal';
import AddStorageModal from '../storage/components/AddStorageModal';

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
    plansDisabled: true,
    isOpen: false,
    isWizardOpen: false,
    modalType: '',
  };
  componentDidMount() {
    const { clusterList, migStorageList } = this.props;
    if (clusterList.length > 1 && migStorageList.length > 0) {
      this.setState({ plansDisabled: false });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      (
        prevProps.clusterList !== this.props.clusterList ||
        prevProps.migStorageList !== this.props.migStorageList
      ) &&
      (
        this.props.clusterList.length > 1 &&
        this.props.migStorageList.length > 0
      )
    ) {
      this.setState({ plansDisabled: false });
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
            addButton={
              <AddClusterModal
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
            dataList={migStorageList}
            id="repositoryList"
            title="Storage"
            type="storage"
            addButton={
              <AddStorageModal
                trigger={<Button variant="link">
                  <PlusCircleIcon /> Add storage
                </Button>}
              />
            }
            onRemoveItem={this.handleRemoveItem}
          />
          <DetailViewItem
            isExpanded={this.state.expanded.includes('plansList')}
            onToggle={this.handleToggle}
            dataList={[]}
            id="plansList"
            title="Plans"
            type="plans"
            addButton={
              <Wizard
                clusterList={clusterList}
                storageList={migStorageList}
                trigger={<Button variant="link">
                  <PlusCircleIcon /> Add plan
                </Button>}
              />
            }
            onRemoveItem={this.handleRemoveItem}
            plansDisabled={this.state.plansDisabled}
          />
        </DataList>
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
