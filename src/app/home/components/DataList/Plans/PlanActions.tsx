import React, { useState } from 'react';
import { Button } from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import { Flex, Box } from '@rebass/emotion';
import PlanStatus from './PlanStatus';
import MigrateModal from '../../../../plan/components/MigrateModal';

const PlanActions = ({ plan, isLoading, ...props }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  // const [is, toggleDisabled] = useOpenModal(false);
  const isDisabled = () => {
    let hasReadyCondition = null;
    let hasErrorCondition = null;
    let hasRunningCondition = null;
    let finalMigrationComplete = null;
    if (plan.MigPlan.status) {
      hasReadyCondition = plan.MigPlan.status.conditions.filter(c => c.type === 'Ready').length > 0;
      hasErrorCondition =
        plan.MigPlan.status.conditions.filter(c => c.category === 'Critical').length > 0;

      if (plan.Migrations.length > 0) {
        hasRunningCondition =
          plan.Migrations.filter(m => {
            if (m.status) {
              return m.status.migrationStarted === true;
            }
          }).length > 0;
        finalMigrationComplete =
          plan.Migrations.filter(m => {
            if (m.status) {
              return m.spec.stage === false && m.status.migrationCompleted === true;
            }
          }).length > 0;
      }

      return (
        !hasReadyCondition || hasErrorCondition || hasRunningCondition || finalMigrationComplete
      );
    } else {
      return true;
    }
  };
  return (
    <Flex>
      <Box m="auto auto auto 0">
        <PlanStatus plan={plan} {...this.props} />
      </Box>
      <Box mx={1}>
        <Button
          isDisabled={isDisabled() || isLoading}
          variant="primary"
          onClick={() => this.props.onStageTriggered(plan)}
        >
          Stage
        </Button>
      </Box>
      <Box mx={1}>
        <Button isDisabled={isDisabled() || isLoading} variant="primary" onClick={toggleOpen}>
          Migrate
        </Button>
        <MigrateModal plan={plan} isOpen={isOpen} onHandleClose={toggleOpen} />
      </Box>
    </Flex>
  );
};

export default PlanActions;
