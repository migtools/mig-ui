/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import theme from '../../../theme';
import * as React from 'react';

interface IProps {
  isReady: boolean;
}

const StatusIcon: React.FunctionComponent<IProps> = ({ isReady, ...rest }) => {
  const SuccessIcon = styled(CheckCircleIcon)`
    color: ${theme.colors.statusGreen};
    margin-right: 0.75rem;
  `;
  const FailureIcon = styled(ExclamationCircleIcon)`
    color: ${theme.colors.statusRed};
    margin-right: 0.75rem;
  `;
  if (isReady) {
    return (
      <React.Fragment>
        <SuccessIcon />
      </React.Fragment>
    );
  } else if (isReady === null) {
    return <React.Fragment />;
  } else {
    return (
      <React.Fragment>
        <FailureIcon />
      </React.Fragment>
    );
  }
};

export default StatusIcon;
