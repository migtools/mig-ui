import React from 'react';
// import {
//   Button,
//   DataList,
//   DataListItem,
//   DataListCell,
// } from '@patternfly/react-core';
import theme from '../../../theme';
import StatusIcon from '../../common/components/StatusIcon';
import { css } from '@emotion/core';

const CardStatusComponent = ({ type, dataList, ...props }) => {
  const successList = dataList.filter((item) => item.status === 'success');
  const failureList = dataList.filter((item) => item.status !== 'success');
  return (
    <React.Fragment>
      <div>
        <StatusIcon status="success" />
        <span style={{ fontSize: "28px", marginRight: ".75rem" }}>
          {successList.length}
        </span>
        {type} {type !== "plans" ? "connected" : "complete"}
      </div>
      <div >
        <StatusIcon status="failed" />
        <span style={{ fontSize: "28px", marginRight: ".75rem" }}>
          {failureList.length}
        </span>
        {type} not {type !== "plans" ? "connected" : "complete"}
      </div>
    </React.Fragment>

  );
};

export default CardStatusComponent;

