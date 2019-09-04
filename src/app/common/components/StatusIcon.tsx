/** @jsx jsx */
import { jsx } from '@emotion/core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';

interface IProps {
  isReady: boolean;
}

const StatusIcon: React.FunctionComponent<IProps> = ({ isReady, ...rest }) => {
  if (isReady) {
    return (
      <React.Fragment>
        <span className="pf-c-icon pf-m-success">
          <CheckCircleIcon />
        </span>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <span className="pf-c-icon pf-m-danger">
          <ExclamationCircleIcon />
        </span>
      </React.Fragment>
    );
  }
};

export default StatusIcon;
