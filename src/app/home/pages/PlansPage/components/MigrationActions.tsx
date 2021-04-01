import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  KebabToggle,
  DropdownItem,
  Dropdown,
  DropdownPosition,
  Flex,
  FlexItem,
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
            <Dropdown
              toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
              isOpen={kebabIsOpen}
              isPlain
              dropdownItems={[
                <DropdownItem
                  onClick={() => {
                    setKebabIsOpen(false);
                    dispatch(PlanActions.migrationCancelRequest(migration.metadata.name));
                  }}
                  key={`cancelMigration-${migration.metadata.name}`}
                  isDisabled={
                    migration.tableStatus.isSucceeded ||
                    migration.tableStatus.isSucceededWithWarnings ||
                    migration.tableStatus.isFailed ||
                    migration.tableStatus.stepName === 'Canceled'
                  }
                >
                  Cancel
                </DropdownItem>,
              ]}
              position={DropdownPosition.right}
            />
          )}
      </FlexItem>
    </Flex>
  );
};

export default MigrationActions;
