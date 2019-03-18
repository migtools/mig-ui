import React, { Component } from 'react';
import {
  DataList,
  DataListItem,
  DataListCell,
  DataListToggle,
  DataListContent,
  DataListCheck,
  DataListAction,
  Button,
} from '@patternfly/react-core';
import { TimesIcon, PlusCircleIcon } from '@patternfly/react-icons';

import './DetailView.css';
import ClusterListComponent from '../components/ClusterListComponent';
class DetailViewComponent extends Component<any, any> {
  state = {
    expanded: ['ex-toggle1'],
  };

  render() {
    const toggle = id => {
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
    };
    const {
      migrationClusterList,
      migrationPlansList,
      migrationStorageList,
    } = this.props;
    return (
      <DataList aria-label="Expandable data list example">
        <DataListItem
          aria-labelledby="ex-item1"
          isExpanded={this.state.expanded.includes('ex-toggle1')}
        >
          <div className="header-item-container">
            <DataListToggle
              className="header-toggle-btn "
              onClick={() => toggle('ex-toggle1')}
              isExpanded={this.state.expanded.includes('ex-toggle1')}
              id="ex-toggle1"
              aria-labelledby="ex-toggle1 ex-item1"
              aria-label="Toggle details for"
            />

            <div className="header-item">
              <div className="header-item-title">Clusters</div>
            </div>
            <Button className="add-item-btn " variant="link">
              <PlusCircleIcon /> Add Cluster
            </Button>
          </div>
          <DataListContent
            aria-label="Primary Content Details"
            isHidden={!this.state.expanded.includes('ex-toggle1')}
          >
            <ClusterListComponent clusterList={migrationClusterList || []} />
          </DataListContent>
        </DataListItem>
        <DataListItem
          aria-labelledby="ex-item2"
          isExpanded={this.state.expanded.includes('ex-toggle2')}
        >
          <div className="header-item-container">
            <DataListToggle
              className="header-toggle-btn "
              onClick={() => toggle('ex-toggle2')}
              isExpanded={this.state.expanded.includes('ex-toggle2')}
              id="ex-toggle2"
              aria-labelledby="ex-toggle2 ex-item2"
              aria-label="Toggle details for"
            />

            <div className="header-item">
              <div className="header-item-title">Replication Repositories</div>
            </div>
            <Button className="add-item-btn " variant="link">
              <PlusCircleIcon /> Add Repositories
            </Button>
          </div>
          <DataListContent
            aria-label="Primary Content Details"
            isHidden={!this.state.expanded.includes('ex-toggle2')}
          >
            <ClusterListComponent clusterList={migrationStorageList} />
          </DataListContent>
        </DataListItem>
        <DataListItem
          aria-labelledby="ex-item3"
          isExpanded={this.state.expanded.includes('ex-toggle3')}
        >
          <div className="header-item-container">
            <DataListToggle
              className="header-toggle-btn "
              onClick={() => toggle('ex-toggle3')}
              isExpanded={this.state.expanded.includes('ex-toggle3')}
              id="ex-toggle3"
              aria-labelledby="ex-toggle3 ex-item3"
              aria-label="Toggle details for"
            />

            <div className="header-item">
              <div className="header-item-title">Migration Plans</div>
            </div>
            <Button className="add-item-btn " variant="link">
              <PlusCircleIcon /> Create plan
            </Button>
          </div>
          <DataListContent
            aria-label="Primary Content Details"
            isHidden={!this.state.expanded.includes('ex-toggle3')}
          >
            <ClusterListComponent clusterList={migrationPlansList} />
          </DataListContent>
        </DataListItem>
      </DataList>
    );
  }
}

export default DetailViewComponent;
