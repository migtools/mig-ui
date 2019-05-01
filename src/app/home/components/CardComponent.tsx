import React, { Component } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Title } from '@patternfly/react-core';
import theme from '../../../theme';
import Loader from 'react-loader-spinner';
import CardStatusComponent from './CardStatusComponent';
import MigrationStatusComponent from './MigrationStatusComponent';
import FooterText from './FooterText';
import HeaderText from './HeaderText';
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
  render() {
    const { dataList, title, isFetching, type } = this.props;
    const { isOpen } = this.state;
    return (
      <Card style={{ minHeight: "100%" }}>
        <CardHeader>
          {dataList && !isFetching ? (
            <Title size="md">
              <HeaderText type={type} dataList={dataList} />
            </Title>
          ) : (
              <Loader
                type="ThreeDots"
                color={theme.colors.navy}
                height="100"
                width="100"
              />
            )}
        </CardHeader>
        <CardBody>
          {type === "plans" ?
            <MigrationStatusComponent dataList={dataList} /> :
            <CardStatusComponent dataList={dataList} type={type} />
          }
        </CardBody>
        <CardFooter>
          <FooterText dataList={dataList} type={type} />
        </CardFooter>
      </Card>
    );
  }
}

export default CardComponent;
