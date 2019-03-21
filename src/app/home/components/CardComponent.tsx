import React, { Component } from 'react';
import { Dropdown, KebabToggle } from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import DashboardCard from './DashboardCard';
import theme from '../../../theme';

class CardComponent extends Component<any, any> {
  state = {
    isOpen: false,
  };

  onToggle = isOpen => {
    this.setState({
      isOpen,
    });
  }

  onSelect = event => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  render() {
    const { dataList, title } = this.props;
    const { isOpen } = this.state;
    return (
      <Flex>
        <DashboardCard width="20em" flex="1" m={10} p={10}>
          <Flex flexDirection="column">
            <Box ml="auto" textAlign="right">
              <Dropdown
                onSelect={this.onSelect}
                toggle={<KebabToggle onToggle={this.onToggle} />}
                isOpen={isOpen}
                isPlain
                dropdownItems={[]}
              />
            </Box>
            <Box fontSize="2em" fontWeight="200" color={theme.colors.navy}>
              {dataList.length} {title}
            </Box>
          </Flex>
        </DashboardCard>
      </Flex>
    );
  }
}

export default CardComponent;
