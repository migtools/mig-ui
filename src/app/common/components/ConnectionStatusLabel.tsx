/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Flex, Box, Text } from '@rebass/emotion';

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
          <Loader type="RevolvingDot" color={theme.colors.medGray3} height="1em" width="1em" />
        );

        return styled(WrappedLoader)`
          display: inline;
        `;
      }
      case AddEditState.Critical: {
        return styled(ExclamationCircleIcon)`
          color: ${theme.colors.statusRed};
        `;
      }
      case AddEditState.Ready: {
        return styled(CheckCircleIcon)`
          color: ${theme.colors.statusGreen};
        `;
      }
      case AddEditState.Watching: {
        const WrappedLoader = () => (
          <Loader type="RevolvingDot" color={theme.colors.medGray3} height="1em" width="1em" />
        );

        return styled(WrappedLoader)`
          display: inline;
        `;
      }
      case AddEditState.TimedOut: {
        return styled(ExclamationCircleIcon)`
          color: ${theme.colors.statusRed};
        `;
      }
      default: {
        return styled(OutlinedCircleIcon)`
          color: ${theme.colors.blue};
        `;
      }
    }
  };

  const StatusIcon: any = getStatusIcon(status);
  return (
    <Flex>
      <Box>
        <StatusIcon />
      </Box>
      <Box>
        <Text m="0 0 0 1em">{statusText}</Text>
      </Box>
    </Flex>
  );
};

export default ConnectionStatusLabel;
