import { useState } from 'react';
import { PaginationProps } from '@patternfly/react-core';

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
