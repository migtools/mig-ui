import React from 'react';
import { Box } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import Select from 'react-select';
import VolumesTable from './VolumesTable';
import { css } from '@emotion/core';
class VolumesForm extends React.Component<any> {
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
    const { errors, touched, setFieldValue, setFieldTouched, values } = this.props;
    const { options, sourceCluster } = this.state;
    return (
      <Box>
        <TextContent
          //@ts-ignore
          css={css`margin: 5px;`}
        >
          <TextList component="dl">
            <TextListItem component="dt">Choose to move or copy persistent volumes:</TextListItem>
          </TextList>
        </TextContent>
        <VolumesTable
          setFieldValue={setFieldValue}
          sourceCluster={sourceCluster}
          values={values}
        />
      </Box>
    );
  }
}

export default VolumesForm;
