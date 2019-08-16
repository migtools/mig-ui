/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Box } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import VolumesTable from './VolumesTable';
import styled from '@emotion/styled';
const VolumesForm = props => {
  const {
    setFieldValue,
    values,
    isPVError,
    isFetchingPVList,
    currentPlan,
    getPVResourcesRequest,
    pvResourceList,
    isFetchingPVResources
  } = props;
  const StyledTextContent = styled(TextContent)`
    margin: 1em 0 1em 0;
  `;
  return (
    <Box>
      <StyledTextContent>
        <TextList component="dl">
          <TextListItem component="dt">Choose to move or copy persistent volumes:</TextListItem>
        </TextList>
      </StyledTextContent>
      <VolumesTable
        isPVError={isPVError}
        isFetchingPVList={isFetchingPVList}
        setFieldValue={setFieldValue}
        values={values}
        currentPlan={currentPlan}
        getPVResourcesRequest={getPVResourcesRequest}
        pvResourceList={pvResourceList}
        isFetchingPVResources={isFetchingPVResources}
      />
    </Box>
  );
};
export default VolumesForm;
