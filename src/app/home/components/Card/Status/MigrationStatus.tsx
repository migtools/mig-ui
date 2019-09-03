/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Flex, Box } from '@rebass/emotion';

const MigrationStatus = ({ planStatusCounts }) => {
  const { notStarted, inProgress, completed } = planStatusCounts;
  return (
    <dl className="pf-c-widget-description-list pf-m-inline">
      <dt>
        <span className="pf-c-widget-description-list__num">
          {notStarted.length}
        </span>
      </dt>
      <dd>Not started</dd>
      <dt className="pf-c-widget-description-list__num">
        {inProgress.length}
      </dt>
      <dd>In progress</dd>
      <dt className="pf-c-widget-description-list__num">
        {completed.length}
      </dt>
      <dd>Complete</dd>
    </dl>
  );
};
export default MigrationStatus;
