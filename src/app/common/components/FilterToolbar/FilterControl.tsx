import React from 'react';

import { IFilterCategory, FilterValue, FilterType } from './FilterToolbar';
import SelectFilterControl from './SelectFilterControl';
import SearchFilterControl from './SearchFilterControl';

export interface IFilterControlProps {
  category: IFilterCategory;
  value: FilterValue;
  setValue: (newValue: FilterValue) => void;
}

export const FilterControl: React.FunctionComponent<IFilterControlProps> = ({
  category,
  ...props
}) => {
  if (category.type === FilterType.select) {
    return <SelectFilterControl category={category} {...props} />;
  }
  if (category.type === FilterType.search) {
    return <SearchFilterControl category={category} {...props} />;
  }
  return null;
};
