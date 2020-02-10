import * as React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
const styles = require("./StatusIcon.module")
interface IProps {
  isReady: boolean;
  isDisabled?: boolean;
}

const StatusIcon: React.FunctionComponent<IProps> = ({ isReady, isDisabled }) => {
  if (isReady) {
    return (
      <span className="pf-c-icon pf-m-success">
        <CheckCircleIcon className={isDisabled && styles.disabled} />
      </span>
    );
  } else {
    return (
      <span className="pf-c-icon pf-m-danger">
        <ExclamationCircleIcon className={isDisabled && styles.disabled} />
      </span>
    );
  }
};

export default StatusIcon;
