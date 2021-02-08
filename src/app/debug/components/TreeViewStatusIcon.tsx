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
  if (debugRef?.data?.object?.status?.errors > 0) {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent={
          <>
            <span className={spacing.mrSm}>{debugRef?.data?.object?.status?.phase}</span>
            <a className={classNames('pf-c-icon', 'pf-m-info')}> See details</a>
          </>
        }
        aria-label="warning-details"
        closeBtnAriaLabel="close-warning-details"
        maxWidth="200rem"
      >
        <span className="pf-c-icon pf-m-danger">
          <ExclamationCircleIcon />
        </span>
      </Popover>
    );
  } else if (debugRef?.data?.object?.status?.warnings > 0) {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent={<>A warning occurred in {debugRef?.data?.object?.status?.phase} phase.</>}
        aria-label="warning-details"
        closeBtnAriaLabel="close-warning-details"
        maxWidth="200rem"
      >
        <span className={`pf-c-icon pf-m-warning`}>
          <ExclamationTriangleIcon />
        </span>
      </Popover>
    );
  } else {
    return null;
  }
};

export default TreeViewStatusIcon;
