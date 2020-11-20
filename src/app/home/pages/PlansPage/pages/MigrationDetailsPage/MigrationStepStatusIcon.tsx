import React from 'react';

import OutlinedCircleIcon from '@patternfly/react-icons/dist/js/icons/outlined-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import ResourcesAlmostFullIcon from '@patternfly/react-icons/dist/js/icons/resources-almost-full-icon';
import ResourcesFullIcon from '@patternfly/react-icons/dist/js/icons/resources-full-icon';

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
  } else if (step.started && !step.completed) {
    return (
      <span className="pf-c-icon pf-m-success">
        <ResourcesAlmostFullIcon />
      </span>
    );
  } else if (step.skipped) {
    return (
      <span className="pf-c-icon pf-m-info">
        <ResourcesFullIcon />
      </span>
    )
    
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
  } else {
    return (
      <span className="pf-c-icon pf-m-info">
        <OutlinedCircleIcon />
      </span>
    );
  }
};

export default MigrationStepStatusIcon;
