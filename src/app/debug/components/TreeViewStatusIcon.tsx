import React from 'react';

import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { Popover, PopoverPosition, Spinner } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { DebugStatusType, IDebugRef } from '../duck/types';
import OutlinedCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-circle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
const classNames = require('classnames');

interface IProps {
  debugRef: any;
}
const getIcon = (debugRef: IDebugRef) => {
  switch (debugRef?.debugResourceStatus?.currentStatus) {
    case DebugStatusType.Running:
      return <Spinner size="sm"></Spinner>;
    case DebugStatusType.Failure:
      return (
        <span className="pf-c-icon pf-m-danger">
          <ExclamationCircleIcon />
        </span>
      );
    case DebugStatusType.Warning:
      return (
        <span className="pf-c-icon pf-m-warning">
          <ExclamationTriangleIcon />
        </span>
      );

    case DebugStatusType.Completed:
      return (
        <span id="debug-ref-successful-icon" className="pf-c-icon pf-m-success">
          <CheckCircleIcon />
        </span>
      );
    default: {
      return (
        <span className="pf-c-icon pf-m-info">
          <OutlinedCircleIcon />
        </span>
      );
    }
  }
};

const TreeViewStatusIcon: React.FunctionComponent<IProps> = ({ debugRef }) => {
  return getIcon(debugRef);
};

export default TreeViewStatusIcon;
