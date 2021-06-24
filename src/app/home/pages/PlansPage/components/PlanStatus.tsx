import React from 'react';
import PlanStatusIcon from './PlanStatusIcon';
import { Flex, FlexItem } from '@patternfly/react-core';
import { getPlanStatusText } from '../helpers';
import { IPlan } from '../../../../plan/duck/types';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Link } from 'react-router-dom';

interface IProps {
  plan: IPlan;
  isNestedDebugView: boolean;
}

const PlanStatus: React.FunctionComponent<IProps> = ({ plan, isNestedDebugView }) => {
  const latestMigration = plan.Migrations.length ? plan.Migrations[0] : null;
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
  } = plan.PlanStatus;
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
        <span className={spacing.mlSm}>{getPlanStatusText(plan)}</span>
        {!isNestedDebugView && showDebugLink && planName && latestMigrationName && (
          <div>
            <Link to={`/plans/${planName}/migrations/${latestMigrationName}`}>
              View debug page for more info
            </Link>
          </div>
        )}
      </FlexItem>
    </Flex>
  );
};

export default PlanStatus;
