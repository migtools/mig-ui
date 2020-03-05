import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  OutlinedCircleIcon,
} from '@patternfly/react-icons';
import * as React from 'react';
import { AddEditState } from '../../common/add_edit_state';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
const styles = require('./ConnectionStatusLabel.module');

interface IProps {
  status: any;
  statusText: string;
}

const ConnectionStatusLabel: React.FunctionComponent<IProps> = ({ status, statusText }) => {

  const getStatusIcon = iconStatus => {
    const WrappedSpinner = () => (
      <Spinner className={styles.spinner} size="md"></Spinner>
    )

    switch (iconStatus.state) {
    case AddEditState.Pending: {
      const PendingSpan = () => (
        <span className={styles.pendingSpan}></span>
      )
      return PendingSpan
    }
    case AddEditState.Fetching: {
      return WrappedSpinner;
    }
    case AddEditState.Critical: {
      const CriticalIcon = () => (
        <span className="pf-c-icon pf-m-danger">
          <ExclamationCircleIcon />
        </span>
      );

      return CriticalIcon;
    }
    case AddEditState.Ready: {
      const ReadyIcon = () => (
        <span
          id="connection-successful-icon"
          className="pf-c-icon pf-m-success">
          <CheckCircleIcon />
        </span>
      );

      return ReadyIcon;
    }
    case AddEditState.Watching: {
      return WrappedSpinner
    }
    case AddEditState.TimedOut: {
      const TimedOutIcon = () => (
        <span className="pf-c-icon pf-m-danger">
          <ExclamationCircleIcon />
        </span>
      );

      return TimedOutIcon;
    }
    default: {
      const DefaultIcon = () => (
        <span className="pf-c-icon pf-m-info">
          <OutlinedCircleIcon />
        </span>
      );

      return DefaultIcon;
    }
    }
  };

  const StatusIcon: any = getStatusIcon(status);
  return (
    <div className="pf-l-flex">
      <div className="pf-l-flex__item">
        <StatusIcon />
      </div>
      <div className="pf-l-flex__item">
        {statusText}
      </div>
    </div>
  );
};

export default ConnectionStatusLabel;
