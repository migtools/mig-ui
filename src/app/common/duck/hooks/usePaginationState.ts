import * as React from 'react';
import { PaginationProps } from '@patternfly/react-core';

// TODO these could be given generic types to avoid using `any` (https://www.typescriptlang.org/docs/handbook/generics.html)

export type PaginationStateProps = Pick<
  PaginationProps,
  'itemCount' | 'perPage' | 'page' | 'onSetPage' | 'onPerPageSelect'
>;

export interface IPaginationStateHook {
  currentPageItems: any[];
  setPageNumber: (pageNumber: number) => void;
  paginationProps: PaginationStateProps;
}

export const usePaginationState = (
  items: any[],
  initialItemsPerPage: number
): IPaginationStateHook => {
  const [pageNumber, setPageNumber] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(initialItemsPerPage);

  const pageStartIndex = (pageNumber - 1) * itemsPerPage;
  const currentPageItems = items.slice(pageStartIndex, pageStartIndex + itemsPerPage);

  const paginationProps: PaginationStateProps = {
    itemCount: items.length,
    perPage: itemsPerPage,
    page: pageNumber,
    onSetPage: (event, pageNumber) => setPageNumber(pageNumber),
    onPerPageSelect: (event, perPage) => setItemsPerPage(perPage),
  };

  return { currentPageItems, setPageNumber, paginationProps };
};
