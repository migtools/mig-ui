import React from 'react';
import { Box } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import Select from 'react-select';
import NamespaceTable from './NameSpaceTable';
class MigSourceForm extends React.Component<any> {
  state = {
    options: [],
    sourceCluster: null,
  };

  componentDidMount() {
    const myOptions: any = [];
    const len = this.props.clusterList.length;
    for (let i = 0; i < len; i++) {
      myOptions.push({
        label: this.props.clusterList[i].metadata.name,
        value: this.props.clusterList[i].metadata.name,
      });
    }
    this.setState({ options: myOptions });
  }
  render() {
    const { errors, touched, setFieldValue, setFieldTouched } = this.props;
    const { options, sourceCluster } = this.state;
    return (
      <Box>
        <TextContent>
          <TextList component="dl">
            <TextListItem component="dt">Source Cluster</TextListItem>
            <Select
              name="sourceCluster"
              onChange={option => {
                setFieldValue('sourceCluster', option.value);
                const matchingCluster = this.props.clusterList.filter(
                  items => items.metadata.name === option.value,
                );

                this.setState({ sourceCluster: matchingCluster[0] });
                setFieldTouched('sourceCluster');
              }}
              options={options}
            />

            {errors.sourceCluster && touched.sourceCluster && (
              <div id="feedback">{errors.sourceCluster}</div>
            )}
          </TextList>
        </TextContent>
        <NamespaceTable
          setFieldValue={setFieldValue}
          sourceCluster={sourceCluster}
        />
      </Box>
    );
  }
}

export default MigSourceForm;
