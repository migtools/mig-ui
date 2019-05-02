import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Card } from '@rebass/emotion';
import { CheckIcon, ErrorCircleOIcon } from '@patternfly/react-icons';
import Loader from 'react-loader-spinner';
import theme from '../../../../../theme';
import {
  InProgressIcon,
  OutlinedCircleIcon,
  OutlinedTimesCircleIcon,
} from '@patternfly/react-icons';

import * as React from 'react';

interface IProps {
  status: string;
}

const PlanStatusIcon: React.FunctionComponent<IProps> = ({
  status,
  ...rest
}) => {
  const InProgress = styled(InProgressIcon)`
    color: ${theme.colors.medGray3};
  `;
  const NotStarted = styled(OutlinedCircleIcon)`
  font-size: 2em;
    color: ${theme.colors.blue};
  `;
  const Complete = styled(OutlinedCircleIcon)`
  font-size: 2em;
    color: ${theme.colors.statusGreen};
  `;
  if (status === 'Not Started') {
    return (
      <NotStarted />
    );
  }

  if (status === 'Staged Successfully') {
    return (
      <Complete />
    );
  }
  if (status === 'Migrated Successfully') {
    return (
      <Complete />
    );
  }
  if (status === 'Staging') {
    return (
      <Loader
        type="RevolvingDot"
        color={theme.colors.medGray3}
        height="2em"
        width="2em"
        style={{ display: "inline" }}
      />
    );
  }
  if (status === 'Migrating') {
    return (
      <Loader
        type="RevolvingDot"
        color={theme.colors.medGray3}
        height="2em"
        width="2em"
        style={{ display: "inline" }}
      />
    );
  }
};

export default PlanStatusIcon;
