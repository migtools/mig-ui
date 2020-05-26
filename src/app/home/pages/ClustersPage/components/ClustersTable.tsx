import React, { useEffect, useContext, useState } from 'react';
import {
  Button,
  Pagination,
  DropdownItem,
  Flex,
  FlexItem,
  Dropdown,
  KebabToggle,
  DropdownPosition,
  Level,
  LevelItem,
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import { LinkIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { usePaginationState, useSortState } from '../../../../common/duck/hooks';
import { getClusterInfo } from '../helpers';
import { useOpenModal } from '../../../duck/hooks';
import { ClusterContext } from '../../../duck/context';
import StatusIcon from '../../../../common/components/StatusIcon';
import AddEditClusterModal from './AddEditClusterModal';
import ConfirmModal from '../../../../common/components/ConfirmModal';

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

  ////////////////////////
  const rows = currentPageItems.map((cluster) => {
    const {
      clusterName,
      clusterStatus,
      clusterUrl,
      clusterSvcToken,
      clusterRequireSSL,
      clusterCABundle,
      associatedPlanCount,
      isHostCluster,
      clusterIsAzure,
      clusterAzureResourceGroup,
    } = getClusterInfo(cluster, migMeta, associatedPlans);

    const [isAddEditOpen, toggleIsAddEditOpen] = useOpenModal(false);
    const [isConfirmOpen, toggleConfirmOpen] = useOpenModal(false);

    const removeMessage = `Removing "${clusterName}" will make it unavailable for migration plans`;

    const handleRemoveCluster = (isConfirmed) => {
      if (isConfirmed) {
        removeCluster(clusterName);
        toggleConfirmOpen();
      } else {
        toggleConfirmOpen();
      }
    };

    const clusterContext = useContext(ClusterContext);

    const editCluster = () => {
      clusterContext.watchClusterAddEditStatus(clusterName);
      toggleIsAddEditOpen();
    };

    const [kebabIsOpen, setKebabIsOpen] = useState(false);

    const kebabDropdownItems = [
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          editCluster();
        }}
        isDisabled={isHostCluster}
        key="editCluster"
      >
        Edit
      </DropdownItem>,
      <DropdownItem
        onClick={() => {
          setKebabIsOpen(false);
          toggleConfirmOpen();
        }}
        isDisabled={isHostCluster || associatedPlanCount > 0}
        key="removeCluster"
      >
        Remove
      </DropdownItem>,
    ];

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
            <>
              <Dropdown
                aria-label="Actions"
                toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
                isOpen={kebabIsOpen}
                isPlain
                dropdownItems={kebabDropdownItems}
                position={DropdownPosition.right}
              />
              <AddEditClusterModal
                isOpen={isAddEditOpen}
                onHandleClose={toggleIsAddEditOpen}
                cluster={cluster}
                initialClusterValues={{
                  clusterName,
                  clusterUrl,
                  clusterSvcToken,
                  clusterIsAzure,
                  clusterAzureResourceGroup,
                  clusterRequireSSL,
                  clusterCABundle,
                }}
              />
              <ConfirmModal
                title="Remove this cluster?"
                message={removeMessage}
                isOpen={isConfirmOpen}
                onHandleClose={handleRemoveCluster}
                id="confirm-cluster-removal"
              />
            </>
          ),
        },
      ],
    };
  });
  ///////////////////

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
