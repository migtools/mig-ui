import React from 'react';
import {
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';
import StorageClassTable from './StorageClassTable';
const StorageClassForm = props => {
  const { isEdit, setFieldValue, values, currentPlan, clusterList, isFetchingPVList } = props;
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
          isEdit={isEdit}
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
