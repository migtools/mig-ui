import React, { useState } from 'react';
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
  Pagination,
  PaginationVariant,
  SelectOptionObject,
  Level,
  LevelItem,
  DataToolbar,
  DataToolbarContent,
  DataToolbarToggleGroup,
  DataToolbarItem,
  DataToolbarFilter,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  InputGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { Table, TableVariant, TableHeader, TableBody } from '@patternfly/react-table';
import ReactJson from 'react-json-view';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import SimpleSelect from '../../../common/components/SimpleSelect';
import { usePaginationState } from '../../../common/duck/hooks';
import { IFormValues, IOtherProps } from './WizardContainer';

const styles = require('./VolumesTable.module');

interface IVolumesTableProps
  extends Pick<IOtherProps, 'isFetchingPVResources' | 'pvResourceList'>,
    Pick<IFormValues, 'persistentVolumes'> {
  onTypeChange: (pvIndex: number, value: string) => void;
}

interface OptionWithValue extends SelectOptionObject {
  value: string;
}

const capitalize = (s: string) => {
  if (s.charAt(0)) {
    return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
  } else {
    return s;
  }
};

const VolumesTable: React.FunctionComponent<IVolumesTableProps> = ({
  isFetchingPVResources,
  pvResourceList,
  persistentVolumes,
  onTypeChange,
}: IVolumesTableProps) => {
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
    const migrationTypeOptions = pv.supportedActions.map(
      (action: string) =>
        ({
          value: action,
          toString: () => capitalize(action),
        } as OptionWithValue)
    );
    return {
      cells: [
        pv.name,
        pv.claim,
        pv.project,
        pv.storageClass,
        pv.size,
        {
          title: (
            <SimpleSelect
              aria-label="Select migration type"
              onChange={(option: OptionWithValue) => onTypeChange(pvIndex, option.value)}
              options={migrationTypeOptions}
              value={migrationTypeOptions.find(option => option.value === pv.type)}
              placeholderText={null}
            />
          ),
          key: pv.type,
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

  const [isCategoryDropdownOpen] = useState(false);
  const clearAllFilters = () => console.log('clearAllFilters!');
  const onCategorySelect = () => console.log('onCategorySelect!');
  const onCategoryToggle = () => console.log('onCategoryToggle!');
  const onClearFilter = () => console.log('onClearFilter');
  const filterCategories = [
    {
      key: 'one',
      title: 'One',
    },
    {
      key: 'two',
      title: 'Two',
    },
    {
      key: 'three',
      title: 'Three',
    },
  ];
  const currentFilterCategory = filterCategories[0];
  const filterChips = [];

  const filterToolbar = (
    <DataToolbar id="pv-table-filter-toolbar" clearAllFilters={clearAllFilters}>
      <DataToolbarContent>
        <DataToolbarToggleGroup variant="filter-group" toggleIcon={<FilterIcon />} breakpoint="xl">
          <DataToolbarItem>
            <Dropdown // TODO use SimpleSelect instead? change it so it can use children?
              onSelect={onCategorySelect}
              toggle={
                <DropdownToggle onToggle={onCategoryToggle}>
                  <FilterIcon /> {currentFilterCategory.title}
                </DropdownToggle>
              }
              isOpen={isCategoryDropdownOpen}
              dropdownItems={filterCategories.map(category => (
                // TODO properties for row property name and title
                <DropdownItem key={category.key}>{category.title}</DropdownItem>
              ))}
            />
          </DataToolbarItem>
          {filterCategories.map(category => (
            <DataToolbarFilter
              key={category.key}
              chips={filterChips[category.key]}
              deleteChip={onClearFilter}
              categoryName={category.title}
              showToolbarItem={currentFilterCategory.key === category.key}
            >
              <InputGroup>TODO</InputGroup>
            </DataToolbarFilter>
          ))}
        </DataToolbarToggleGroup>
      </DataToolbarContent>
    </DataToolbar>
  );

  const { currentPageItems, paginationProps } = usePaginationState(rows, 10);

  // TODO: filters
  // TODO: sorting

  return (
    <Grid gutter="md">
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>Choose to move or copy persistent volumes:</Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <Level>
          <LevelItem>{filterToolbar}</LevelItem>
          <LevelItem>
            <Pagination widgetId="pv-table-pagination-top" {...paginationProps} />
          </LevelItem>
        </Level>
        <Table
          aria-label="Persistent volumes table"
          variant={TableVariant.compact}
          cells={columns}
          rows={currentPageItems}
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
