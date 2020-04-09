import { useState } from 'react';
import { PaginationProps } from '@patternfly/react-core';
import { IFilterValues } from '../components/FilterToolbar';

export const useFilterState = (items: any[]) => {
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

export const usePaginationState = (items: any[], initialItemsPerPage: number) => {
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const pageStartIndex = (currentPageNumber - 1) * itemsPerPage;
  const currentPageItems = items.slice(pageStartIndex, pageStartIndex + itemsPerPage);

  const paginationProps: PaginationProps = {
    itemCount: items.length,
    perPage: itemsPerPage,
    page: currentPageNumber,
    onSetPage: (event, pageNumber) => setCurrentPageNumber(pageNumber),
    onPerPageSelect: (event, perPage) => setItemsPerPage(perPage),
  };

  return { currentPageItems, paginationProps };
};
