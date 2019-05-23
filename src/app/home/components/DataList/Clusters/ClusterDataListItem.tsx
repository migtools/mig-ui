import React from 'react';
import { Flex, Box } from '@rebass/emotion';
import {
  Button,
  DataList,
  DataListItem,
  DataListCell,
  DataListToggle,
  DataListContent,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
} from '@patternfly/react-core';
import { useExpandDataList, useOpenModal } from '../../../duck/hooks';
import { PlusCircleIcon } from '@patternfly/react-icons';
import AddClusterModal from '../../../../cluster/components/AddClusterModal';
import ClusterContent from './ClusterContent';

const ClusterDataListItem = ({ dataList, isLoading, associatedPlans, migMeta, ...props }) => {
  const [isExpanded, toggleExpanded] = useExpandDataList(false);
  const [isOpen, toggleOpen] = useOpenModal(false);
  if (dataList) {
    return (
      <DataListItem aria-labelledby="cluster-container-item" isExpanded={isExpanded}>
        <DataListItemRow>
          <DataListToggle
            onClick={() => toggleExpanded()}
            isExpanded={isExpanded}
            id="cluster-toggle"
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell
                id="cluster-item"
                key="clusters"
              >
                <span id="name" >Clusters</span>
              </DataListCell>,
            ]}
          />
          <DataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan">
            <Button onClick={toggleOpen} variant="link">
              <PlusCircleIcon /> Add Cluster
            </Button>
            <AddClusterModal isOpen={isOpen} onHandleClose={toggleOpen} />
          </DataListAction>
        </DataListItemRow>
        <ClusterContent
          associatedPlans={associatedPlans}
          dataList={dataList}
          isLoading={isLoading}
          isExpanded={isExpanded}
          migMeta={migMeta}
          {...props}
        />

      </DataListItem >
    );
  }
  return null;
};

export default ClusterDataListItem;
