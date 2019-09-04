/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import Loader from 'react-loader-spinner';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  OutlinedCircleIcon,
} from '@patternfly/react-icons';
import theme from '../../../theme';
import * as React from 'react';
import { AddEditState } from '../../common/add_edit_state';

interface IProps {
  status: any;
  statusText: string;
}

const ConnectionStatusLabel: React.FunctionComponent<IProps> = ({ status, statusText }) => {
  const getStatusIcon = iconStatus => {
    switch (iconStatus.state) {
      case AddEditState.Pending: {
        return styled.span`
          color: ${theme.colors.blue};
        `;
      }
      case AddEditState.Fetching: {
        const WrappedLoader = () => (
          <Loader
            type="RevolvingDot"
            color={theme.colors.medGray3}
            height="1em"
            width="1em"
          />
        );

        return styled(WrappedLoader)`
          display: inline;
        `;
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
          <span className="pf-c-icon pf-m-success">
            <CheckCircleIcon />
          </span>
        );

        return ReadyIcon;
      }
      case AddEditState.Watching: {
        const WrappedLoader = () => (
          <Loader
            type="RevolvingDot"
            color={theme.colors.medGray3}
            height="1em"
            width="1em"
          />
        );

        return styled(WrappedLoader)`
          display: inline;
        `;
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
