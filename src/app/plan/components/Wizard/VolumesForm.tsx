/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Box } from '@rebass/emotion';
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
    isReconciling,
  } = props;

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
          isPVError={isPVError}
          setFieldValue={setFieldValue}
          values={values}
          currentPlan={currentPlan}
          getPVResourcesRequest={getPVResourcesRequest}
          pvResourceList={pvResourceList}
          isReconciling={isReconciling}
        />
      </GridItem>
    </Grid>
  );
};
export default VolumesForm;
