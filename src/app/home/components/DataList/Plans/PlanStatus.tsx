import React from 'react';
import PlanStatusIcon from '../../Card/Status/PlanStatusIcon';
import { Flex, FlexItem } from '@patternfly/react-core';

interface IProps {
  plan: any;
}

const PlanStatus: React.FunctionComponent<IProps> = ({ plan }) => {
  const {
    hasClosedCondition,
    hasReadyCondition,
    hasNotReadyCondition,
    hasRunningMigrations,
    hasSucceededMigration,
    hasSucceededStage,
    hasCanceledCondition,
    hasCancelingCondition,
    latestType,
    latestIsFailed,
    hasConflictCondition,
    conflictErrorMsg,
    isPlanLocked,
  } = plan.PlanStatus;

  const getStatus = () => {
    const status = { text: 'Waiting for status...' };
    if (latestIsFailed) {
      status.text = `${latestType} Failed`;
    } else if (hasClosedCondition) {
      status.text = 'Closed';
    } else if (hasConflictCondition) {
      status.text = conflictErrorMsg;
    } else if (hasCancelingCondition) {
      status.text = `Canceling ${latestType}`;
    } else if (hasRunningMigrations) {
      status.text = `${latestType} Running`;
    } else if (hasCanceledCondition) {
      status.text = `${latestType} canceled`;
    } else if (hasSucceededMigration) {
      status.text = `Migration Succeeded`;
    } else if (hasSucceededStage) {
      status.text = `Stage Succeeded`;
    } else if (hasNotReadyCondition || !hasReadyCondition) {
      status.text = 'Not Ready';
    } else if (hasReadyCondition) {
      status.text = 'Ready';
    }
    if (isPlanLocked) {
      status.text = 'Pending';
    }
    return status;
  };
  return (
    <Flex>
      <FlexItem>
        <PlanStatusIcon plan={plan} />
      </FlexItem>
      <FlexItem>{getStatus().text}</FlexItem>
    </Flex>
  );
};

export default PlanStatus;
