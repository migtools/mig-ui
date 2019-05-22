import React from 'react';
import { Progress, ProgressSize } from '@patternfly/react-core';
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  KebabToggle,
  Button,
  DataListItemCells,
  DataListAction,
} from '@patternfly/react-core';
import { useOpenDropdown, useOpenModal } from '../../../duck/hooks';
import { Flex, Box } from '@rebass/emotion';
import PlanStatus from './PlanStatus';
import MigrateModal from '../../../../plan/components/MigrateModal';
import MigrateAction from './MigrateAction';

const PlanActions = ({ plan, isLoading, ...props }) => {
  const [isOpen, toggleOpen] = useOpenDropdown(false);
  const [isModalOpen, toggleModalOpen] = useOpenModal(false);

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
