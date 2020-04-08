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
  Select,
  SelectOption,
  SelectOptionProps,
  TextInput,
  ButtonVariant,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
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

  ////////////////////////////////////////////////////////////////////////////////

  enum FilterType {
    select = 'select',
    search = 'search',
  }

  interface IFilterCategory {
    key: string;
    title: string;
    type: FilterType;
    selectOptions?: SelectOptionProps[]; // TODO only if select type?
    placeholderText?: string; // TODO only if select type?
  }

  interface IFilterControlProps {
    category: IFilterCategory;
    value: any; // TODO type this... SelectProps.selections? string? array?
  }

  const filterCategories: IFilterCategory[] = [
    {
      key: 'one',
      title: 'One',
      type: FilterType.select,
      selectOptions: [
        // TODO generate from data with helper
        {
          key: 'a',
          value: 'A',
        },
        {
          key: 'b',
          value: 'B',
        },
      ],
    },
    {
      key: 'two',
      title: 'Two',
      type: FilterType.search,
      placeholderText: 'Filter by two...',
    },
    {
      key: 'three',
      title: 'Three',
      type: FilterType.search,
      placeholderText: 'Filter by three...',
    },
  ];
  const [currentCategoryKey, setCurrentCategoryKey] = useState(filterCategories[0].key);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [filterValues, setFilterValues] = useState([]);

  const onCategorySelect = category => {
    setCurrentCategoryKey(category.key);
    setIsCategoryDropdownOpen(false);
  };

  const clearAllFilters = () => console.log('clearAllFilters!'); // TODO
  const onClearFilter = () => console.log('onClearFilter'); // TODO
  const onFilterChange = () => console.log('onFilterChange'); // TODO

  const currentFilterCategory = filterCategories.find(
    category => category.key === currentCategoryKey
  );

  const FilterControl: React.FunctionComponent<IFilterControlProps> = ({ category, value }) => {
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    // @ts-ignore
    const onFilterSelect = () => console.log('onFilterSelect', arguments);

    // TODO split into sub components?

    const [inputValue, setInputValue] = useState('');

    const onInputSubmit = () => console.log('TODO');

    // @ts-ignore
    const onInputChange = () => console.log('onInputChange', arguments);

    const onInputKeyDown = () => {
      onInputSubmit();
      // @ts-ignore
      console.log('onInputKeyDown', arguments);
    };

    if (category.type === FilterType.select) {
      return (
        <Select
          aria-label={category.title}
          onToggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          onSelect={onFilterSelect} // TODO ???
          selections={value}
          isExpanded={isFilterDropdownOpen}
          placeholderText="Any"
        >
          {category.selectOptions.map(optionProps => (
            <SelectOption {...optionProps} />
          ))}
        </Select>
      );
    }
    if (category.type === FilterType.search) {
      const id = `${category.key}-input`;
      return (
        <InputGroup>
          {/*
            // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
          <TextInput
            name={id}
            id={id}
            type="search"
            aria-label={`${category.title} filter`}
            onChange={onInputChange}
            value={inputValue}
            placeholder={category.placeholderText}
            onKeyDown={onInputKeyDown}
          />
          <Button
            variant={ButtonVariant.control}
            aria-label="search button for search input"
            onClick={onInputSubmit}
          >
            <SearchIcon />
          </Button>
        </InputGroup>
      );
    }
    return null;
  };

  const filterToolbar = (
    <DataToolbar id="pv-table-filter-toolbar" clearAllFilters={clearAllFilters}>
      <DataToolbarContent>
        <DataToolbarToggleGroup variant="filter-group" toggleIcon={<FilterIcon />} breakpoint="xl">
          <DataToolbarItem>
            <Dropdown
              toggle={
                <DropdownToggle onToggle={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}>
                  <FilterIcon /> {currentFilterCategory.title}
                </DropdownToggle>
              }
              isOpen={isCategoryDropdownOpen}
              dropdownItems={filterCategories.map(category => (
                // TODO properties for row property name and title
                <DropdownItem key={category.key} onClick={() => onCategorySelect(category)}>
                  {category.title}
                </DropdownItem>
              ))}
            />
          </DataToolbarItem>
          {filterCategories.map(category => (
            <DataToolbarFilter
              key={category.key}
              chips={filterValues[category.key]}
              deleteChip={onClearFilter}
              categoryName={category.title}
              showToolbarItem={currentFilterCategory.key === category.key}
            >
              <FilterControl category={category} value={filterValues[category.key]} />
            </DataToolbarFilter>
          ))}
        </DataToolbarToggleGroup>
      </DataToolbarContent>
    </DataToolbar>
  );

  const { currentPageItems, paginationProps } = usePaginationState(rows, 10);

  ////////////////////////////////////////////////////////////////////////////////

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
