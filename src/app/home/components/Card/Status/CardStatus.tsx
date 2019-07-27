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
    <React.Fragment>
      <Grid>
        <GridItem span={1} style={{ textAlign: 'center', margin: 'auto' }}>
          <StatusIcon isReady={true} />
        </GridItem>
        <GridItem span={1} style={{ fontSize: '28px' }}>
          {successList.length}
        </GridItem>
        <GridItem span={10} style={{ margin: 'auto 0 auto 0' }}>
          Connected
        </GridItem>
      </Grid>
      <Grid>
        <GridItem span={1} style={{ textAlign: 'center', margin: 'auto' }}>
          <StatusIcon isReady={false} />
        </GridItem>
        <GridItem span={1} style={{ fontSize: '28px' }}>
          {failureList.length}
        </GridItem>
        <GridItem span={10} style={{ margin: 'auto 0 auto 0' }}>
          Connection failed
        </GridItem>
      </Grid>
    </React.Fragment>
  );
};

export default CardStatusComponent;
