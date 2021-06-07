import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  KebabToggle,
  DropdownItem,
  Dropdown,
  DropdownPosition,
  Flex,
  FlexItem,
  Button,
} from '@patternfly/react-core';
import { IMigration } from '../../../../plan/duck/types';
import { PlanActions } from '../../../../plan/duck';

interface IProps {
  migration: IMigration;
}

const MigrationActions: React.FunctionComponent<IProps> = ({ migration }) => {
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const dispatch = useDispatch();

  return (
    <Flex>
      <FlexItem>
        {!migration.tableStatus.isSucceeded &&
          !migration.tableStatus.isCanceled &&
          !migration.tableStatus.isCanceling && (
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(PlanActions.migrationCancelRequest(migration.metadata.name));
              }}
              isDisabled={
                migration.tableStatus.isSucceeded ||
                migration.tableStatus.isSucceededWithWarnings ||
                migration.tableStatus.isFailed ||
                migration.tableStatus.stepName === 'Canceled'
              }
              key={`cancelMigration-${migration.metadata.name}`}
            >
              Cancel
            </Button>
          )}
      </FlexItem>
    </Flex>
  );
};

export default MigrationActions;
