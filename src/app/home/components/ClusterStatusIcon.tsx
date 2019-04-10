import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Card } from '@rebass/emotion';
import { CheckIcon, ErrorCircleOIcon } from '@patternfly/react-icons';
import theme from '../../../theme';
import * as React from 'react';

interface IProps {
  isSuccessful: boolean;
}

const ClusterStatusIcon: React.FunctionComponent<IProps> = ({
  isSuccessful,
  ...rest
}) => {
  const SuccessIcon = styled(CheckIcon)`
    color: ${theme.colors.statusGreen};
    margin-right: 10px;
  `;
  const FailureIcon = styled(ErrorCircleOIcon)`
    color: ${theme.colors.statusRed};
    margin-right: 10px;
  `;
  return (
    <React.Fragment>
      {isSuccessful ? <SuccessIcon /> : <FailureIcon />}
    </React.Fragment>
  );
};

export default ClusterStatusIcon;
