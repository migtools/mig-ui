import React, { Component } from 'react';
import {
  DataList,
  DataListItem,
  DataListToggle,
  DataListContent,
  Button
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { connect } from 'react-redux';

import { Flex, Box } from '@rebass/emotion';

import DataListComponent from './DataListComponent';
class DetailViewComponent extends Component<any, any> {
  state = {
    expanded: ['ex-toggle1']
  };

  render() {
    const toggle = id => {
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
    const {
      migrationClusterList,
      migrationPlansList,
      migrationStorageList
    } = this.props;
    return (
      <DataList aria-label="Expandable data list example">
        <DataListItem
          aria-labelledby="ex-item1"
          isExpanded={this.state.expanded.includes('ex-toggle1')}
        >
          <Flex width="100%" height="5em">
            <Box flex="0 0 2em" my="auto">
              <DataListToggle
                onClick={() => toggle('ex-toggle1')}
                isExpanded={this.state.expanded.includes('ex-toggle1')}
                id="ex-toggle1"
                aria-labelledby="ex-toggle1 ex-item1"
                aria-label="Toggle details for"
              />
            </Box>
            <Box flex="1" my="auto">
              Clusters
            </Box>
            <Box textAlign="left" flex="0 0 15em" my="auto">
              <Button variant="link">
                <PlusCircleIcon /> Add Cluster
              </Button>
            </Box>
          </Flex>
          <DataListContent
            aria-label="Primary Content Details"
            isHidden={!this.state.expanded.includes('ex-toggle1')}
          >
            <DataListComponent dataList={migrationClusterList || []} />
          </DataListContent>
        </DataListItem>
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
    migrationPlansList: state.home.migrationPlansList
  }),
  dispatch => ({})
)(DetailViewComponent);
