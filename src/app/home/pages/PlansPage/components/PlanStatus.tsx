import React from 'react';
import PlanStatusIcon from './PlanStatusIcon';
import { Flex, FlexItem } from '@patternfly/react-core';
import { getPlanStatusText } from '../helpers';
import { IPlan } from '../../../../plan/duck/types';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { HashLink } from 'react-router-hash-link';
import { TruncatedText } from '../../../../common/components/TruncatedText';
const styles = require('./PlanStatus.module').default;

interface IProps {
  plan: IPlan;
  isNestedDebugView: boolean;
}

const PlanStatus: React.FunctionComponent<IProps> = ({ plan, isNestedDebugView }) => {
  const latestMigration = plan?.Migrations?.length ? plan?.Migrations[0] : null;
  const planStatus = plan?.PlanStatus;
  let showDebugLink;
  if (planStatus) {
    const {
      latestIsFailed = null,
      hasCriticalCondition = null,
      hasNotReadyCondition = null,
      hasClosedCondition = null,
      hasCancelingCondition = null,
      hasDVMBlockedCondition = null,
      hasWarnCondition = null,
      hasSucceededMigration = null,
      hasSucceededWithWarningsCondition = null,
    } = plan?.PlanStatus;
    showDebugLink =
      latestIsFailed ||
      hasCriticalCondition ||
      hasNotReadyCondition ||
      hasClosedCondition ||
      hasCancelingCondition ||
      hasDVMBlockedCondition ||
      hasWarnCondition ||
      hasSucceededMigration ||
      hasSucceededWithWarningsCondition;
  } else {
    showDebugLink = false;
  }
  const planName = plan?.MigPlan?.metadata?.name;
  const latestMigrationName = latestMigration?.metadata?.name;

  const statusTextSpan = (
    <span className={`${styles.planStatusTextContainer} ${spacing.mlSm}`}>
      <TruncatedText>{getPlanStatusText(plan)}</TruncatedText>
    </span>
  );

  return (
    <Flex>
      <FlexItem>
        <PlanStatusIcon plan={plan} />
        {!isNestedDebugView && showDebugLink && planName && latestMigrationName ? (
          <HashLink to={`/plans/${planName}/migrations/${latestMigrationName}#debug`}>
            {statusTextSpan}
          </HashLink>
        ) : (
          statusTextSpan
        )}
      </FlexItem>
    </Flex>
  );
};

export default PlanStatus;
