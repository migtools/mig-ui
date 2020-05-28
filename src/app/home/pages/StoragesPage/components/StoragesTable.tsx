// TODO base this on ClustersTable, call the getStorageInfo helper and
// render the StorageActionsDropdown in the rows (all based on StorageItem)

import React, { useEffect } from 'react';
import { Button, Pagination, Level, LevelItem } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable, classNames } from '@patternfly/react-table';
import { LinkIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { useSortState, usePaginationState } from '../../../../common/duck/hooks';
import { getStorageInfo } from '../helpers';
import IconWithText from '../../../../common/components/IconWithText';
import StatusIcon from '../../../../common/components/StatusIcon';
import StorageActionsDropdown from './StorageActionsDropdown';

// TODO add prop types interface
const StoragesTable = ({ storageList, associatedPlans, toggleAddEditModal, removeStorage }) => {
  const columns = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Location', transforms: [sortable] },
    { title: 'Associated plans', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNames(tableStyles.tableAction)] },
  ];

  // TODO add type for storage?
  const getSortValues = (storage) => {
    const { storageName, s3Url, associatedPlanCount, storageStatus } = getStorageInfo(
      storage,
      associatedPlans
    );
    return [storageName, s3Url, associatedPlanCount, storageStatus, ''];
  };

  const { sortBy, onSort, sortedItems } = useSortState(storageList, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy]);

  const rows = currentPageItems.map((storage) => {
    const storageInfo = getStorageInfo(storage, associatedPlans);
    const { storageName, associatedPlanCount, storageStatus, s3Url } = storageInfo;
    return {
      cells: [
        storageName,
        {
          title: s3Url && (
            <a target="_blank" href={s3Url}>
              {s3Url}
            </a>
          ),
        },
        {
          title: <IconWithText icon={<LinkIcon color="#737679" />} text={associatedPlanCount} />,
        },
        {
          title: (
            <IconWithText
              icon={<StatusIcon isReady={storageStatus} />}
              text={storageStatus ? `Connected` : `Connection Failed`}
            />
          ),
        },
        {
          title: (
            <StorageActionsDropdown
              storageInfo={storageInfo}
              removeStorage={removeStorage}
              toggleAddEditModal={toggleAddEditModal}
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
          <Button id="add-storage-btn" onClick={toggleAddEditModal} variant="secondary">
            Add replication repository
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination widgetId="storages-table-pagination-top" {...paginationProps} />
        </LevelItem>
      </Level>
      <Table
        aria-label="Replication repositories table"
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
        widgetId="storages-table-pagination-bottom"
        variant="bottom"
        className={spacing.mtMd}
        {...paginationProps}
      />
    </>
  );
};

export default StoragesTable;
