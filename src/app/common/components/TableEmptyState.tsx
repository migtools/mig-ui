import React from 'react';
import {
  Flex,
  FlexItem,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateIconProps,
  Title,
  EmptyStateBody,
  Button,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import flex from '@patternfly/react-styles/css/utilities/Flex/flex';

export interface ITableEmptyStateProps {
  icon?: EmptyStateIconProps['icon'];
  titleText?: string;
  bodyText?: string;
  onClearFiltersClick?: () => void;
  isHiddenActions?: boolean;
}

const TableEmptyState: React.FunctionComponent<ITableEmptyStateProps> = ({
  icon = SearchIcon,
  titleText = 'No results found',
  bodyText = 'No results match the filter criteria. Remove filters or clear all filters to show results.',
  onClearFiltersClick,
  isHiddenActions = false,
}: ITableEmptyStateProps) => (
  <Flex className={flex.justifyContentCenter}>
    <FlexItem>
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={icon} />
        <Title headingLevel="h5" size="lg">
          {titleText}
        </Title>
        <EmptyStateBody>{bodyText}</EmptyStateBody>
        {onClearFiltersClick && !isHiddenActions && (
          <Button variant="link" onClick={onClearFiltersClick}>
            Clear all filters
          </Button>
        )}
      </EmptyState>
    </FlexItem>
  </Flex>
);

export default TableEmptyState;
