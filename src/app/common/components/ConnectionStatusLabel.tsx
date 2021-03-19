import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import OutlinedCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-circle-icon';

import * as React from 'react';
import { AddEditState } from '../../common/add_edit_state';
import { Spinner, Flex, FlexItem } from '@patternfly/react-core';
const styles = require('./ConnectionStatusLabel.module').default;

interface IProps {
  status: any;
  statusText: string;
}

const ConnectionStatusLabel: React.FunctionComponent<IProps> = ({ status, statusText }) => {
  const getStatusIcon = (iconStatus) => {
    const WrappedSpinner = () => <Spinner size="md"></Spinner>;

    switch (iconStatus.state) {
      case AddEditState.Pending: {
        const PendingSpan = () => <span className={styles.pendingSpan}></span>;
        return PendingSpan;
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
          <span id="connection-successful-icon" className="pf-c-icon pf-m-success">
            <CheckCircleIcon />
          </span>
        );

        return ReadyIcon;
      }
      case AddEditState.Watching: {
        return WrappedSpinner;
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
    <Flex>
      <FlexItem>
        <StatusIcon />
      </FlexItem>
      <FlexItem>{statusText}</FlexItem>
    </Flex>
  );
};

export default ConnectionStatusLabel;
