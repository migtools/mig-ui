import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { Card } from '@rebass/emotion';
import { CheckIcon, ErrorCircleOIcon } from '@patternfly/react-icons';
import theme from '../../../theme';
import * as React from 'react';

interface IProps {
  status: string;
}

const ClusterStatusIcon: React.FunctionComponent<IProps> = ({
  status,
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
  if (status === "success") {
    return (
      <React.Fragment>
        <SuccessIcon />
      </React.Fragment>
    );

  }
  if (status === "failed") {
    return (
      <React.Fragment>
        <FailureIcon />
      </React.Fragment>
    );
  }
  return (
    null
  );

};

export default ClusterStatusIcon;
