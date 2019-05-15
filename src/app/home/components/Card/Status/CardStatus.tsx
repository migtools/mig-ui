/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import theme from '../../../../../theme';
import StatusIcon from '../../../../common/components/StatusIcon';
import { css } from '@emotion/core';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core';

const CardStatusComponent = ({ type, dataList, ...props }) => {
  let successList = [];
  let failureList = [];
  if (type === 'repositories') {
    successList = dataList.filter((item) => {
      if (item.MigStorage.status) {
        return item.MigStorage.status.conditions[0].status === 'True'
      }
    })
    failureList = dataList.filter((item) => {
      if (item.MigStorage.status) {
        return item.MigStorage.status.conditions[0].status !== 'True'
      }
    })
  }

  else if (type === 'clusters') {
    successList = dataList.filter((item) => {
      if (item.MigCluster.status && item.MigCluster.status.conditions[0].status === 'True') {
        return item.MigCluster.status.conditions[0].status === 'True';
      } else {
        failureList.push(item);
      }
    });
  }
  return (
    <React.Fragment>
      <Grid>
        <GridItem span={1} style={{ textAlign: 'center', margin: 'auto' }}>
          <StatusIcon status="Ready" />
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
          <StatusIcon status="failed" />
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

