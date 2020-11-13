import React from 'react';

import WarningTriangleIcon from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';
import OutlinedCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import ResourcesAlmostFullIcon from '@patternfly/react-icons/dist/js/icons/resources-almost-full-icon';
import ResourcesFullIcon from '@patternfly/react-icons/dist/js/icons/resources-full-icon';

import { Popover, PopoverPosition } from '@patternfly/react-core';

import { Spinner } from '@patternfly/react-core';
import { IMigration, IStep } from '../../../../../plan/duck/types';

interface IProps {
  migration: IMigration;
  step: IStep;
}

const MigrationStepStatusIcon: React.FunctionComponent<IProps> = ({ migration, step }) => {
  const { tableStatus, status } = migration;
  const { migrationState } = tableStatus;

  if ((migrationState === 'error' || status?.errors?.length) && step?.started && !step?.completed) {
    return (
      <span className="pf-c-icon pf-m-danger">
        <ExclamationCircleIcon />
      </span>
    );
  } else if (migrationState === 'warn') {
    return (
      <Popover
        position={PopoverPosition.top}
        bodyContent="This migration has a warning condition."
        aria-label="warning-details"
        closeBtnAriaLabel="close-warning-details"
        maxWidth="200rem"
      >
        <span className="pf-c-icon pf-m-warning">
          <WarningTriangleIcon />
        </span>
      </Popover>
    );
    //   } else if () {
    //     return <Spinner size="md" />;
  } else if (step.started && !step.completed) {
    return (
      <span className="pf-c-icon pf-m-success">
        <ResourcesAlmostFullIcon />
      </span>
    );
  } else if (step.failed) {
    return (
      <span className="pf-c-icon pf-m-danger">
        <ExclamationCircleIcon />
      </span>
    );
  } else if (step.completed) {
    return (
      <span className="pf-c-icon pf-m-success">
        <ResourcesFullIcon />
      </span>
    );
    //   } else if (hasSucceededStage) {
    //     return (
    //       <span className="pf-c-icon pf-m-success">
    //         <ResourcesAlmostEmptyIcon />
    //       </span>
    // );
  } else {
    return (
      <span className="pf-c-icon pf-m-info">
        <OutlinedCircleIcon />
      </span>
    );
  }
};

export default MigrationStepStatusIcon;
