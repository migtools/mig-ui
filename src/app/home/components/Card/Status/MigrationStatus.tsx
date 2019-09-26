/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import {
  BanIcon,
  ExclamationCircleIcon,
  ResourcesAlmostEmptyIcon,
  ResourcesAlmostFullIcon,
  ResourcesFullIcon
} from '@patternfly/react-icons';

const MigrationStatus = ({ planStatusCounts }) => {
  const { notStarted, inProgress, completed } = planStatusCounts;
  return (
    <div className="pf-l-flex pf-m-column pf-m-row-on-md">
      <div className="pf-l-flex__item pf-m-spacer-sm pf-m-spacer-3xl-on-md">
        <dl className="pf-c-widget-description-list pf-m-inline">
          <dt>
            <span className="pf-c-icon pf-c-widget-description-list__icon">
              <ResourcesAlmostEmptyIcon />
            </span>

            <span className="pf-c-widget-description-list__num">
              {notStarted.length}
            </span>
          </dt>
          <dd>
            Not started
          </dd>
          <dt>
            <span className="pf-c-icon pf-c-widget-description-list__icon pf-m-info">
              <ResourcesAlmostFullIcon />
            </span>
            <span className="pf-c-widget-description-list__num">
              {inProgress.length}
            </span>
          </dt>
          <dd>
            In progress
          </dd>
          <dt>
            <span className="pf-c-icon pf-c-widget-description-list__icon pf-m-success">
              <ResourcesFullIcon />
            </span>
            <span className="pf-c-widget-description-list__num">
              {completed.length}
            </span>
          </dt>
          <dd>
            Complete
          </dd>
        </dl>
      </div>
      <div className="pf-l-flex__item pf-m-flex-1">
        <dl className="pf-c-widget-description-list pf-m-inline">
          <dt>
            <span className="pf-c-icon pf-c-widget-description-list__icon">
              <BanIcon />
            </span>

            <span className="pf-c-widget-description-list__num">
              {/* TODO wire this up */}
              12
            </span>
          </dt>
          <dd>
            Inactive
          </dd>
          <dt>
            <span className="pf-c-icon pf-c-widget-description-list__icon pf-m-danger">
              <ExclamationCircleIcon />
            </span>
            <span className="pf-c-widget-description-list__num">
              {/* TODO wire this up */}
              4
            </span>
          </dt>
          <dd>
            Migrate failed
          </dd>
        </dl>
      </div>
    </div>
  );
};

export default MigrationStatus;
