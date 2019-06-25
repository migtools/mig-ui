/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Flex, Box } from '@rebass/emotion';

const MigrationStatus = ({ planStatusCounts, ...props }) => {
  // const notStartedList = [];
  // const inProgressList = [];
  // const completedList = [];
  // dataList.filter(migPlan => {
  // if (migPlan.Migrations.length > 0) {
  //   switch (migPlan.Migrations[0].status.phase) {
  //     case 'Completed':
  //       completedList.push(migPlan);
  //       break;
  //     default:
  //       inProgressList.push(migPlan);
  //       break;
  //   }
  // } else {
  //   notStartedList.push(migPlan);
  // }
  // });
  const { notStarted, inProgress, completed } = planStatusCounts;
  return (
    <React.Fragment>
      <Flex>
        <Box m="0 .5em 0 0" style={{ fontSize: '28px' }}>
          <div style={{ marginLeft: '1em' }}>{notStarted.length}</div>
        </Box>
        <Box style={{ margin: 'auto 0 auto 0' }}>Not started</Box>
      </Flex>
      <Flex>
        <Box m="0 .5em 0 0" style={{ fontSize: '28px' }}>
          <div style={{ marginLeft: '1em' }}>{inProgress.length}</div>
        </Box>
        <Box span={10} style={{ margin: 'auto 0 auto 0' }}>
          In progress
        </Box>
      </Flex>
      <Flex>
        <Box m="0 .5em 0 0" style={{ fontSize: '28px' }}>
          <div style={{ marginLeft: '1em' }}>{completed.length}</div>
        </Box>
        <Box span={10} style={{ margin: 'auto 0 auto 0' }}>
          Complete
        </Box>
      </Flex>
    </React.Fragment>
  );
};
export default MigrationStatus;
