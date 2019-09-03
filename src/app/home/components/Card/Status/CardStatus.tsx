/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import StatusIcon from '../../../../common/components/StatusIcon';
import { Grid, GridItem } from '@patternfly/react-core';

const CardStatusComponent = ({ type, dataList, ...props }) => {
  let successList = [];
  let failureList = [];
  let successfulNames = [];

  if (type === 'repositories') {
    successList = dataList.filter(item =>
      item.MigStorage.status && item.MigStorage.status.conditions.filter(c => c.type === 'Ready').length !== 0
      );
    successfulNames = successList.map(item => item.MigStorage.metadata.name);
    failureList = dataList.filter(item => !successfulNames.includes(item.MigStorage.metadata.name));
  } else if (type === 'clusters') {
    successList = dataList.filter(item =>
      item.MigCluster.status && item.MigCluster.status.conditions.filter(c => c.type === 'Ready').length !== 0
    );
    successfulNames = successList.map(item => item.MigCluster.metadata.name);
    failureList = dataList.filter(item => !successfulNames.includes(item.MigCluster.metadata.name));
  }

  return (
    <dl className="pf-c-widget-description-list pf-m-inline">
      <dt>
        <span className="pf-c-widget-description-list__icon">
          <StatusIcon isReady={true} />
        </span>
        <span className="pf-c-widget-description-list__num">
          {successList.length}
        </span>
      </dt>
      <dd>
        Connected
      </dd>
      <dt>
        <span className="pf-c-widget-description-list__icon">
          <StatusIcon isReady={false} />
        </span>
        <span className="pf-c-widget-description-list__num">
          {failureList.length}
        </span>
      </dt>
      <dd>
        Connection failed
      </dd>
    </dl>
  );
};

export default CardStatusComponent;
