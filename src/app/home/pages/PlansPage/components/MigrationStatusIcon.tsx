import React from 'react';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import { IMigration } from '../../../../plan/duck/types';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import ErrorCircleOIcon from '@patternfly/react-icons/dist/js/icons/error-circle-o-icon';
import { SpaIconConfig } from '@patternfly/react-icons';

interface IProps {
  migration: IMigration;
}

const MigrationStatusIcon: React.FunctionComponent<IProps> = ({ migration }) => {
  if (!migration) {
    return null;
  } else {
    return (
      <>
        {migration?.tableStatus.isFailed && (
          <Popover
            position={PopoverPosition.top}
            bodyContent={<>{migration.tableStatus.errorCondition}</>}
            aria-label="pipeline-error-details"
            closeBtnAriaLabel="close--details"
            maxWidth="30rem"
          >
            <span className={`pf-c-icon pf-m-danger ${spacing.mrSm}`}>
              <ErrorCircleOIcon
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </span>
          </Popover>
        )}
        {migration?.tableStatus.warnCondition && (
          <Popover
            position={PopoverPosition.top}
            bodyContent={<>{migration.tableStatus.warnCondition}</>}
            aria-label="pipeline-warning-details"
            closeBtnAriaLabel="close--details"
            maxWidth="30rem"
          >
            <span className={`pf-c-icon pf-m-warning ${spacing.mrSm}`}>
              <ExclamationTriangleIcon
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </span>
          </Popover>
        )}
        {migration?.tableStatus.isPostponed && (
          <Popover
            position={PopoverPosition.top}
            bodyContent={<>{migration.tableStatus.errorCondition}</>}
            aria-label="pipeline-warning-details"
            closeBtnAriaLabel="close--details"
            maxWidth="30rem"
          >
            <span className={`pf-c-icon pf-m-warning ${spacing.mrSm}`}>
              <ExclamationTriangleIcon
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </span>
          </Popover>
        )}
      </>
    );
  }
};

export default MigrationStatusIcon;
