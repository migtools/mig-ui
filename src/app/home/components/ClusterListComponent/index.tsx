import React, { Component } from 'react';
import {
  DataList,
  DataListItem,
  DataListCell,
  DataListToggle,
  DataListContent,
  DataListCheck,
  DataListAction,
} from '@patternfly/react-core';
import './ClusterList.css';
const ClusterListComponent = ({ clusterList, ...props }) => {
  return (
    <React.Fragment>
      {clusterList.length > 0 ? (
        <DataList aria-label="Simple data list example">
          {clusterList.map((listItem, index) => (
            <DataListItem
              key={index}
              isExpanded={false}
              aria-labelledby="simple-item1"
            >
              <DataListCell width={1}>
                <span id="simple-item1">{listItem.metadata.name}</span>
              </DataListCell>
              <DataListCell width={1}>URL</DataListCell>
              <DataListCell width={1}>Plans</DataListCell>
            </DataListItem>
          ))}
        </DataList>
      ) : (
        <div className="empty-content"> No Content</div>
      )}
    </React.Fragment>
  );
};

export default ClusterListComponent;
