import React from 'react';
import { Box } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import Select from 'react-select';
import TargetsTable from './TargetsTable';
interface IProps {
  values: any;
  errors: any;
  touched: any;
  handleBlur: any;
  handleChange: any;
  handleSubmit: any;
  setFieldValue: any;
  setFieldTouched: any;
  clusterList: any;
  storageList: any;
}
interface IState {
  clusterOptions: any[];
  storageOptions: any[];
  targetCluster: any;
  selectedStorage: any;
}
class MigTargetForm extends React.Component<IProps, IState> {
  state = {
    clusterOptions: [],
    storageOptions: [],
    targetCluster: null,
    selectedStorage: null,
  };
  populateClusterDropdown() {
    const myClusterOptions: any = [];
    const len = this.props.clusterList.length;
    for (let i = 0; i < len; i++) {
      if (
        this.props.clusterList[i].metadata.name !==
        this.props.values.sourceCluster
      ) {
        myClusterOptions.push({
          label: this.props.clusterList[i].metadata.name,
          value: this.props.clusterList[i].metadata.name,
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
      targetCluster,
      selectedStorage,
    } = this.state;
    return (
      <Box>
        <TextContent>
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
                setFieldValue('targetCluster', option.value);
                const matchingCluster = this.props.clusterList.filter(
                  items => items.metadata.name === option.value,
                );

                this.setState({ targetCluster: matchingCluster[0] });
                setFieldTouched('targetCluster');
              }}
              options={clusterOptions}
            />

            {errors.targetCluster && touched.targetCluster && (
              <div id="feedback">{errors.targetCluster}</div>
            )}
          </TextList>
        </TextContent>
        {values.targetCluster !== null &&

          <TargetsTable
            values={values}
          // selectedRepo={selectedRepo}
          // selectedTarget={selectedTarget}
          />
        }
      </Box>
    );
  }
}

export default MigTargetForm;
