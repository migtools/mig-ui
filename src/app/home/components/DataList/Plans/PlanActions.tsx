import React from 'react';
import { Button } from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import { Flex, Box } from '@rebass/emotion';
import PlanStatus from './PlanStatus';
import MigrateModal from '../../../../plan/components/MigrateModal';

const PlanActions = ({ plan, isLoading, ...props }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  const checkDisabled = () => {
    // const disableMigrations = isMigrationRunning || plan.Closed || finalMigrationRunWithSuccess
    if (plan.Migrations && plan.MigPlan.status && plan.Migrations.length > 0) {
      if (plan.Migrations[0].status && plan.Migrations[0].status.phase) {
        const planMigStatus = plan.Migrations[0].status.phase;
        return planMigStatus !== 'Not Started';
      }
    } else if (plan.MigPlan.status) {
      const criticalConditions = plan.MigPlan.status.conditions.filter(
        (condition, i) => condition.category === 'Critical'
      );
      if (criticalConditions.length > 0) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  };
  return (
    <Flex>
      <Box m="auto auto auto 0">
        <PlanStatus plan={plan} {...this.props} />
      </Box>
      <Box mx={1}>
        <Button
          isDisabled={checkDisabled()}
          variant="primary"
          onClick={() => this.props.onStageTriggered(plan)}
        >
          Stage
        </Button>
      </Box>
      <Box mx={1}>
        <Button isDisabled={checkDisabled()} variant="primary" onClick={toggleOpen}>
          Migrate
        </Button>
        <MigrateModal plan={plan} isOpen={isOpen} onHandleClose={toggleOpen} />
      </Box>
    </Flex>
  );
};

export default PlanActions;
