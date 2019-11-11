/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';
import StorageClassTable from './StorageClassTable';
const StorageClassForm = props => {
  const { setFieldValue, values, currentPlan, clusterList, isReconciling } = props;
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
          isReconciling={isReconciling}
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
