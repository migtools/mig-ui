import React, { useEffect } from 'react';
import { Button, Pagination, Flex, FlexItem, Level, LevelItem } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import { LinkIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { usePaginationState, useSortState } from '../../../../common/duck/hooks';
import { getClusterInfo } from '../helpers';
import StatusIcon from '../../../../common/components/StatusIcon';
import ClusterActionsDropdown from './ClusterActionsDropdown';

// TODO add prop types interface
const ClustersTable = ({
  clusterList,
  associatedPlans,
  migMeta,
  removeCluster,
  toggleAddEditModal,
}) => {
  const columns = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Location', transforms: [sortable] },
    { title: 'Associated migration plans', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '' }, // Actions menu
  ];

  // TODO add type for cluster?
  const getSortValues = (cluster) => {
    const { clusterName, clusterUrl, associatedPlanCount, clusterStatus } = getClusterInfo(
      cluster,
      migMeta,
      associatedPlans
    );
    return [clusterName, clusterUrl, associatedPlanCount, clusterStatus, ''];
  };

  const { sortBy, onSort, sortedItems } = useSortState(clusterList, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy]);

  const rows = currentPageItems.map((cluster) => {
    const clusterInfo = getClusterInfo(cluster, migMeta, associatedPlans);
    const { clusterName, clusterStatus, clusterUrl, associatedPlanCount } = clusterInfo;
    return {
      cells: [
        clusterName,
        {
          title: (
            <a target="_blank" href={clusterUrl}>
              {clusterUrl}
            </a>
          ),
        },
        {
          title: (
            <Flex>
              <FlexItem>
                <LinkIcon color="#737679" />
              </FlexItem>
              <FlexItem>{associatedPlanCount}</FlexItem>
            </Flex>
          ),
        },
        {
          title: (
            <Flex>
              <FlexItem>
                <StatusIcon isReady={clusterStatus} />
              </FlexItem>
              <FlexItem>
                <span id="cluster-status-text">
                  {clusterStatus ? `Connected` : `Connection Failed`}
                </span>
              </FlexItem>
            </Flex>
          ),
        },
        {
          title: (
            <ClusterActionsDropdown
              cluster={cluster}
              clusterInfo={clusterInfo}
              removeCluster={removeCluster}
            />
          ),
        },
      ],
    };
  });

  return (
    <>
      <Level>
        <LevelItem>
          <Button id="add-cluster-btn" onClick={toggleAddEditModal} variant="secondary">
            Add cluster
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination widgetId="clusters-table-pagination-top" {...paginationProps} />
        </LevelItem>
      </Level>
      <Table
        aria-label="Clusters table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        className={`${spacing.mtMd} ${spacing.mbMd}`}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        widgetId="clusters-table-pagination-bottom"
        variant="bottom"
        className={spacing.mtMd}
        {...paginationProps}
      />
    </>
  );
};

export default ClustersTable;
