/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Box, Flex, Text } from '@rebass/emotion';
import theme from '../../../../theme';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import Select from 'react-select';
import NamespaceTable from './NameSpaceTable';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
class MigSourceForm extends React.Component<any> {
  state = {
    options: [],
    sourceCluster: null,
    isLoading: false,
    selectedOption: null,
  };

  componentDidMount() {
    const { clusterList } = this.props;
    if (clusterList.length) {
      const myOptions: any = [];
      const len = this.props.clusterList.length;
      for (let i = 0; i < len; i++) {
        myOptions.push({
          label: this.props.clusterList[i].MigCluster.metadata.name,
          value: this.props.clusterList[i].MigCluster.metadata.name,
        });
      }
      this.setState({ options: myOptions });
      //check existing data

      if (this.props.values.sourceCluster !== null) {
        const matchingCluster = this.props.clusterList.filter(
          c => c.MigCluster.metadata.name === this.props.values.sourceCluster
        );

        this.setState({
          sourceCluster: matchingCluster[0].MigCluster,
          selectedOption: {
            label: matchingCluster[0].MigCluster.metadata.name,
            value: matchingCluster[0].MigCluster.metadata.name,
          },
        });

        // this.props.setFieldValue('sourceCluster', this.props.values.sourceCluster);
        // this.setState({
        //   selectedValue: this.props.values.sourceCluster,
        // });
        this.setState({ isLoading: true });
        this.props.onWizardLoadingToggle(true);
        setTimeout(() => {
          this.setState(() => ({ isLoading: false }));
          this.props.onWizardLoadingToggle(false);
        }, 500);
      }
    } else {
      const myOptions: any = [];
      myOptions.push({
        label: 'No Valid Clusters Found',
        value: 'N/A',
      });
      this.setState({ options: myOptions });
    }
  }
  handleSourceChange = option => {
    this.props.setFieldValue('sourceCluster', option.value);
    const matchingCluster = this.props.clusterList.filter(
      c => c.MigCluster.metadata.name === option.value
    );

    this.setState({
      sourceCluster: matchingCluster[0].MigCluster,
      selectedOption: {
        label: matchingCluster[0].MigCluster.metadata.name,
        value: matchingCluster[0].MigCluster.metadata.name,
      },
    });
    this.props.setFieldTouched('sourceCluster');
    this.setState({ isLoading: true });
    this.props.onWizardLoadingToggle(true);
    setTimeout(() => {
      this.setState(() => ({ isLoading: false }));
      this.props.onWizardLoadingToggle(false);
    }, 500);
  };
  render() {
    const { errors, touched, setFieldValue, setFieldTouched, values } = this.props;
    const { selectedOption, options, sourceCluster } = this.state;
    return (
      <Box>
        <TextContent>
          <TextList component="dl">
            <TextListItem component="dt">Source Cluster</TextListItem>
            <Select
              css={css`
                width: 20em;
              `}
              name="sourceCluster"
              onChange={this.handleSourceChange}
              options={options}
              value={selectedOption}
            />
            {errors.sourceCluster && touched.sourceCluster && (
              <div id="feedback">{errors.sourceCluster}</div>
            )}
          </TextList>
        </TextContent>
        {this.state.isLoading ? (
          <Flex
            css={css`
              height: 100%;
              text-align: center;
            `}
          >
            <Box flex="1" m="auto">
              <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100" />
              <Text fontSize={[2, 3, 4]}> Discovering namespaces</Text>
            </Box>
          </Flex>
        ) : (
          <NamespaceTable
            setFieldValue={setFieldValue}
            sourceCluster={sourceCluster}
            values={values}
          />
        )}
      </Box>
    );
  }
}

export default MigSourceForm;
