import React from 'react';

import WarningTriangleIcon from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';
import OutlinedCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import ResourcesAlmostEmptyIcon from '@patternfly/react-icons/dist/js/icons/resources-almost-empty-icon';
import ResourcesFullIcon from '@patternfly/react-icons/dist/js/icons/resources-full-icon';

import { Popover, PopoverPosition } from '@patternfly/react-core';

import { Spinner } from '@patternfly/react-core';
import { IPlan } from '../../../../plan/duck/types';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface IProps {
  plan: IPlan;
}

const PlanStatusIcon: React.FunctionComponent<IProps> = ({ plan }) => {
  const {
    hasRunningMigrations,
    hasNotReadyCondition,
    hasSucceededStage,
    hasSucceededMigration,
    hasSucceededMigrationWithWarnings,
    hasSucceededStageWithWarnings,
    isPlanLocked,
    hasConflictCondition,
    latestIsFailed,
    hasCriticalCondition,
    hasWarnCondition,
  } = plan.PlanStatus;

  if (latestIsFailed || hasCriticalCondition) {
    return (
      <span className="pf-c-icon pf-m-danger">
        <ExclamationCircleIcon />
      </span>
    );
  } else if (hasConflictCondition) {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent="Migration plan conflicts occur when multiple plans share the same namespace. You cannot stage or migrate a plan with a conflict. Delete one of the plans to resolve the conflict."
        aria-label="warning-details"
        closeBtnAriaLabel="close-warning-details"
        maxWidth="200rem"
      >
        <span className={`pf-c-icon pf-m-warning`}>
          <ExclamationTriangleIcon />
        </span>
      </Popover>
    );
  } else if (hasNotReadyCondition) {
    return (
      <span className={`pf-c-icon pf-m-warning`}>
        <ExclamationTriangleIcon />
      </span>
    );
  } else if (hasRunningMigrations || isPlanLocked) {
    return <Spinner size="md" />;
  } else if (
    (hasSucceededMigration && hasWarnCondition) ||
    (hasSucceededStage && hasWarnCondition) ||
    hasSucceededMigrationWithWarnings ||
    hasSucceededStageWithWarnings
  ) {
    return (
      <span className={`pf-c-icon pf-m-warning`}>
        <ExclamationTriangleIcon />
      </span>
    );
  } else if (hasSucceededMigration) {
    return (
      <span className="pf-c-icon pf-m-success">
        <ResourcesFullIcon />
      </span>
    );
  } else if (hasSucceededStage) {
    return (
      <span className="pf-c-icon pf-m-success">
        <ResourcesAlmostEmptyIcon />
      </span>
    );
  } else {
    return (
      <span className="pf-c-icon pf-m-info">
        <OutlinedCircleIcon />
      </span>
    );
  }
};

export default PlanStatusIcon;
