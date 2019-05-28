/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import theme from '../../../theme';
import * as React from 'react';

interface IProps {
  status: string;
}

const StatusIcon: React.FunctionComponent<IProps> = ({ status, ...rest }) => {
  const SuccessIcon = styled(CheckCircleIcon)`
    color: ${theme.colors.statusGreen};
    margin-right: 0.75rem;
  `;
  const FailureIcon = styled(ExclamationCircleIcon)`
    color: ${theme.colors.statusRed};
    margin-right: 0.75rem;
  `;
  if (status === 'Ready') {
    return (
      <React.Fragment>
        <SuccessIcon />
      </React.Fragment>
    );
  }
  if (status === 'failed' || status === null) {
    return (
      <React.Fragment>
        <FailureIcon />
      </React.Fragment>
    );
  }
  return null;
};

export default StatusIcon;
