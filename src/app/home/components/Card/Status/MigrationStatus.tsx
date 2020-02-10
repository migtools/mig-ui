import React from 'react';
import { ResourcesAlmostEmptyIcon, ResourcesAlmostFullIcon, ResourcesFullIcon } from '@patternfly/react-icons';
const styles = require('./MigrationStatus.module');

const MigrationStatus = ({ planStatusCounts }) => {
  const { notStarted, inProgress, completed } = planStatusCounts;

  return (
    <dl className="pf-c-widget-description-list pf-m-inline">
      <dt>
        <span className="pf-c-icon pf-c-widget-description-list__icon">
          <ResourcesAlmostEmptyIcon className={notStarted.length === 0 && styles.disabled} />
        </span>

        <span className={notStarted.length > 0 ?
          'pf-c-widget-description-list__num' :
          'pf-c-widget-description-list__num disabled'}>
          {notStarted.length}
        </span>
      </dt>
      <dd className={notStarted.length > 0 ? '' : 'disabled'}>
        Not started
      </dd>
      <dt>
        <span className="pf-c-icon pf-c-widget-description-list__icon pf-m-info">
          <ResourcesAlmostFullIcon className={inProgress.length === 0 && styles.disabled} />
        </span>
        <span className={inProgress.length > 0 ?
          'pf-c-widget-description-list__num' :
          'pf-c-widget-description-list__num disabled'}>
          {inProgress.length}
        </span>
      </dt>
      <dd className={inProgress.length > 0 ? '' : 'disabled'}>
        In progress
      </dd>
      <dt>
        <span className="pf-c-icon pf-c-widget-description-list__icon pf-m-success">
          <ResourcesFullIcon className={completed.length === 0 && styles.disabled} />
        </span>
        <span className={completed.length > 0 ?
          'pf-c-widget-description-list__num' :
          'pf-c-widget-description-list__num disabled'}>
          {completed.length}
        </span>
      </dt>
      <dd className={completed.length > 0 ? '' : 'disabled'}>
        Complete
      </dd>
    </dl>
  );
};

export default MigrationStatus;
