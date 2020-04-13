import { useState } from 'react';
import { PaginationProps } from '@patternfly/react-core';
import { IFilterValues } from '../components/FilterToolbar';
import { ISortBy, SortByDirection } from '@patternfly/react-table';

export const useFilterState = (items: object[]) => {
  const [filterValues, setFilterValues] = useState<IFilterValues>({});

  const filteredItems = items.filter(item =>
    Object.keys(filterValues).every(categoryKey => {
      const values = filterValues[categoryKey];
      if (!values || values.length === 0) return true;
      const itemValue = item[categoryKey];
      return values.every(filterValue => !itemValue || itemValue.indexOf(filterValue) !== -1);
    })
  );

  return { filterValues, setFilterValues, filteredItems };
};

export const useSortState = (items: object[], sortKeys: string[]) => {
  const [sortBy, setSortBy] = useState<ISortBy>({});
  const onSort = (event: React.SyntheticEvent, index: number, direction: SortByDirection) => {
    setSortBy({ index, direction });
  };

  const sortedItems = items.sort((a: object, b: object) => {
    const { index, direction } = sortBy;
    const key = sortKeys[index];
    if (a[key] < b[key]) return direction === SortByDirection.asc ? -1 : 1;
    if (a[key] > b[key]) return direction === SortByDirection.asc ? 1 : -1;
    return 0;
  });

  return { sortBy, onSort, sortedItems };
};

export const usePaginationState = (items: any[], initialItemsPerPage: number) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const pageStartIndex = (pageNumber - 1) * itemsPerPage;
  const currentPageItems = items.slice(pageStartIndex, pageStartIndex + itemsPerPage);

  const paginationProps: PaginationProps = {
    itemCount: items.length,
    perPage: itemsPerPage,
    page: pageNumber,
    onSetPage: (event, pageNumber) => setPageNumber(pageNumber),
    onPerPageSelect: (event, perPage) => setItemsPerPage(perPage),
  };

  return { currentPageItems, setPageNumber, paginationProps };
};
