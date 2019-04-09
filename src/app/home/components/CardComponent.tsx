import React, { Component } from 'react';
import { Dropdown, KebabToggle, Title } from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import DashboardCard from './DashboardCard';
import theme from '../../../theme';
import Loader from 'react-loader-spinner';

interface IState {
  isOpen: boolean;
}
interface IProps {
  title: string;
  dataList: any[];
  isFetching?: boolean;
}

class CardComponent extends Component<IProps, IState> {
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
    const { dataList, title, isFetching } = this.props;
    const { isOpen } = this.state;
    return (
      <Flex>
        <DashboardCard>
          {dataList && !isFetching ? (
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
                <Title headingLevel="h3" size="2xl">
                  {dataList.length || 0} {title}{' '}
                </Title>
              </Box>
            </Flex>
          ) : (
            <Loader
              type="ThreeDots"
              color={theme.colors.navy}
              height="100"
              width="100"
            />
          )}
        </DashboardCard>
      </Flex>
    );
  }
}

export default CardComponent;
