/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useContext } from 'react';
import { PlanContext } from '../../../duck/context';
import { Button } from '@patternfly/react-core';
import { useOpenModal } from '../../../duck/hooks';
import { Flex, Box } from '@rebass/emotion';
import PlanStatus from './PlanStatus';
import MigrateModal from '../../../../plan/components/MigrateModal';
import theme from '../../../../../theme';
import Loader from 'react-loader-spinner';
import { css } from '@emotion/core';
const PlanActions = ({ plan, isLoading }) => {
  const [isOpen, toggleOpen] = useOpenModal(false);
  const planContext = useContext(PlanContext);
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasErrorCondition,
    hasRunningMigrations,
    hasSucceededMigration,
    finalMigrationComplete,
  } = plan.PlanStatus;

  return (
    <Flex>
      <Box m="auto auto auto 0">
        <PlanStatus plan={plan} />
      </Box>
      <Box mx={1}>
        <Button
          isDisabled={
            hasClosedCondition ||
            !hasReadyCondition ||
            hasErrorCondition ||
            hasRunningMigrations ||
            finalMigrationComplete ||
            isLoading
          }
          variant="primary"
          onClick={() => {
            planContext.handleStageTriggered(plan);
          }}
        >
          Stage
        </Button>
      </Box>
      <Box mx={1}>
        <Button
          isDisabled={
            hasClosedCondition ||
            !hasReadyCondition ||
            hasErrorCondition ||
            hasRunningMigrations ||
            finalMigrationComplete ||
            isLoading
          }
          variant="primary"
          onClick={toggleOpen}
        >
          Migrate
        </Button>
        <MigrateModal plan={plan} isOpen={isOpen} onHandleClose={toggleOpen} />
      </Box>
      {isLoading && (
        <Box
          css={css`
            height: 100%;
            text-align: center;
            margin: auto 4px auto 4px;
            width: 1em;
          `}
        >
          <Loader type="ThreeDots" color={theme.colors.navy} height="100%" width="100%" />
        </Box>
      )}
    </Flex>
  );
};

export default PlanActions;
