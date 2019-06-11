/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Flex, Box, Text } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import Select from 'react-select';
import VolumesTable from './VolumesTable';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import theme from '../../../../theme';
const VolumesForm = props => {
  const { setFieldValue, values } = props;
  const StyledTextContent = styled(TextContent)`
    margin: 1em 0 1em 0;
  `;
  return (
    <React.Fragment>
      <Box>
        <StyledTextContent>
          <TextList component="dl">
            <TextListItem component="dt">Choose to move or copy persistent volumes:</TextListItem>
          </TextList>
        </StyledTextContent>
        <VolumesTable setFieldValue={setFieldValue} values={values} />
      </Box>
      )}
    </React.Fragment>
  );
};
export default VolumesForm;
