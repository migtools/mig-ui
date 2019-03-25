import React, { Component } from 'react';
import { DataList, Button } from '@patternfly/react-core';
import { connect } from 'react-redux';
import AddClusterModal from './components/AddClusterModal';

import DetailViewItem from './components/DetailViewItem';
class DetailViewComponent extends Component<any, any> {
  state = {
    expanded: [],
    plansDisabled: true,
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
            ...expanded.slice(index + 1, expanded.length),
          ]
        : [...expanded, id];
    this.setState(() => ({ expanded: newExpanded }));
  }
  render() {
    const {
      migrationClusterList,
      migrationPlansList,
      migrationStorageList,
    } = this.props;
    return (
      <DataList aria-label="Expandable data list example">
        <DetailViewItem
          isExpanded={this.state.expanded.includes('migrationClusterList')}
          onToggle={this.handleToggle}
          dataList={migrationClusterList}
          id="migrationClusterList"
          title="Clusters"
          action={<AddClusterModal />}
        />
        <DetailViewItem
          isExpanded={this.state.expanded.includes('repositoryList')}
          onToggle={this.handleToggle}
          dataList={migrationStorageList}
          id="repositoryList"
          title="Storage"
          action='Add storage'
        />
        <DetailViewItem
          isExpanded={this.state.expanded.includes('planList')}
          onToggle={this.handleToggle}
          dataList={migrationPlansList}
          id="planList"
          title="Plans"
          plansDisabled={this.state.plansDisabled}
          action='Add plan'
        />
      </DataList>
    );
  }
}

export default connect(
  state => ({
    loggingIn: state.auth.loggingIn,
    user: state.auth.user,
    migrationClusterList: state.home.migrationClusterList,
    migrationStorageList: state.home.migrationStorageList,
    migrationPlansList: state.home.migrationPlansList,
  }),
  dispatch => ({}),
)(DetailViewComponent);
