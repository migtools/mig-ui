/** @jsx jsx */
import { jsx } from '@emotion/core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import styled from '@emotion/styled';
import * as React from 'react';

interface IProps {
  isReady: boolean;
  isDisabled?: boolean;
}
const DisabledExclamationCircleIcon = styled(ExclamationCircleIcon)`
    color: #D2D2D2;
  `;
const DisabledCheckCircleIcon = styled(CheckCircleIcon)`
    color: #D2D2D2;
  `;

const StatusIcon: React.FunctionComponent<IProps> = ({ isReady, isDisabled, ...rest }) => {
  if (isReady) {
    return (
      <span className="pf-c-icon pf-m-success">
        {isDisabled ? <DisabledCheckCircleIcon /> : <CheckCircleIcon />}
      </span>
    );
  } else {
    return (
      <span className="pf-c-icon pf-m-danger">
        {isDisabled ? <DisabledExclamationCircleIcon /> : <ExclamationCircleIcon />}
      </span>
    );
  }
};

export default StatusIcon;
