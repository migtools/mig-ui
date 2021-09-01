import * as React from 'react';
import { PaginationProps } from '@patternfly/react-core';

// TODO these could be given generic types to avoid using `any` (https://www.typescriptlang.org/docs/handbook/generics.html)

export type PaginationStateProps = Pick<
  PaginationProps,
  'itemCount' | 'perPage' | 'page' | 'onSetPage' | 'onPerPageSelect'
>;

export interface IPaginationStateHook<T> {
  currentPageItems: T[];
  setPageNumber: (pageNumber: number) => void;
  paginationProps: PaginationStateProps;
}

export const usePaginationState = <T>(
  items: T[],
  initialItemsPerPage: number
): IPaginationStateHook<T> => {
  const [pageNumber, setPageNumber] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const pageStartIndex = (pageNumber - 1) * itemsPerPage;
  let currentPageItems;
  currentPageItems = items.slice(pageStartIndex, pageStartIndex + itemsPerPage);

  if (currentPageItems.length === 0 && !!items.length) {
    currentPageItems = items.slice(0, pageStartIndex + itemsPerPage);
    setPageNumber(1);
  }
  const paginationProps: PaginationStateProps = {
    itemCount: items.length,
    perPage: itemsPerPage,
    page: pageNumber,
    onSetPage: (event, pageNumber) => setPageNumber(pageNumber),
    onPerPageSelect: (event, perPage) => setItemsPerPage(perPage),
  };

  return { currentPageItems, setPageNumber, paginationProps };
};
