/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Box } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import StorageClassTable from './StorageClassTable';
import styled from '@emotion/styled';
const StorageClassForm = props => {
  const {
    setFieldValue,
    values,
    planList,
    storageClassList,
    storageClassFetch,
    isStorageClassError,
    isFetchingStorageClasses,
  } = props;
  const StyledTextContent = styled(TextContent)`
    margin: 1em 0 1em 0;
  `;
  return (
    <React.Fragment>
      <Box>
        <StyledTextContent>
          <TextList component="dl">
            <TextListItem component="dt">Select storage class for copied PVs:</TextListItem>
          </TextList>
        </StyledTextContent>
        <StorageClassTable
          storageClassList={storageClassList}
          storageClassFetch={storageClassFetch}
          isStorageClassError={isStorageClassError}
          isFetchingPVList={isFetchingStorageClasses}
          setFieldValue={setFieldValue}
          values={values}
          planList={planList}
        />
      </Box>
    </React.Fragment>
  );
};
export default StorageClassForm;
