import React, { useState } from 'react';
import {
  SelectOptionProps,
  DataToolbar,
  DataToolbarContent,
  DataToolbarToggleGroup,
  DataToolbarItem,
  Dropdown,
  DropdownToggle,
  DropdownItem,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { FilterControl } from './FilterControl';

export enum FilterType {
  select = 'select',
  search = 'search',
}

export type FilterValue = string[];

export interface OptionPropsWithKey extends SelectOptionProps {
  key: string;
}

export interface IBasicFilterCategory {
  key: string;
  title: string;
  type: FilterType; // If we want to support arbitrary filter types, this could be a React node that consumes context instead of an enum
  getItemValue?: (item: any) => any;
}

export interface ISelectFilterCategory extends IBasicFilterCategory {
  selectOptions: OptionPropsWithKey[];
}

export interface ISearchFilterCategory extends IBasicFilterCategory {
  placeholderText: string;
}

export type FilterCategory = ISearchFilterCategory | ISelectFilterCategory;

export interface IFilterValues {
  [categoryKey: string]: FilterValue;
}

export interface IFilterToolbarProps {
  filterCategories: FilterCategory[];
  filterValues: IFilterValues;
  setFilterValues: (values: IFilterValues) => void;
}

export const FilterToolbar: React.FunctionComponent<IFilterToolbarProps> = ({
  filterCategories,
  filterValues,
  setFilterValues,
}: IFilterToolbarProps) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [currentCategoryKey, setCurrentCategoryKey] = useState(filterCategories[0].key);

  const onCategorySelect = (category) => {
    setCurrentCategoryKey(category.key);
    setIsCategoryDropdownOpen(false);
  };

  const setFilterValue = (category: FilterCategory, newValue: FilterValue) =>
    setFilterValues({ ...filterValues, [category.key]: newValue });

  const currentFilterCategory = filterCategories.find(
    (category) => category.key === currentCategoryKey
  );

  return (
    <DataToolbar id="pv-table-filter-toolbar" clearAllFilters={() => setFilterValues({})}>
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
              dropdownItems={filterCategories.map((category) => (
                <DropdownItem key={category.key} onClick={() => onCategorySelect(category)}>
                  {category.title}
                </DropdownItem>
              ))}
            />
          </DataToolbarItem>
          {filterCategories.map((category) => (
            <FilterControl
              key={category.key}
              category={category}
              filterValue={filterValues[category.key]}
              setFilterValue={(newValue) => setFilterValue(category, newValue)}
              showToolbarItem={currentFilterCategory.key === category.key}
            />
          ))}
        </DataToolbarToggleGroup>
      </DataToolbarContent>
    </DataToolbar>
  );
};
