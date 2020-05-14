import React, { useState, useContext } from 'react';
import { PlanContext } from '../../../duck/context';
import {
  KebabToggle,
  DropdownItem,
  Dropdown,
  DropdownPosition,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { IMigrationWithStatus } from './types';

interface IProps {
  migration: IMigrationWithStatus;
}

const MigrationActions: React.FunctionComponent<IProps> = ({ migration }) => {
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const planContext = useContext(PlanContext);

  return (
    <Flex>
      <FlexItem>
        <Dropdown
          toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
          isOpen={kebabIsOpen}
          isPlain
          dropdownItems={[
            <DropdownItem
              onClick={() => {
                setKebabIsOpen(false);
                planContext.handleMigrationCancelRequest(migration.metadata.name);
              }}
              key={`cancelMigration-${migration.metadata.name}`}
              isDisabled={
                planContext.isCancelling ||
                migration.tableStatus.isSucceeded ||
                migration.tableStatus.isFailed ||
                migration.tableStatus.stepName === 'Canceled'
              }
            >
              Cancel
            </DropdownItem>,
          ]}
          position={DropdownPosition.right}
        />
      </FlexItem>
    </Flex>
  );
};

export default MigrationActions;
