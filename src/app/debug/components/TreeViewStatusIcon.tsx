import React from 'react';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import {
  FlexItem,
  Popover,
  PopoverPosition,
  Progress,
  ProgressSize,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { DebugStatusType, IDebugRefWithStatus } from '../duck/types';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { IMigration, IPlan } from '../../plan/duck/types';
import PipelineSummary from '../../home/pages/PlansPage/components/PipelineSummary/PipelineSummary';
import PlanStatus from '../../home/pages/PlansPage/components/PlanStatus';
import PendingIcon from '@patternfly/react-icons/dist/js/icons/pending-icon';

interface IProps {
  debugRef: IDebugRefWithStatus;
  plans: IPlan[];
}

const getIcon = (debugRef: IDebugRefWithStatus, plans: IPlan[]) => {
  if (!debugRef || !debugRef.resourceKind) {
    return (
      <>
        <PendingIcon className="pf-c-icom pf-m-default"></PendingIcon>
        <span className={spacing.mlSm}>Pending</span>
      </>
    );
  }
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
      return renderStatusIcon(
        debugRef?.debugResourceStatus?.currentStatus,
        debugRef?.debugResourceStatus?.warningText
      );
    }
  }
  return renderStatusIcon(
    debugRef?.debugResourceStatus?.currentStatus,
    debugRef?.debugResourceStatus?.warningText
  );
};

const renderStatusIcon = (currentStatus, warningText) => {
  switch (currentStatus) {
    case DebugStatusType.Running:
      return (
        <>
          <Spinner size="sm"></Spinner>
          <span className={spacing.mlSm}>Active</span>
        </>
      );
    case DebugStatusType.Pending:
      return (
        <>
          <Spinner size="sm"></Spinner>
          <span className={spacing.mlSm}>Pending</span>
        </>
      );
    case DebugStatusType.Terminating:
      return (
        <>
          <Spinner size="sm"></Spinner>
          <span className={spacing.mlSm}>Terminating</span>
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
        <Popover
          position={PopoverPosition.bottom}
          bodyContent={
            <>
              <Title headingLevel="h2" size="xl">
                <>
                  <span className="pf-c-icon pf-m-warning">
                    <ExclamationTriangleIcon />
                  </span>
                  <span className={spacing.mlMd}>Warning</span>
                </>
              </Title>
              <p className={spacing.mtMd}>{warningText}</p>
            </>
          }
          aria-label="operator-mismatch-details"
          closeBtnAriaLabel="close--details"
          maxWidth="30rem"
        >
          <>
            <span className="pf-c-icon pf-m-warning">
              <ExclamationTriangleIcon />
            </span>
            <span className={spacing.mlSm}>Warning</span>
          </>
        </Popover>
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
    case DebugStatusType.Ready:
      return (
        <FlexItem>
          <span id="debug-ref-successful-icon" className="pf-c-icon pf-m-success">
            <CheckCircleIcon />
          </span>
          <span className={spacing.mlSm}>Ready</span>
        </FlexItem>
      );
    case DebugStatusType.Bound:
      return (
        <FlexItem>
          <span id="debug-ref-successful-icon" className="pf-c-icon pf-m-success">
            <CheckCircleIcon />
          </span>
          <span className={spacing.mlSm}>Bound</span>
        </FlexItem>
      );
    case DebugStatusType.Admitted:
      return (
        <FlexItem>
          <span id="debug-ref-successful-icon" className="pf-c-icon pf-m-success">
            <CheckCircleIcon />
          </span>
          <span className={spacing.mlSm}>Admitted</span>
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
