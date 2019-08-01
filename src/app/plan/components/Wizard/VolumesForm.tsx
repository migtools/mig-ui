/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import VolumesTable from './VolumesTable';
import styled from '@emotion/styled';

const VolumesForm = props => {
  const { setFieldValue, values, isPVError, isFetchingPVList, planList } = props;
  const [myPlanList, setMyPlanList] = useState([]);

  const StyledTextContent = styled(TextContent)`
    margin: 1em 0 1em 0;
  `;
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const prevPlans: any = usePrevious(planList);

  useEffect(() => {
    if (JSON.stringify(prevPlans) !== JSON.stringify(planList)) {
      setMyPlanList(planList);
    }
  }, [planList, values, setFieldValue, isPVError, isFetchingPVList]);

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
        planList={myPlanList}
      />
    </Box>
  );
};
export default VolumesForm;
