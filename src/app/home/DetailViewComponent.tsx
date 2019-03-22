import React, { Component } from 'react';
import { DataList } from '@patternfly/react-core';
import { connect } from 'react-redux';

import DetailViewItem from './components/DetailViewItem';
import DynamicModal from '../common/DynamicModalComponent';
import clusterOperations from '../cluster/duck/operations';
class DetailViewComponent extends Component<any, any> {
  state = {
    expanded: [],
    plansDisabled: true,
    isOpen: false,
    modalType: ''
  };
  componentDidMount() {
    const { migrationClusterList, migrationStorageList } = this.props;
    if (migrationClusterList > 1 && migrationStorageList > 1) {
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
            ...expanded.slice(index + 1, expanded.length)
          ]
        : [...expanded, id];
    this.setState(() => ({ expanded: newExpanded }));
  };

  handleRemoveItem = (type, id) => {
    if (type === 'cluster') {
      this.props.removeCluster(id);
    }
  };

  handleModalToggle = type => {
    this.setState(({ isOpen, modalType }) => ({
      isOpen: !isOpen,
      modalType: type
    }));
  };

  render() {
    const {
      filteredClusters,
      migrationClusterList,
      migrationPlansList,
      migrationStorageList,
      clusterSearchText
    } = this.props;
    return (
      <React.Fragment>
        <DataList aria-label="Expandable data list example">
          <DetailViewItem
            isExpanded={this.state.expanded.includes('migrationClusterList')}
            onToggle={this.handleToggle}
            dataList={migrationClusterList}
            id="migrationClusterList"
            title="Clusters"
            type="cluster"
            onAddItem={() => this.handleModalToggle('cluster')}
            onRemoveItem={this.handleRemoveItem}
          />
          <DetailViewItem
            isExpanded={this.state.expanded.includes('repositoryList')}
            onToggle={this.handleToggle}
            dataList={migrationStorageList}
            id="repositoryList"
            title="Storage"
            onAddItem={() => this.handleModalToggle('storage')}
          />
          <DetailViewItem
            isExpanded={this.state.expanded.includes('planList')}
            onToggle={this.handleToggle}
            dataList={migrationPlansList}
            id="planList"
            title="Plans"
            searchText={clusterSearchText}
            plansDisabled={this.state.plansDisabled}
            onAddItem={() => this.handleModalToggle('plan')}
          />
        </DataList>
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
  const { migrationClusterList } = state.cluster;
  const { migrationStorageList } = state.storage;
  return {
    migrationClusterList,
    migrationStorageList
  };
}
const mapDispatchToProps = dispatch => {
  return {
    removeCluster: id => dispatch(clusterOperations.removeCluster(id))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailViewComponent);
