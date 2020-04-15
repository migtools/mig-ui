import React from 'react';

import {
  FilterCategory,
  FilterValue,
  FilterType,
  ISelectFilterCategory,
  ISearchFilterCategory,
} from './FilterToolbar';
import SelectFilterControl from './SelectFilterControl';
import SearchFilterControl from './SearchFilterControl';

export interface IFilterControlProps {
  category: FilterCategory;
  filterValue: FilterValue;
  setFilterValue: (newValue: FilterValue) => void;
  showToolbarItem: boolean;
}

export const FilterControl: React.FunctionComponent<IFilterControlProps> = ({
  category,
  ...props
}: IFilterControlProps) => {
  if (category.type === FilterType.select) {
    return <SelectFilterControl category={category as ISelectFilterCategory} {...props} />;
  }
  if (category.type === FilterType.search) {
    return <SearchFilterControl category={category as ISearchFilterCategory} {...props} />;
  }
  return null;
};
