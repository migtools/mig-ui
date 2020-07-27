import React, { useEffect } from 'react';
import { Button, Pagination, Level, LevelItem } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable, classNames } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import tableStyles from '@patternfly/react-styles/css/components/Table/table';
import { usePaginationState, useSortState } from '../../../../common/duck/hooks';
import StatusIcon, { StatusType } from '../../../../common/components/StatusIcon';
import IconWithText from '../../../../common/components/IconWithText';
import { IToken } from '../../../../token/duck/types';
import { getTokenInfo } from '../helpers';
import TokenActionsDropdown from './TokenActionsDropdown';

interface ITokensTableProps {
  tokenList: IToken[];
  toggleAddEditTokenModal: () => void;
  removeToken: (tokenName: string) => void;
  watchTokenAddEditStatus: (tokenName: string) => void;
  setCurrentToken: (currentToken: IToken) => void;
}

const TokensTable: React.FunctionComponent<ITokensTableProps> = ({
  tokenList,
  toggleAddEditTokenModal,
  removeToken,
  watchTokenAddEditStatus,
  setCurrentToken,
}: ITokensTableProps) => {
  const columns = [
    { title: 'Name', transforms: [sortable] },
    { title: 'Type', transforms: [sortable] },
    { title: 'Associated cluster', transforms: [sortable] },
    { title: 'Expiration', transforms: [sortable] },
    { title: 'Status', transforms: [sortable] },
    { title: '', columnTransforms: [classNames(tableStyles.tableAction)] },
  ];

  const getSortValues = (token: IToken) => {
    const {
      tokenName,
      type,
      associatedClusterName,
      expirationTimestamp,
      tokenStatus,
    } = getTokenInfo(token);
    return [tokenName, type, associatedClusterName, expirationTimestamp, tokenStatus, ''];
  };

  const { sortBy, onSort, sortedItems } = useSortState(tokenList, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy]);

  const rows = currentPageItems.map((token: IToken) => {
    const {
      tokenName,
      type,
      associatedClusterName,
      formattedExpiration,
      tokenStatus,
    } = getTokenInfo(token);
    return {
      cells: [
        tokenName,
        type,
        associatedClusterName,
        formattedExpiration,
        {
          title: (
            <IconWithText
              icon={<StatusIcon status={tokenStatus ? StatusType.OK : StatusType.ERROR} />}
              text={tokenStatus ? 'Connected' : 'ConnectionFailed'}
            />
          ),
        },
        {
          title: (
            <TokenActionsDropdown
              associatedClusterName={associatedClusterName}
              token={token}
              removeToken={removeToken}
              toggleAddEditTokenModal={toggleAddEditTokenModal}
              watchTokenAddEditStatus={watchTokenAddEditStatus}
              setCurrentToken={setCurrentToken}
            />
          ),
        },
      ],
    };
  });

  return (
    <>
      <Level>
        <LevelItem>
          <Button id="add-token-btn" onClick={toggleAddEditTokenModal} variant="secondary">
            Add token
          </Button>
        </LevelItem>
        <LevelItem>
          <Pagination widgetId="tokens-table-pagination-top" {...paginationProps} />
        </LevelItem>
      </Level>
      <Table
        aria-label="Tokens table"
        cells={columns}
        rows={rows}
        sortBy={sortBy}
        onSort={onSort}
        className={`${spacing.mtMd} ${spacing.mbMd}`}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        widgetId="tokens-table-pagination-bottom"
        variant="bottom"
        className={spacing.mtMd}
        {...paginationProps}
      />
    </>
  );
};

export default TokensTable;
