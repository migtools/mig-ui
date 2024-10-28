import React from 'react';

import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import OutlinedCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-circle-icon';
import ResourcesAlmostEmptyIcon from '@patternfly/react-icons/dist/js/icons/resources-almost-empty-icon';
import ResourcesFullIcon from '@patternfly/react-icons/dist/js/icons/resources-full-icon';

import { Popover, PopoverPosition } from '@patternfly/react-core';

import { Spinner } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { IPlan } from '../../../../plan/duck/types';
const styles = require('./PlanStatus.module').default;

interface IProps {
  plan: IPlan;
}

const PlanStatusIcon: React.FunctionComponent<IProps> = ({ plan }) => {
  const {
    hasRunningMigrations = null,
    hasNotReadyCondition = null,
    hasSucceededStage = null,
    hasSucceededCutover = null,
    hasSucceededRollback = null,
    hasSucceededWithWarningsCondition = null,
    isPlanLocked = null,
    hasConflictCondition = null,
    latestIsFailed = null,
    hasCriticalCondition = null,
    hasNotSupportedCondition = null,
    hasWarnCondition = null,
    hasDVMBlockedCondition = null,
  } = plan?.PlanStatus;

  if (latestIsFailed || hasCriticalCondition) {
    return (
      <span className={`${styles.planStatusIcon} pf-c-icon pf-m-danger`}>
        <ExclamationCircleIcon />
      </span>
    );
  } else if (hasConflictCondition) {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent="Migration plan conflicts occur when multiple plans share the same namespace. You cannot stage or migrate a plan with a conflict. Modify one of the plans to resolve the conflict."
        aria-label="warning-details"
        closeBtnAriaLabel="close-warning-details"
        maxWidth="200rem"
      >
        <span className={`${styles.planStatusIcon} pf-c-icon pf-m-warning`}>
          <ExclamationTriangleIcon />
        </span>
      </Popover>
    );
  } else if (hasNotSupportedCondition) {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent="The installed version of OpenShift Virtualization does support or has not enabled storage live migration. Instead of live migrating the storage, the virtual machine(s) will be shutdown and restarted after migration"
        aria-label="warning-details"
        closeBtnAriaLabel="close-warning-details"
        maxWidth="200rem"
      >
        <span className={`${styles.planStatusIcon} pf-c-icon pf-m-warning`}>
          <ExclamationTriangleIcon />
        </span>
      </Popover>
    );
  } else if (hasNotReadyCondition || hasDVMBlockedCondition) {
    return (
      <span className={`${styles.planStatusIcon} pf-c-icon pf-m-warning`}>
        <ExclamationTriangleIcon />
      </span>
    );
  } else if (hasRunningMigrations || isPlanLocked) {
    return <Spinner className={styles.planStatusIcon} size="md" />;
  } else if (
    (hasSucceededCutover && hasWarnCondition) ||
    (hasSucceededStage && hasWarnCondition) ||
    hasSucceededWithWarningsCondition
  ) {
    return (
      <span className={`${styles.planStatusIcon} pf-c-icon pf-m-warning`}>
        <ExclamationTriangleIcon />
      </span>
    );
  } else if (hasSucceededCutover) {
    return (
      <span className={`${styles.planStatusIcon} pf-c-icon pf-m-success`}>
        <ResourcesFullIcon />
      </span>
    );
  } else if (hasSucceededStage) {
    return (
      <span className={`${styles.planStatusIcon} pf-c-icon pf-m-success`}>
        <ResourcesAlmostEmptyIcon />
      </span>
    );
  } else if (hasSucceededRollback) {
    return (
      <span className={`${styles.planStatusIcon} pf-c-icon pf-m-success`}>
        <ResourcesFullIcon />
      </span>
    );
  } else {
    return (
      <span className={`${styles.planStatusIcon} pf-c-icon pf-m-info`}>
        <OutlinedCircleIcon />
      </span>
    );
  }
};

export default PlanStatusIcon;
