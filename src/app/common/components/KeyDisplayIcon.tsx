/** @jsx jsx */
import { jsx } from '@emotion/core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import * as React from 'react';

interface IProps {
  isHidden: boolean;
  id: string;
}

const KeyDisplayIcon: React.FunctionComponent<IProps> = ({ isHidden, id, ...rest }) => {
  return (
    <span className="pf-c-icon pf-m-info">
      {isHidden ? <EyeSlashIcon id={id} /> : <EyeIcon id={id} />}
    </span>
  );
};

export default KeyDisplayIcon;
