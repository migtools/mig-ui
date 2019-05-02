import React from 'react';
import theme from '../../../../../theme';
import StatusIcon from '../../../../common/components/StatusIcon';
import { css } from '@emotion/core';
import {
  Grid,
  GridItem,
} from '@patternfly/react-core';

const CardStatusComponent = ({ type, dataList, ...props }) => {
  const successList = dataList.filter((item) => item.status === 'success');
  const failureList = dataList.filter((item) => item.status !== 'success');
  return (
    <React.Fragment>
      <Grid>
        <GridItem span={1} style={{ textAlign: "center", margin: 'auto' }}>
          <StatusIcon status="success" />
        </GridItem>
        <GridItem span={1} style={{ fontSize: "28px" }}>
          {successList.length}
        </GridItem>
        <GridItem span={10} style={{ margin: "auto 0 auto 0" }}>
          Connected
                </GridItem>
      </Grid>
      <Grid>
        <GridItem span={1} style={{ textAlign: "center", margin: 'auto' }}>
          <StatusIcon status="failed" />
        </GridItem>
        <GridItem span={1} style={{ fontSize: "28px" }}>
          {failureList.length}
        </GridItem>
        <GridItem span={10} style={{ margin: "auto 0 auto 0" }}>
          Connection failed
                </GridItem>
      </Grid>
    </React.Fragment>

  );
};

export default CardStatusComponent;

