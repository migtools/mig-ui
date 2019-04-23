import React, { Component } from 'react';
import { Dropdown, KebabToggle, Title } from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import DashboardCard from './DashboardCard';
import theme from '../../../theme';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import StatusIcon from '../../common/components/StatusIcon';
interface IState {
  isOpen: boolean;
}
interface IProps {
  title: string;
  dataList: any[];
  isFetching?: boolean;
  type?: string;
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
  renderStorageStatus() {
    const StorageStatusItem = styled.div`
      text-align: left;
      margin: 1em 0 .4em 0.4em;
    `;
    const { dataList, title, isFetching, type } = this.props;
    const successList = dataList.filter((item) => item.status === 'success')
    const failureList = dataList.filter((item) => item.status !== 'success')
    return (
      <React.Fragment>
        <StorageStatusItem>
          <StatusIcon status="success" />
          {successList.length} repositories connected
      </StorageStatusItem>
        <StorageStatusItem>
          <StatusIcon status="failed" />
          {failureList.length} not connected
      </StorageStatusItem>
      </React.Fragment>

    );
  }
  renderClusterStatus() {
    const ClusterStatusItem = styled.div`
      text-align: left;
      margin: 1em 0 .4em 0.4em;
    `;
    const { dataList, title, isFetching, type } = this.props;
    const successList = dataList.filter((item) => item.status === 'success')
    const failureList = dataList.filter((item) => item.status !== 'success')
    return (
      <React.Fragment>
        <ClusterStatusItem>
          <StatusIcon status="success" />
          {successList.length} clusters connected
      </ClusterStatusItem>
        <ClusterStatusItem>
          <StatusIcon status="failed" />
          {failureList.length} clusters not connected
      </ClusterStatusItem>
      </React.Fragment>

    );
  }
  renderPlanStatus() {
    const PlansStatusItem = styled.div`
      text-align: left;
      margin: 1em 0 .4em 0.4em;
    `;
    const { dataList, title, isFetching, type } = this.props;
    const successList = dataList.filter((item) => item.connectionStatus === 'success')
    const failureList = dataList.filter((item) => item.connectionStatus !== 'success')
    return (
      <React.Fragment>
        <PlansStatusItem>
          <StatusIcon status="success" />
          {successList.length} migrations successful
      </PlansStatusItem>
        <PlansStatusItem>
          <StatusIcon status="failed" />
          {failureList.length} migrations failed
      </PlansStatusItem>
      </React.Fragment>

    );
  }
  render() {
    const { dataList, title, isFetching, type } = this.props;
    const { isOpen } = this.state;
    return (
      <Flex>
        <DashboardCard>
          {dataList && !isFetching ? (
            <Flex flexDirection="column">
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
          {type === 'cluster' && this.renderClusterStatus()}
          {type === 'storage' && this.renderStorageStatus()}
          {type === 'plans' && this.renderPlanStatus()}


        </DashboardCard>
      </Flex>
    );
  }
}

export default CardComponent;
