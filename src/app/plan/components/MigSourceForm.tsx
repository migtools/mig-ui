import React from "react";
import { Box } from "@rebass/emotion";
import { TextContent, TextList, TextListItem } from "@patternfly/react-core";
import Select from "react-select";
import NamespaceTable from "./NameSpaceTable";
class MigSourceForm extends React.Component<any> {
  state = {
    options: [],
    selectedOption: null
  };
  componentDidMount() {
    const myOptions: any = [];
    const len = this.props.clusterList.length;
    for (let i = 0; i < len; i++) {
      myOptions.push({
        label: this.props.clusterList[i].metadata.name,
        value: this.props.clusterList[i].metadata.name
      });
    }
    this.setState({ options: myOptions });
  }
  render() {
    const { errors, touched, setFieldValue } = this.props;
    const { options, selectedOption } = this.state;
    return (
      <Box>
        <TextContent>
          <TextList component="dl">
            <TextListItem component="dt">Source Cluster</TextListItem>
            <Select
              name="selectedCluster"
              onChange={option => {
                setFieldValue("selectedCluster", option.value);
                const matchingCluster = this.props.clusterList.filter(
                  items => items.metadata.name === option.value
                );

                this.setState({ selectedOption: matchingCluster[0] });
              }}
              options={options}
            />

            {errors.selectedCluster && touched.selectedCluster && (
              <div id="feedback">{errors.selectedCluster}</div>
            )}
          </TextList>
        </TextContent>
        <NamespaceTable selectedCluster={selectedOption} />
      </Box>
    );
  }
}

export default MigSourceForm;
