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
import { IMigration } from '../../../../plan/duck/types';

interface IProps {
  migration: IMigration;
  handleMigrationCancelRequest: (name: string) => void;
}

const MigrationActions: React.FunctionComponent<IProps> = ({
  migration,
  handleMigrationCancelRequest,
}) => {
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const planContext = useContext(PlanContext);

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
                    handleMigrationCancelRequest(migration.metadata.name);
                  }}
                  key={`cancelMigration-${migration.metadata.name}`}
                  isDisabled={
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
          )}
      </FlexItem>
    </Flex>
  );
};

export default MigrationActions;
