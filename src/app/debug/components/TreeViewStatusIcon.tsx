import React from 'react';

import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import {
  Flex,
  FlexItem,
  Popover,
  PopoverPosition,
  Progress,
  ProgressSize,
  Spinner,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { DebugStatusType, IDebugRefWithStatus } from '../duck/types';
import OutlinedCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-circle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { IMigration, IPlan } from '../../plan/duck/types';
import MigrationStatusIcon from '../../home/pages/PlansPage/components/MigrationStatusIcon';
import { getPipelineSummaryTitle } from '../../home/pages/PlansPage/helpers';
import PipelineSummary from '../../home/pages/PlansPage/components/PipelineSummary/PipelineSummary';
import PlanStatus from '../../home/pages/PlansPage/components/PlanStatus';
const classNames = require('classnames');

interface IProps {
  debugRef: IDebugRefWithStatus;
  plans: IPlan[];
}

const getIcon = (debugRef: IDebugRefWithStatus, plans: IPlan[]) => {
  const matchingPlanRef = plans?.find((plan) => plan.MigPlan.metadata.name === debugRef?.refName);
  const matchingMigrationRef: IMigration[] = [];
  plans?.forEach((plan) => {
    const foundMigration: IMigration = plan.Migrations.find(
      (m) => m.metadata.name === debugRef?.refName
    );
    if (foundMigration) {
      matchingMigrationRef.push(foundMigration);
    }
  });
  if (debugRef.resourceKind === 'Plan') {
    return (
      <FlexItem>
        <PlanStatus plan={matchingPlanRef || null} />
      </FlexItem>
    );
  }
  if (debugRef.resourceKind === 'Migration') {
    return (
      <>
        <PipelineSummary migration={matchingMigrationRef[0] || null} />
      </>
    );
  }
  if (debugRef.resourceKind === 'DirectVolumeMigrationProgress') {
    if (debugRef?.debugResourceStatus.hasRunning) {
      return (
        <>
          <Progress
            value={parseInt(debugRef?.status?.totalProgressPercentage, 10) || 0}
            title="Total progress percentage"
            size={ProgressSize.sm}
          />
        </>
      );
    } else {
      return renderStatusIcon(debugRef?.debugResourceStatus?.currentStatus);
    }
  }
  return renderStatusIcon(debugRef?.debugResourceStatus?.currentStatus);
};

const renderStatusIcon = (currentStatus) => {
  switch (currentStatus) {
    case DebugStatusType.Running:
      return (
        <>
          <Spinner size="sm"></Spinner>
          <span className={spacing.mlSm}>Active</span>
        </>
      );
    case DebugStatusType.Failure:
      return (
        <>
          <span className="pf-c-icon pf-m-danger">
            <ExclamationCircleIcon />
          </span>
          <span className={spacing.mlSm}>Failed</span>
        </>
      );
    case DebugStatusType.Warning:
      return (
        <>
          <span className="pf-c-icon pf-m-warning">
            <ExclamationTriangleIcon />
          </span>
          <span className={spacing.mlSm}>Warning</span>
        </>
      );

    case DebugStatusType.Completed:
      return (
        <FlexItem>
          <span id="debug-ref-successful-icon" className="pf-c-icon pf-m-success">
            <CheckCircleIcon />
          </span>
          <span className={spacing.mlSm}>Completed</span>
        </FlexItem>
      );
    default: {
      return <></>;
    }
  }
};

const TreeViewStatusIcon: React.FunctionComponent<IProps> = ({ debugRef, plans }) => {
  return getIcon(debugRef, plans);
};

export default TreeViewStatusIcon;
