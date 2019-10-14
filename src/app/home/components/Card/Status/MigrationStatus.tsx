/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ResourcesAlmostEmptyIcon, ResourcesAlmostFullIcon, ResourcesFullIcon } from '@patternfly/react-icons';
import styled from '@emotion/styled';

const MigrationStatus = ({ planStatusCounts }) => {
  const { notStarted, inProgress, completed } = planStatusCounts;

  const DisabledEmptyIcon = styled(ResourcesAlmostEmptyIcon)`
    color: #D2D2D2;
  `;

  const DisabledAlmostFullIcon = styled(ResourcesAlmostFullIcon)`
    color: #D2D2D2;
  `;
  const DisabledFullIcon = styled(ResourcesFullIcon)`
    color: #D2D2D2;
  `;
  const DisabledWrapper = styled(ResourcesFullIcon)`
    color: #D2D2D2;
  `;


  return (
    <dl className="pf-c-widget-description-list pf-m-inline">
      <dt>
        <span className="pf-c-icon pf-c-widget-description-list__icon">
          {notStarted.length > 0 ? <ResourcesAlmostEmptyIcon /> : <DisabledEmptyIcon />}
        </span>

        <span className={notStarted.length > 0 ?
          "pf-c-widget-description-list__num" :
          "pf-c-widget-description-list__num disabled"}>
          {notStarted.length}
        </span>
      </dt>
      <dd className={notStarted.length > 0 ? '' : 'disabled'}>
        Not started
      </dd>
      <dt>
        <span className="pf-c-icon pf-c-widget-description-list__icon pf-m-info">
          {inProgress.length > 0 ? <ResourcesAlmostFullIcon /> : <DisabledAlmostFullIcon />}
        </span>
        <span className={inProgress.length > 0 ?
          "pf-c-widget-description-list__num" :
          "pf-c-widget-description-list__num disabled"}>
          {inProgress.length}
        </span>
      </dt>
      <dd className={inProgress.length > 0 ? '' : 'disabled'}>
        In progress
      </dd>
      <dt>
        <span className="pf-c-icon pf-c-widget-description-list__icon pf-m-success">
          {completed.length > 0 ? <ResourcesFullIcon /> : <DisabledFullIcon />}
        </span>
        <span className={completed.length > 0 ?
          "pf-c-widget-description-list__num" :
          "pf-c-widget-description-list__num disabled"}>
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
