/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import theme from '../../../theme';
import * as React from 'react';

interface IProps {
  isHidden: boolean;
  id: string;
}

const KeyDisplayIcon: React.FunctionComponent<IProps> = ({ isHidden, id, ...rest }) => {
  const HiddenIcon = styled(EyeSlashIcon)`
    color: ${theme.colors.blue};
  `;
  const VisibleIcon = styled(EyeIcon)`
    color: ${theme.colors.blue};
  `;
  return (
    <React.Fragment>{isHidden ? <HiddenIcon id={id} /> : <VisibleIcon id={id} />}</React.Fragment>
  );
};

export default KeyDisplayIcon;
