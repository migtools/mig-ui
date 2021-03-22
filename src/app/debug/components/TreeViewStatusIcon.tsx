import React from 'react';

import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
const classNames = require('classnames');

interface IProps {
  debugRef: any;
}

const TreeViewStatusIcon: React.FunctionComponent<IProps> = ({ debugRef }) => {
  if (debugRef?.data?.object?.status?.errors > 0 && debugRef?.data?.object?.status?.phase) {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent={<>Phase: {debugRef?.data?.object?.status?.phase}</>}
        aria-label="warning-details"
        closeBtnAriaLabel="close-warning-details"
        maxWidth="200rem"
      >
        <span onClick={(event) => event.stopPropagation()} className="pf-c-icon pf-m-danger">
          <ExclamationCircleIcon />
        </span>
      </Popover>
    );
  } else if (
    debugRef?.data?.object?.status?.warnings > 0 &&
    debugRef?.data?.object?.status?.phase
  ) {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent={<>Warning</>}
        aria-label="warning-details"
        closeBtnAriaLabel="close-warning-details"
        maxWidth="200rem"
      >
        <span onClick={(event) => event.stopPropagation()} className={`pf-c-icon pf-m-warning`}>
          <ExclamationTriangleIcon />
        </span>
      </Popover>
    );
  } else {
    return null;
  }
};

export default TreeViewStatusIcon;
