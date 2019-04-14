import React, { Component } from 'react';
import { connect } from 'react-redux';

import { PlusCircleIcon } from '@patternfly/react-icons';

import DetailViewItem from './components/DetailViewItem';
import clusterOperations from '../cluster/duck/operations';
import storageOperations from '../storage/duck/operations';
import AddClusterModal from '../cluster/components/AddClusterModal';
import AddStorageModal from '../storage/components/AddStorageModal';
import clusterSelectors from '../cluster/duck/selectors';
import storageSelectors from '../storage/duck/selectors';

import Wizard from '../plan/components/Wizard';
import {
  Button,
  ButtonVariant,
  DataList,
  InputGroup,
  TextInput,
} from '@patternfly/react-core';
import { updateSearchTerm } from '../cluster/duck/reducers';
interface IProps {
  filteredClusterList: any[];
  filteredStorageList: any[];
  allClusters: any[];
  allStorage: any[];
  migStorageList: any[];
  removeStorage: (id) => void;
  removePlan: (id) => void;
  removeCluster: (id) => void;
  updateClusterSearchTerm: (searchTerm) => void;
  updateStorageSearchTerm: (searchTerm) => void;
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
    // const { allClusters, migStorageList } = this.props;
    // if (allClusters.length > 1 && migStorageList.length > 0) {
    //   this.setState({ plansDisabled: false });
    // }
    // this.props.updateSearchTerm('');
  }
  componentDidUpdate(prevProps, prevState) {
    //   if (
    //     (
    //       prevProps.clusterList !== this.props.allClusters ||
    //       prevProps.migStorageList !== this.props.migStorageList
    //     ) &&
    //     (
    //       this.props.allClusters.length > 1 &&
    //       this.props.migStorageList.length > 0
    //     )
    //   ) {
    //     this.setState({ plansDisabled: false });
    //   }
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
  handleClusterSearch = (val, otherval) => {
    this.props.updateClusterSearchTerm(val);
  }

  handleStorageSearch = (val, otherval) => {
    this.props.updateStorageSearchTerm(val);
  }
  render() {
    const { filteredClusterList, filteredStorageList, allStorage, allClusters, migStorageList } = this.props;
    const { isWizardOpen } = this.state;
    return (
      <React.Fragment>
        <DataList aria-label="Expandable data list example">
          <DetailViewItem
            isExpanded={this.state.expanded.includes('clusterList')}
            onToggle={this.handleToggle}
            filteredDataList={filteredClusterList}
            allData={allClusters}
            onSearch={this.handleClusterSearch}
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
            filteredDataList={filteredStorageList}
            allData={allStorage}
            onSearch={this.handleStorageSearch}
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
            allData={[]}
            id="plansList"
            title="Plans"
            type="plans"
            addButton={
              <Wizard
                clusterList={allClusters}
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
  const filteredClusterList = clusterSelectors.getVisibleClusters(state);
  const allClusters = clusterSelectors.getAllClusters(state);
  const filteredStorageList = storageSelectors.getVisibleStorage(state);
  const allStorage = storageSelectors.getAllStorage(state);
  const { migStorageList } = state.storage;
  return {
    allClusters,
    filteredClusterList,
    allStorage,
    filteredStorageList,
    migStorageList,
  };
}
const mapDispatchToProps = dispatch => {
  return {
    updateClusterSearchTerm: searchTerm => dispatch(clusterOperations.updateSearchTerm(searchTerm)),
    updateStorageSearchTerm: searchTerm => dispatch(storageOperations.updateSearchTerm(searchTerm)),
    removeCluster: id => dispatch(clusterOperations.removeCluster(id)),
    removeStorage: id => dispatch(storageOperations.removeStorage(id)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DetailViewComponent);
