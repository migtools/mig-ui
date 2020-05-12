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
import { IMigration } from './types';

interface IProps {
  migration: IMigration;
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
              isDisabled={migration.tableStatus.isSucceeded || migration.tableStatus.isFailed}
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
