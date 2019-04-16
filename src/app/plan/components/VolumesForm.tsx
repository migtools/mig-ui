import React from 'react';
import { Box } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import Select from 'react-select';
import VolumesTable from './VolumesTable';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import theme from "./../../../theme";
const StyledBox = styled(Box)`
  text-align: center;
  `;
class VolumesForm extends React.Component<any> {
  state = {
    options: [],
    sourceCluster: null,
    isLoading: true
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState(() => ({ isLoading: false }))
    }, 500);
  }
  render() {
    const { errors, touched, setFieldValue, setFieldTouched, values } = this.props;
    const StyledTextContent = styled(TextContent)` margin: 1em 0 1em 0;`;
    return (
      <React.Fragment>
        {this.state.isLoading ?
          <StyledBox >
            <Loader
              type="ThreeDots"
              color={theme.colors.navy}
              height="100"
              width="100"
            />
          </StyledBox>

          :
          <Box>
            <StyledTextContent
            >
              <TextList component="dl">
                <TextListItem component="dt">Choose to move or copy persistent volumes:</TextListItem>
              </TextList>
            </StyledTextContent>
            <VolumesTable
              setFieldValue={setFieldValue}
              values={values}
            />
          </Box>
        }
      </React.Fragment>
    );
  }
}

export default VolumesForm;
