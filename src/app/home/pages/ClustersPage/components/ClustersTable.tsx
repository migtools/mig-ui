import React from 'react';
import {
  Badge,
  Button,
  DataList,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
  DataListContent,
  EmptyState,
  EmptyStateIcon,
  Title,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import ClusterItem from './ClusterItem';

// TODO add prop types interface
const ClustersTable = ({
  isExpanded,
  clusterList,
  associatedPlans,
  migMeta,
  removeCluster,
  clusterCount,
  toggleAddEditModal,
}) => {
  if (!clusterList) return null;
  if (clusterList.length === 0) {
    return (
      <EmptyState variant="full">
        <EmptyStateIcon icon={AddCircleOIcon} />
        <Title size="lg">Add source and target clusters for the migration</Title>
        <Button onClick={toggleAddEditModal} variant="primary">
          Add cluster
        </Button>
      </EmptyState>
    );
  }
  return (
    // TODO replace with table
    <DataList aria-label="data-list-main-container">
      <DataListItem aria-labelledby="cluster-container-item" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell id="cluster-item" key="clusters">
                <div className="pf-l-flex">
                  <div className="pf-l-flex__item">
                    <span id="clusters">Clusters</span>
                  </div>
                  <div className="pf-l-flex__item">
                    <Badge isRead>{clusterCount}</Badge>
                  </div>
                </div>
              </DataListCell>,
            ]}
          />
          <DataListAction aria-label="add-cluster" aria-labelledby="plan-item" id="add-cluster">
            <Button
              aria-label="add-cluster-btn"
              id="add-cluster-btn"
              onClick={toggleAddEditModal}
              variant="secondary"
            >
              Add
            </Button>
          </DataListAction>
        </DataListItemRow>
        <DataListContent
          noPadding
          aria-label="cluster-items-content-container"
          isHidden={!isExpanded}
        >
          <DataList aria-label="cluster-item-list">
            {clusterList.map((cluster, clusterIndex) => {
              return (
                <ClusterItem
                  key={clusterIndex}
                  cluster={cluster}
                  clusterIndex={clusterIndex}
                  migMeta={migMeta}
                  removeCluster={removeCluster}
                  associatedPlans={associatedPlans}
                />
              );
            })}
          </DataList>
        </DataListContent>
      </DataListItem>
    </DataList>
  );
};

export default ClustersTable;
