/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import StatusIcon from '../../../../common/components/StatusIcon';
import { Grid, GridItem } from '@patternfly/react-core';

const CardStatusComponent = ({ type, dataList, ...props }) => {
  let successList = [];
  const failureList = [];
  if (type === 'repositories') {
    // hasReadyCondition = plan.MigPlan.status.conditions.filter(c => c.type === 'Ready').length > 0;
    // hasErrorCondition =
    //   plan.MigPlan.status.conditions.filter(c => c.category === 'Critical').length > 0;

    successList = dataList.filter(item => {
      if (item.MigStorage.status) {
        return item.MigStorage.status.conditions.filter(c => c.type === 'Ready');
      } else {
        failureList.push(item);
      }
    });
  } else if (type === 'clusters') {
    successList = dataList.filter(item => {
      if (item.MigCluster.status) {
        return item.MigCluster.status.conditions.filter(c => c.type === 'Ready');
      } else {
        failureList.push(item);
      }
    });
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
