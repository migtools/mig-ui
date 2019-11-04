/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import {
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import VolumesTable from './VolumesTable';

const VolumesForm = props => {
  const {
    setFieldValue,
    values,
    isPVError,
    currentPlan,
    getPVResourcesRequest,
    pvResourceList,
    isFetchingPVResources,
    isEdit,
    planUpdateRequest,
    startPlanStatusPolling,
    isPollingStatus
  } = props;

  useEffect(() => {
    planUpdateRequest(values);
    startPlanStatusPolling(values.planName);
  }, []); // Only re-run the effect if fetching value changes

  return (
    <Grid gutter="md">
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>
            Choose to move or copy persistent volumes:
          </Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <VolumesTable
          isEdit={isEdit}
          isPVError={isPVError}
          setFieldValue={setFieldValue}
          values={values}
          currentPlan={currentPlan}
          getPVResourcesRequest={getPVResourcesRequest}
          pvResourceList={pvResourceList}
          isFetchingPVResources={isFetchingPVResources}
          isPollingStatus={isPollingStatus}
        />
      </GridItem>
    </Grid>
  );
};
export default VolumesForm;
