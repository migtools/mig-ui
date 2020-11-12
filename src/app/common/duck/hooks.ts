import { useState, useRef, useEffect } from 'react';
import { PaginationProps } from '@patternfly/react-core';
import { IFilterValues, FilterCategory } from '../components/FilterToolbar';
import { ISortBy, SortByDirection } from '@patternfly/react-table';

// TODO these could be given generic types to avoid using `any` (https://www.typescriptlang.org/docs/handbook/generics.html)

export const useFilterState = (items: any[], filterCategories: FilterCategory[]) => {
  const [filterValues, setFilterValues] = useState<IFilterValues>({});

  const filteredItems = items.filter((item) =>
    Object.keys(filterValues).every((categoryKey) => {
      const values = filterValues[categoryKey];
      if (!values || values.length === 0) return true;
      const filterCategory = filterCategories.find((category) => category.key === categoryKey);
      let itemValue = item[categoryKey];
      if (filterCategory.getItemValue) {
        itemValue = filterCategory.getItemValue(item);
      }
      return values.every((filterValue) => {
        if (!itemValue) return false;
        const lowerCaseItemValue = String(itemValue).toLowerCase();
        const lowerCaseFilterValue = String(filterValue).toLowerCase();
        return lowerCaseItemValue.indexOf(lowerCaseFilterValue) !== -1;
      });
    })
  );

  return { filterValues, setFilterValues, filteredItems };
};

export const useSortState = (
  items: any[],
  getSortValues: (item: any) => (string | number | boolean)[]
) => {
  const [sortBy, setSortBy] = useState<ISortBy>({});
  const onSort = (event: React.SyntheticEvent, index: number, direction: SortByDirection) => {
    setSortBy({ index, direction });
  };

  const sortedItems = [...items].sort((a: any, b: any) => {
    const { index, direction } = sortBy;
    const aValue = getSortValues(a)[index];
    const bValue = getSortValues(b)[index];
    if (aValue < bValue) return direction === SortByDirection.asc ? -1 : 1;
    if (aValue > bValue) return direction === SortByDirection.asc ? 1 : -1;
    return 0;
  });

  return { sortBy, onSort, sortedItems };
};

export const useForcedValidationOnChange = <T>(
  values: T,
  isEdit: boolean,
  validateForm: () => void
) => {
  // This is a hack to fix https://github.com/konveyor/mig-ui/issues/941.
  // TODO: We should either figure out how to let Formik properly validate itself on Select elements,
  //       or we should replace Formik.
  const lastValidatedValuesRef = useRef<T>(values);
  useEffect(() => {
    if (values !== lastValidatedValuesRef.current || isEdit) {
      validateForm();
      lastValidatedValuesRef.current = values;
    }
  }, [values]);
};
