import React from 'react';
import { Button } from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import { Flex, Box } from '@rebass/emotion';
import PlanStatus from './PlanStatus';
import MigrateModal from '../../../../plan/components/MigrateModal';

const PlanActions = ({ plan, isLoading, ...props }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);

  return (
    <Flex>
      <Box m="auto 70px auto 0">
        <PlanStatus plan={plan.planState} {...this.props} />
      </Box>
      <Box mx={1}>
        <Button
          isDisabled={isLoading}
          variant="primary"
          onClick={() => this.props.onStageTriggered(plan)}
        >
          Stage
        </Button>
      </Box>
      <Box mx={1}>
        <Button isDisabled={isLoading} variant="primary" onClick={toggleOpen}>
          Migrate
        </Button>
        <MigrateModal plan={plan} isOpen={isOpen} onHandleClose={toggleOpen} />
      </Box>
    </Flex>
  );
};

export default PlanActions;
