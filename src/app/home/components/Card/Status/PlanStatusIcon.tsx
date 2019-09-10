/** @jsx jsx */
import { jsx } from '@emotion/core';
import Loader from 'react-loader-spinner';
import theme from '../../../../../theme';
import { OutlinedCircleIcon } from '@patternfly/react-icons';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

import * as React from 'react';

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
    return <span className="pf-c-icon pf-m-danger"><OutlinedCircleIcon /></span>;
  } else if (hasRunningMigrations || isPlanLocked) {
    return <Spinner size="xl" />;
  } else if (hasSucceededMigration || hasSucceededStage) {
    return <span className="pf-c-icon pf-m-success"><OutlinedCircleIcon /></span>;
  } else {
    return <span className="pf-c-icon pf-m-info"><OutlinedCircleIcon /></span>;
  }
};

export default PlanStatusIcon;
