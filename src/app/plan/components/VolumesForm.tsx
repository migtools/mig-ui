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
import theme from './../../../theme';
const StyledBox = styled(Box)`
  text-align: center;
`;
class VolumesForm extends React.Component<any> {
  state = {
    options: [],
    sourceCluster: null,
    isLoading: true,
  };

  componentDidMount() {
    this.props.onWizardLoadingToggle(true);

    setTimeout(() => {
      this.setState(() => ({ isLoading: false }));
      this.props.onWizardLoadingToggle(false);
    }, 500);
  }
  render() {
    const { errors, touched, setFieldValue, setFieldTouched, values } = this.props;
    const StyledTextContent = styled(TextContent)`
      margin: 1em 0 1em 0;
    `;
    return (
      <React.Fragment>
        {this.state.isLoading ? (
          <Flex
            css={css`
              height: 100%;
              text-align: center;
            `}
          >
            <Box flex="1" m="auto">
              <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100" />
              <Text fontSize={[2, 3, 4]}>
                {' '}
                Discovering persistent volumes attached to source projects.
              </Text>
            </Box>
          </Flex>
        ) : (
          <Box>
            <StyledTextContent>
              <TextList component="dl">
                <TextListItem component="dt">
                  Choose to move or copy persistent volumes:
                </TextListItem>
              </TextList>
            </StyledTextContent>
            <VolumesTable setFieldValue={setFieldValue} values={values} />
          </Box>
        )}
      </React.Fragment>
    );
  }
}

export default VolumesForm;
