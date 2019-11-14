/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Box } from '@rebass/emotion';
import {
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';
import StorageClassTable from './StorageClassTable';
import styled from '@emotion/styled';
const StorageClassForm = props => {
  const { setFieldValue, values, currentPlan, clusterList, isFetchingPVList } = props;
  return (
    <Grid gutter="md">
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>
            Select storage class for copied PVs:
          </Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <StorageClassTable
          isFetchingPVList={isFetchingPVList}
          setFieldValue={setFieldValue}
          values={values}
          currentPlan={currentPlan}
          clusterList={clusterList}
        />
      </GridItem>
    </Grid>
  );
};
export default StorageClassForm;
