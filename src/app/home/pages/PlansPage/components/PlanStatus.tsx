import React from 'react';
import PlanStatusIcon from './PlanStatusIcon';
import { Flex, FlexItem } from '@patternfly/react-core';
import { getPlanStatusText } from '../helpers';
import { IPlan } from '../../../../plan/duck/types';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { HashLink } from 'react-router-hash-link';

interface IProps {
  plan: IPlan;
  isNestedDebugView: boolean;
}

const PlanStatus: React.FunctionComponent<IProps> = ({ plan, isNestedDebugView }) => {
  const latestMigration = plan?.Migrations?.length ? plan?.Migrations[0] : null;
  const {
    latestIsFailed,
    hasCriticalCondition,
    hasNotReadyCondition,
    hasClosedCondition,
    hasCancelingCondition,
    hasDVMBlockedCondition,
    hasWarnCondition,
    hasSucceededMigration,
    hasSucceededMigrationWithWarnings,
  } = plan?.PlanStatus;
  const showDebugLink =
    latestIsFailed ||
    hasCriticalCondition ||
    hasNotReadyCondition ||
    hasClosedCondition ||
    hasCancelingCondition ||
    hasDVMBlockedCondition ||
    hasWarnCondition ||
    hasSucceededMigration ||
    hasSucceededMigrationWithWarnings;
  const planName = plan?.MigPlan?.metadata?.name;
  const latestMigrationName = latestMigration?.metadata?.name;

  return (
    <Flex>
      <FlexItem>
        <PlanStatusIcon plan={plan} />
        {!isNestedDebugView && showDebugLink && planName && latestMigrationName ? (
          <HashLink to={`/plans/${planName}/migrations/${latestMigrationName}#debug`}>
            <span className={spacing.mlSm}>{getPlanStatusText(plan)}</span>
          </HashLink>
        ) : (
          <span className={spacing.mlSm}>{getPlanStatusText(plan)}</span>
        )}
      </FlexItem>
    </Flex>
  );
};

export default PlanStatus;
