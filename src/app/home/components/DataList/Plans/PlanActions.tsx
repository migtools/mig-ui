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
    let hasRunningMigrations = null;
    let finalMigrationComplete = null;
    let hasSucceededMigration = null;
    let hasClosedCondition = null;

    if (plan.MigPlan.status) {
      hasClosedCondition = plan.MigPlan.spec.closed;
      hasReadyCondition = !!plan.MigPlan.status.conditions.filter(c => c.type === 'Ready').length;
      hasErrorCondition = !!plan.MigPlan.status.conditions.filter(c => c.category === 'Critical')
        .length;

      if (plan.Migrations.length) {
        hasRunningMigrations = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.status.conditions.some(c => c.type === 'Running');
          }
        }).length;

        hasSucceededMigration = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.status.conditions.some(c => c.type === 'Succeeded');
          }
        }).length;

        finalMigrationComplete = !!plan.Migrations.filter(m => {
          if (m.status) {
            return m.spec.stage === false && hasSucceededMigration;
          }
        }).length;
      }

      return (
        hasClosedCondition ||
        !hasReadyCondition ||
        hasErrorCondition ||
        hasRunningMigrations ||
        finalMigrationComplete
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
