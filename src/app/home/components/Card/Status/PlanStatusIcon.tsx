/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import Loader from 'react-loader-spinner';
import theme from '../../../../../theme';
import { OutlinedCircleIcon } from '@patternfly/react-icons';

import * as React from 'react';

interface IProps {
  isDeleting: boolean;
  plan: any;
}

const PlanStatusIcon: React.FunctionComponent<IProps> = ({ plan, isDeleting }) => {
  const NotStarted = styled(OutlinedCircleIcon)`
    color: ${theme.colors.blue};
  `;
  const Error = styled(OutlinedCircleIcon)`
    color: ${theme.colors.statusRed};
  `;

  const Complete = styled(OutlinedCircleIcon)`
    color: ${theme.colors.statusGreen};
  `;

  const {
    hasFailedCondition,
    hasRunningMigrations,
    hasNotReadyCondition,
    hasSucceededStage,
    hasSucceededMigration,
  } = plan.PlanStatus;

  if (hasFailedCondition || hasNotReadyCondition) {
    return <Error />;
  } else if (hasRunningMigrations || isDeleting) {
    return (
      <Loader
        type="RevolvingDot"
        color={theme.colors.medGray3}
        height="1em"
        width="1em"
        style={{ display: 'inline' }}
      />
    );
  } else if (hasSucceededMigration || hasSucceededStage) {
    return <Complete />;
  } else {
    return <NotStarted />;
  }
};

export default PlanStatusIcon;
