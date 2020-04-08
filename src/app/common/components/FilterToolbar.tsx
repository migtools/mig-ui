import React, { useState } from 'react';
import {
  SelectOptionProps,
  Select,
  SelectOption,
  InputGroup,
  Button,
  ButtonVariant,
  DataToolbar,
  DataToolbarContent,
  DataToolbarToggleGroup,
  DataToolbarItem,
  Dropdown,
  DropdownToggle,
  DropdownItem,
  DataToolbarFilter,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';

export enum FilterType {
  select = 'select',
  search = 'search',
}

type FilterValue = any; // TODO.. SelectProps.selections? string? array?

export interface IFilterCategory {
  key: string;
  title: string;
  type: FilterType;
  selectOptions?: SelectOptionProps[]; // TODO only if select type?
  placeholderText?: string; // TODO only if select type?
}

interface IFilterValues {
  [categoryKey: string]: FilterValue;
}

interface IFilterControlProps {
  category: IFilterCategory;
  value: FilterValue;
}

interface IFilterToolbarProps {
  filterCategories: IFilterCategory[];
  filterValues: any[][]; // TODO type this...
  setFilterValues: (values: IFilterValues) => void;
}

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

const FilterToolbar: React.FunctionComponent<IFilterToolbarProps> = ({
  filterCategories,
  filterValues,
  setFilterValues,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState(filterCategories[0].key);

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

  return (
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
};

export default FilterToolbar;
