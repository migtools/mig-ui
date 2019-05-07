/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import Select from 'react-select';
import TargetsTable from './TargetsTable';
import { Box, Flex, Text } from '@rebass/emotion';
import theme from '../../../theme';
import Loader from 'react-loader-spinner';
import { css } from '@emotion/core';
interface IProps {
  values: any;
  errors: any;
  touched: any;
  handleBlur: any;
  handleChange: any;
  setFieldValue: any;
  setFieldTouched: any;
  clusterList: any;
  storageList: any;
  onWizardLoadingToggle: (isLoading) => void;
}
interface IState {
  clusterOptions: any[];
  storageOptions: any[];
  targetCluster: any;
  selectedStorage: any;
  isLoading: boolean;
}
class MigTargetForm extends React.Component<IProps, IState> {
  state = {
    clusterOptions: [],
    storageOptions: [],
    targetCluster: null,
    selectedStorage: null,
    isLoading: false,
  };
  populateClusterDropdown() {
    const myClusterOptions: any = [];
    const len = this.props.clusterList.length;
    for (let i = 0; i < len; i++) {
      if (
        this.props.clusterList[i].MigCluster.metadata.name !==
        this.props.values.sourceCluster
      ) {
        myClusterOptions.push({
          label: this.props.clusterList[i].MigCluster.metadata.name,
          value: this.props.clusterList[i].MigCluster.metadata.name,
        });
      }
    }
    this.setState({ clusterOptions: myClusterOptions });
  }
  populateStorageDropdown() {
    const myStorageOptions: any = [];
    const len = this.props.storageList.length;
    for (let i = 0; i < len; i++) {
      myStorageOptions.push({
        label: this.props.storageList[i].metadata.name,
        value: this.props.storageList[i].metadata.name,
      });
    }
    this.setState({ storageOptions: myStorageOptions });
  }

  componentDidMount() {
    this.populateClusterDropdown();
    this.populateStorageDropdown();
  }
  render() {
    const {
      errors,
      touched,
      setFieldValue,
      setFieldTouched,
      values,
    } = this.props;
    const {
      clusterOptions,
      storageOptions,
    } = this.state;

    return (
      <Box>
        <TextContent
        >
          <TextList component="dl">
            <TextListItem component="dt">Replication Repository</TextListItem>
            <Select
              name="selectedStorage"
              onChange={option => {
                setFieldValue('selectedStorage', option.value);
                const matchingRepo = this.props.storageList.filter(
                  items => items.metadata.name === option.value,
                );

                this.setState({ selectedStorage: matchingRepo[0] });
              }}
              options={storageOptions}
            />

            {errors.targetCluster && touched.targetCluster && (
              <div id="feedback">{errors.targetCluster}</div>
            )}
            <TextListItem component="dt">Target Cluster</TextListItem>
            <Select
              name="targetCluster"
              onChange={option => {
                this.setState({ isLoading: true });
                this.props.onWizardLoadingToggle(true);

                setFieldValue('targetCluster', option.value);
                const matchingCluster = this.props.clusterList.filter(
                  c => c.MigCluster.metadata.name === option.value,
                );

                this.setState({ targetCluster: matchingCluster[0] });
                setFieldTouched('targetCluster');
                setTimeout(() => {
                  this.setState(() => ({ isLoading: false }));
                  this.props.onWizardLoadingToggle(false);
                }, 1500);

              }}
              options={clusterOptions}
            />

            {errors.targetCluster && touched.targetCluster && (
              <div id="feedback">{errors.targetCluster}</div>
            )}
          </TextList>
        </TextContent>
        {/* values.targetCluster !== null && */}
        {this.state.isLoading ?
          <Flex
            css={css`
                        height: 100%;
                        text-align: center;
                    `}
          >
            <Box flex="1" m="auto">
              <Loader
                type="ThreeDots"
                color={theme.colors.navy}
                height="100"
                width="100"
              />
              <Text fontSize={[2, 3, 4]}> Loading </Text>
            </Box>

          </Flex>

          :
          <Box mt={20}>
            <TargetsTable
              values={values}
            />
          </Box>
        }
      </Box>
    );
  }
}

export default MigTargetForm;
