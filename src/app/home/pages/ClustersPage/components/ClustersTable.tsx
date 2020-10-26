import React, { useEffect } from 'react';
import { Button, Pagination, Level, LevelItem } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable, classNames } from '@patternfly/react-table';
import LinkIcon from '@patternfly/react-icons/dist/js/icons/link-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { usePaginationState, useSortState } from '../../../../common/duck/hooks';
import { getClusterInfo } from '../helpers';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import ClusterActionsDropdown from './ClusterActionsDropdown';
import IconWithText from '../../../../common/components/IconWithText';
import { ICluster } from '../../../../cluster/duck/types';
import { IMigMeta } from '../../../../auth/duck/types';
import { IPlanCountByResourceName } from '../../../../common/duck/types';

interface IClustersTableProps {
  clusterList: ICluster[];
  associatedPlans: IPlanCountByResourceName;
  migMeta: IMigMeta;
  removeCluster: (clusterName: string) => void;
  toggleAddEditModal: () => void;
  toggleAddEditTokenModal: () => void;
  isAddEditTokenModalOpen: boolean;
  isAdmin: boolean;
  setAssociatedCluster: (clusterName: string) => void;
  setCurrentCluster: (currentCluster: ICluster) => void;
}

const ClustersTable: React.FunctionComponent<IClustersTableProps> = ({
  clusterList,
  associatedPlans,
  migMeta,
  removeCluster,
  toggleAddEditModal,
  toggleAddEditTokenModal,
  isAddEditTokenModalOpen,
  isAdmin,
  setAssociatedCluster,
  setCurrentCluster,
}: IClustersTableProps) => {
  const columns = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Location', transforms: [sortable] },
    { title: 'Associated plans', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNames(tableStyles.tableAction)] },
  ];

  const getSortValues = (cluster: ICluster) => {
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

  const rows = currentPageItems.map((cluster: ICluster) => {
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
          title: <IconWithText icon={<LinkIcon color="#737679" />} text={associatedPlanCount} />,
        },
        {
          title: (
            <StatusIcon
              status={clusterStatus ? StatusType.Ok : StatusType.Error}
              label={clusterStatus ? `Connected` : `Connection Failed`}
            />
          ),
        },
        {
          title: (
            <ClusterActionsDropdown
              cluster={cluster}
              clusterInfo={clusterInfo}
              removeCluster={removeCluster}
              isAdmin={isAdmin}
              toggleAddEditTokenModal={toggleAddEditTokenModal}
              isAddEditTokenModalOpen={isAddEditTokenModalOpen}
              setAssociatedCluster={setAssociatedCluster}
              setCurrentCluster={setCurrentCluster}
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
          {isAdmin && (
            <Button id="add-cluster-btn" onClick={toggleAddEditModal} variant="secondary">
              Add cluster
            </Button>
          )}
        </LevelItem>
        <LevelItem>
          <Pagination
            widgetId="clusters-table-pagination-top"
            itemCount={paginationProps.itemCount}
            perPage={paginationProps.perPage}
            page={paginationProps.page}
            onSetPage={paginationProps.onSetPage}
            onPerPageSelect={paginationProps.onPerPageSelect}
          />
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
        itemCount={paginationProps.itemCount}
        perPage={paginationProps.perPage}
        page={paginationProps.page}
        onSetPage={paginationProps.onSetPage}
        onPerPageSelect={paginationProps.onPerPageSelect}
      />
    </>
  );
};

export default ClustersTable;
