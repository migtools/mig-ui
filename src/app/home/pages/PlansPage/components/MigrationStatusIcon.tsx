import React from 'react';
import { Popover, PopoverPosition } from '@patternfly/react-core';

import { IMigration } from '../../../../plan/duck/types';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import ErrorCircleOIcon from '@patternfly/react-icons/dist/js/icons/error-circle-o-icon';

interface IProps {
  migration: IMigration;
}

const MigrationStatusIcon: React.FunctionComponent<IProps> = ({ migration }) => {
  return (
    <>
      {migration.tableStatus.isFailed && (
        <Popover
          position={PopoverPosition.top}
          bodyContent={<>{migration.tableStatus.errorCondition}</>}
          aria-label="pipeline-error-details"
          closeBtnAriaLabel="close--details"
          maxWidth="30rem"
        >
          <span className="pf-c-icon pf-m-danger">
            <ErrorCircleOIcon />
          </span>
        </Popover>
      )}
      {migration.tableStatus.warnCondition && (
        <Popover
          position={PopoverPosition.top}
          bodyContent={<>{migration.tableStatus.warnCondition}</>}
          aria-label="pipeline-warning-details"
          closeBtnAriaLabel="close--details"
          maxWidth="30rem"
        >
          <span className={`pf-c-icon pf-m-warning ${spacing.plSm} `}>
            <ExclamationTriangleIcon />
          </span>
        </Popover>
      )}
      {migration.tableStatus.isPostponed && (
        <Popover
          position={PopoverPosition.top}
          bodyContent={<>{migration.tableStatus.errorCondition}</>}
          aria-label="pipeline-warning-details"
          closeBtnAriaLabel="close--details"
          maxWidth="30rem"
        >
          <span className={`pf-c-icon pf-m-warning ${spacing.plSm} `}>
            <ExclamationTriangleIcon />
          </span>
        </Popover>
      )}
    </>
  );
};

export default MigrationStatusIcon;
