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
    isFetchingPVList,
    currentPlan,
    getPVResourcesRequest,
    pvResourceList,
    isFetchingPVResources,
    isEdit
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
          isEdit={isEdit}
          isPVError={isPVError}
          isFetchingPVList={isFetchingPVList}
          setFieldValue={setFieldValue}
          values={values}
          currentPlan={currentPlan}
          getPVResourcesRequest={getPVResourcesRequest}
          pvResourceList={pvResourceList}
          isFetchingPVResources={isFetchingPVResources}
        />
      </GridItem>
    </Grid>
  );
};
export default VolumesForm;
