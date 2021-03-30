import React from 'react';

import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { Flex, FlexItem, Popover, PopoverPosition, Spinner } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { DebugStatusType, IDebugRefWithStatus } from '../duck/types';
import OutlinedCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-circle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
const classNames = require('classnames');

interface IProps {
  debugRef: any;
}
const getIcon = (debugRef: IDebugRefWithStatus) => {
  switch (debugRef?.debugResourceStatus?.currentStatus) {
    case DebugStatusType.Running:
      return (
        <>
          <Spinner size="sm"></Spinner>
          <span className={spacing.mlSm}>Active</span>
        </>
      );
    case DebugStatusType.Failure:
      return (
        <>
          <span className="pf-c-icon pf-m-danger">
            <ExclamationCircleIcon />
          </span>
          <span className={spacing.mlSm}>Failed</span>
        </>
      );
    case DebugStatusType.Warning:
      return (
        <>
          <span className="pf-c-icon pf-m-warning">
            <ExclamationTriangleIcon />
          </span>
          <span className={spacing.mlSm}>Warning</span>
        </>
      );

    case DebugStatusType.Completed:
      return (
        <FlexItem>
          <span id="debug-ref-successful-icon" className="pf-c-icon pf-m-success">
            <CheckCircleIcon />
          </span>
          <span className={spacing.mlSm}>Completed</span>
        </FlexItem>
      );
    default: {
      return <></>;
    }
  }
};

const TreeViewStatusIcon: React.FunctionComponent<IProps> = ({ debugRef }) => {
  return getIcon(debugRef);
};

export default TreeViewStatusIcon;
