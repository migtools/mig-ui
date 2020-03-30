import React, { useState } from 'react';
import Select from 'react-select';
import {
  TextContent,
  Text,
  TextVariants,
  Popover,
  PopoverPosition,
  Title,
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Grid,
  GridItem,
  PaginationProps,
  Pagination,
  PaginationVariant,
  DropdownDirection,
} from '@patternfly/react-core';
import ReactJson from 'react-json-view';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { Table, TableVariant, TableHeader, TableBody } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

const styles = require('./VolumesTable.module');

const capitalize = (s: string) => {
  if (s.charAt(0)) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  } else {
    return s;
  }
};

const VolumesTable = (props): any => {
  // TODO add a typescript interface for these props
  const { isFetchingPVResources, pvResourceList, persistentVolumes, onTypeChange } = props;

  const columns = [
    { title: 'PV name' },
    { title: 'Claim' },
    { title: 'Namespace' },
    { title: 'Storage class' },
    { title: 'Size' },
    { title: 'Migration type' },
    { title: 'Details' },
  ];

  const rows = persistentVolumes.map((pv, pvIndex) => {
    const matchingPVResource = pvResourceList.find(pvResource => pvResource.name === pv.name);
    return {
      cells: [
        pv.name,
        pv.claim,
        pv.project,
        pv.storageClass,
        pv.size,
        {
          title: (
            // TODO replace with PatternFly Select (SimpleSelect)
            <Select
              onChange={(option: any) => onTypeChange(pvIndex, option.value)}
              options={pv.supportedActions.map((a: string) => {
                // NOTE: Each PV may not support all actions (any at all even),
                // we need to inspect the PV to determine this
                return { value: a, label: capitalize(a) };
              })}
              name="persistentVolumes"
              value={{
                label: capitalize(pv.type),
                value: pv.type,
              }}
            />
          ),
        },
        {
          title: (
            <Popover
              className={styles.jsonPopover}
              position={PopoverPosition.bottom}
              bodyContent={
                matchingPVResource ? (
                  <ReactJson src={matchingPVResource} enableClipboard={false} />
                ) : (
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={WarningTriangleIcon} />
                    <Title headingLevel="h5" size="sm">
                      No PV data found
                    </Title>
                    <EmptyStateBody>Unable to retrieve PV data</EmptyStateBody>
                  </EmptyState>
                )
              }
              aria-label="pv-details"
              closeBtnAriaLabel="close-pv-details"
              maxWidth="200rem"
            >
              <Button isDisabled={isFetchingPVResources} variant="link">
                View JSON
              </Button>
            </Popover>
          ),
        },
      ],
    };
  });

  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const pageStartIndex = (currentPageNumber - 1) * itemsPerPage;
  const currentPageRows = rows.slice(pageStartIndex, pageStartIndex + itemsPerPage);

  const paginationProps: PaginationProps = {
    itemCount: rows.length,
    perPage: itemsPerPage,
    page: currentPageNumber,
    onSetPage: (event, pageNumber) => setCurrentPageNumber(pageNumber),
    onPerPageSelect: (event, perPage) => setItemsPerPage(perPage),
  };

  return (
    <Grid gutter="md">
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>Choose to move or copy persistent volumes:</Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <Pagination widgetId="pv-table-pagination-top" {...paginationProps} />
        <Table
          aria-label="Persistent volumes table"
          variant={TableVariant.compact}
          cells={columns}
          rows={currentPageRows}
        >
          <TableHeader />
          <TableBody />
        </Table>
        <Pagination
          widgetId="pv-table-pagination-bottom"
          variant={PaginationVariant.bottom}
          className={spacing.mtMd}
          {...paginationProps}
        />
      </GridItem>
    </Grid>
  );
};

export default VolumesTable;
