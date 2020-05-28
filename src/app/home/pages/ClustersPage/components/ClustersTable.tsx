import React, { useEffect } from 'react';
import { Button, Pagination, Level, LevelItem } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable, classNames } from '@patternfly/react-table';
import { LinkIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { usePaginationState, useSortState } from '../../../../common/duck/hooks';
import { getClusterInfo } from '../helpers';
import StatusIcon from '../../../../common/components/StatusIcon';
import ClusterActionsDropdown from './ClusterActionsDropdown';
const styles = require('./ClustersTable.module');

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
    { title: 'Associated plans', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNames(tableStyles.tableAction)] },
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
            <span className={styles.iconWithText}>
              <LinkIcon color="#737679" />
              <span className={spacing.mlSm}>{associatedPlanCount}</span>
            </span>
          ),
        },
        {
          title: (
            <span className={styles.iconWithText}>
              <StatusIcon isReady={clusterStatus} />
              <span id="cluster-status-text" className={spacing.mlSm}>
                {clusterStatus ? `Connected` : `Connection Failed`}
              </span>
            </span>
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
