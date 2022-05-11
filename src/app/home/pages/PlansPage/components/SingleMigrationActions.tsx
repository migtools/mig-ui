import React from 'react';
import { useDispatch } from 'react-redux';
import { Flex, FlexItem, Button } from '@patternfly/react-core';
import { IMigration } from '../../../../plan/duck/types';
import { PlanActions } from '../../../../plan/duck';

interface IProps {
  migration: IMigration;
}

const SingleMigrationActions: React.FunctionComponent<IProps> = ({ migration }) => {
  const dispatch = useDispatch();

  return (
    <Flex>
      <FlexItem>
        {!migration.tableStatus.isSucceeded &&
          !migration.tableStatus.isSucceededWithWarnings &&
          !migration.tableStatus.isFailed &&
          migration.tableStatus.stepName !== 'Canceled' &&
          !migration.tableStatus.isCanceled &&
          !migration.tableStatus.isCanceling && (
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(PlanActions.migrationCancelRequest(migration.metadata.name));
              }}
              key={`cancelMigration-${migration.metadata.name}`}
            >
              Cancel
            </Button>
          )}
      </FlexItem>
    </Flex>
  );
};

export default SingleMigrationActions;
