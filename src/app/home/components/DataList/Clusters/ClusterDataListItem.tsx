import React from 'react';
import {
  Badge,
  Button,
  DataListItem,
  DataListCell,
  DataListToggle,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
} from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import AddEditClusterModal from '../../../../cluster/components/AddEditClusterModal';
import ClusterContent from './ClusterContent';

const ClusterDataListItem = ({
  id,
  isExpanded,
  toggleExpanded,
  dataList,
  associatedPlans,
  migMeta,
  removeCluster,
  clusterCount,
  ...props }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  if (dataList) {
    return (
      <DataListItem aria-labelledby="cluster-container-item" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListToggle
            onClick={() => toggleExpanded(id)}
            isExpanded={isExpanded}
            id="cluster-toggle"
          />
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
            <Button aria-label="add-cluster-btn" id="add-cluster-btn" onClick={toggleOpen} variant="secondary">
              Add
            </Button>
            <AddEditClusterModal isOpen={isOpen} onHandleClose={toggleOpen} />
          </DataListAction>
        </DataListItemRow>
        <ClusterContent
          associatedPlans={associatedPlans}
          dataList={dataList}
          isExpanded={isExpanded}
          migMeta={migMeta}
          removeCluster={removeCluster}
          {...props}
        />
      </DataListItem>
    );
  }
  return null;
};

export default ClusterDataListItem;
