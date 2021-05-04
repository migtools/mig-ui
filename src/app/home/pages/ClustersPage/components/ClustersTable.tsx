import React, { useEffect } from 'react';
import {
  Button,
  Pagination,
  Level,
  LevelItem,
  Popover,
  PopoverPosition,
  Title,
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable, classNames } from '@patternfly/react-table';
import LinkIcon from '@patternfly/react-icons/dist/js/icons/link-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { useSortState } from '../../../../common/duck/hooks';
import { getClusterInfo } from '../helpers';
import { StatusIcon, StatusType } from '@konveyor/lib-ui';
import ClusterActionsDropdown from './ClusterActionsDropdown';
import IconWithText from '../../../../common/components/IconWithText';
import { ICluster } from '../../../../cluster/duck/types';
import { IMigMeta } from '../../../../auth/duck/types';
import { IPlanCountByResourceName } from '../../../../common/duck/types';
import { usePaginationState } from '../../../../common/duck/hooks/usePaginationState';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { addEditStatusText, IAddEditStatus } from '../../../../common/add_edit_state';
import ConnectionStatusLabel from '../../../../common/components/ConnectionStatusLabel';

interface IClustersTableProps {
  clusterList: ICluster[];
  associatedPlans: IPlanCountByResourceName;
  migMeta: IMigMeta;
  removeCluster: (clusterName: string) => void;
  toggleAddEditModal: () => void;
  setCurrentCluster: (currentCluster: ICluster) => void;
  currentCluster: ICluster;
  addEditStatus: IAddEditStatus;
}

const ClustersTable: React.FunctionComponent<IClustersTableProps> = ({
  clusterList,
  associatedPlans,
  migMeta,
  removeCluster,
  toggleAddEditModal,
  setCurrentCluster,
  currentCluster,
  addEditStatus,
}: IClustersTableProps) => {
  const columns = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Location', transforms: [sortable] },
    { title: 'MTC operator version', transforms: [sortable] },
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

    const componentTypeStr = 'cluster';
    const currentStatusFn = addEditStatusText(componentTypeStr);

    const {
      clusterName,
      clusterStatus,
      clusterUrl,
      associatedPlanCount,
      operatorVersion,
      hasCriticalCondition,
      hasWarnCondition,
      errorMessage,
      conditionType,
    } = clusterInfo;
    return {
      cells: [
        clusterName,
        clusterUrl,
        {
          title: (
            <>
              <span className={spacing.mrSm}>{operatorVersion}</span>
              {(hasCriticalCondition || hasWarnCondition) && (
                <Popover
                  position={PopoverPosition.bottom}
                  bodyContent={
                    <>
                      <Title headingLevel="h2" size="xl">
                        <>
                          <span className="pf-c-icon pf-m-warning">
                            <ExclamationTriangleIcon />
                          </span>
                          <span className={spacing.mlMd}>{conditionType}</span>
                        </>
                      </Title>
                      <p className={spacing.mtMd}>{errorMessage}</p>
                    </>
                  }
                  aria-label="operator-mismatch-details"
                  closeBtnAriaLabel="close--details"
                  maxWidth="30rem"
                >
                  <span>
                    <span className="pf-c-icon pf-m-warning">
                      <ExclamationTriangleIcon />
                    </span>
                  </span>
                </Popover>
              )}
            </>
          ),
        },

        {
          title: <IconWithText icon={<LinkIcon color="#737679" />} text={associatedPlanCount} />,
        },
        {
          title: (
            <>
              {cluster.MigCluster.metadata.name === currentCluster?.MigCluster?.metadata?.name ? (
                <ConnectionStatusLabel
                  status={addEditStatus}
                  statusText={currentStatusFn(addEditStatus)}
                />
              ) : (
                <StatusIcon
                  status={clusterStatus ? StatusType.Ok : StatusType.Error}
                  label={clusterStatus ? `Connected` : `Connection Failed`}
                />
              )}
            </>
          ),
        },
        {
          title: (
            <ClusterActionsDropdown
              cluster={cluster}
              clusterInfo={clusterInfo}
              removeCluster={removeCluster}
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
          <Button id="add-cluster-btn" onClick={toggleAddEditModal} variant="secondary">
            Add cluster
          </Button>
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
