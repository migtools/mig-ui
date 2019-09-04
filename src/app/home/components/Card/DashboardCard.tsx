/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Component } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@patternfly/react-core';
import theme from '../../../../theme';
import Loader from 'react-loader-spinner';
import CardStatus from './Status/CardStatus';
import MigrationStatus from './Status/MigrationStatus';
import HeaderText from './HeaderText';
import FooterText from './FooterText';
import StatusIcon from '../../../common/components/StatusIcon';

interface IState {
  isOpen: boolean;
}
interface IProps {
  title: string;
  dataList: any[];
  isFetching: boolean;
  type?: string;
  isError: boolean;
  planStatusCounts?: any;
  expandDetails?: (string) => void;
}

class DashboardCard extends Component<IProps, IState> {
  state = {
    isOpen: false,
  };

  onToggle = isOpen => {
    this.setState({
      isOpen,
    });
  };

  onSelect = event => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };
  render() {
    const { dataList, title, isFetching, type, isError, planStatusCounts, expandDetails } = this.props;
    const { isOpen } = this.state;
    if (isError) {
      return (
        <Card>
          <CardBody>
            <div className="pf-l-flex pf-u-h-100 pf-m-align-items-center pf-m-justify-content-center">
              <div className="pf-l-flex__item">
                <StatusIcon isReady={false} />
              </div>
              <div className="pf-l-flex__item">
                Failed to fetch
              </div>
            </div>
          </CardBody>
        </Card>
      );
    }
    return (
      <Card>
        {dataList && !isFetching ? (
          <React.Fragment>
            <CardHeader>
              <HeaderText type={type} dataList={dataList} />
            </CardHeader>
            <CardBody>
              {type === 'plans' ? (
                <MigrationStatus planStatusCounts={planStatusCounts} />
              ) : (
                  <CardStatus dataList={dataList} type={type} />
                )}
            </CardBody>
            <CardFooter>
              <FooterText dataList={dataList} type={type} expandDetails={expandDetails} />
            </CardFooter>
          </React.Fragment>
        ) : (
          <CardBody>
            <div className="pf-l-flex pf-u-h-100 pf-m-align-items-center
            pf-m-justify-content-center pf-m-column pf-m-space-items-xs">
              <div className="pf-l-flex__item">
                <Loader type="ThreeDots" color={theme.colors.navy} height="40" width="60" />
              </div>
              <div className="pf-l-flex__item">
                Loading...
              </div>
            </div>
          </CardBody>
          )}
      </Card>
    );
  }
}

export default DashboardCard;
