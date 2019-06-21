/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import Loader from 'react-loader-spinner';
import theme from '../../../../../theme';
import { InProgressIcon, OutlinedCircleIcon } from '@patternfly/react-icons';

import * as React from 'react';

interface IProps {
  plan: any;
}

const PlanStatusIcon: React.FunctionComponent<IProps> = ({ plan, ...rest }) => {
  const InProgress = styled(InProgressIcon)`
    color: ${theme.colors.medGray3};
  `;
  const NotStarted = styled(OutlinedCircleIcon)`
    color: ${theme.colors.blue};
  `;

  const Complete = styled(OutlinedCircleIcon)`
    color: ${theme.colors.statusGreen};
  `;
  if (plan.Migrations.length > 0 && plan.Migrations[0].status) {
    switch (plan.Migrations[0].status.phase) {
      case 'Completed':
        return <Complete />;
      default:
        return (
          <Loader
            type="RevolvingDot"
            color={theme.colors.medGray3}
            height="1em"
            width="1em"
            style={{ display: 'inline' }}
          />
        );
    }
  } else {
    return <NotStarted />;
  }
};

export default PlanStatusIcon;
