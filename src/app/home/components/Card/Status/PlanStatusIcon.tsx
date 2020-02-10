import React from 'react';
import { OutlinedCircleIcon, ResourcesAlmostEmptyIcon, ResourcesFullIcon } from '@patternfly/react-icons';

import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

interface IProps {
  plan: any;
}

const PlanStatusIcon: React.FunctionComponent<IProps> = ({ plan }) => {
  const {
    hasFailedCondition,
    hasRunningMigrations,
    hasNotReadyCondition,
    hasSucceededStage,
    hasSucceededMigration,
    isPlanLocked
  } = plan.PlanStatus;

  if (hasFailedCondition || hasNotReadyCondition) {
    return <span className="pf-c-icon pf-m-danger"><ResourcesFullIcon /></span>;
  } else if (hasRunningMigrations || isPlanLocked) {
    return (
      <Spinner size="md" />
    );
  } else if (hasSucceededMigration) {
    return <span className="pf-c-icon pf-m-success"><ResourcesFullIcon /></span>;
  } else if (hasSucceededStage) {
    return <span className="pf-c-icon pf-m-success"><ResourcesAlmostEmptyIcon /></span>;
  } else {
    return <span className="pf-c-icon pf-m-info"><OutlinedCircleIcon /></span>;
  }
};

export default PlanStatusIcon;
