/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Title
} from '@patternfly/react-core';
import theme from '../../../../theme';
import Loader from 'react-loader-spinner';
import CardStatus from './Status/CardStatus';
import MigrationStatus from './Status/MigrationStatus';
import CardFooterText from './CardFooterText';
import HeaderText from './HeaderText';
import StatusIcon from '../../../common/components/StatusIcon';

interface IProps {
  title: string;
  dataList: any[];
  isFetching: boolean;
  type?: string;
  isError: boolean;
  planStatusCounts?: any;
  expandDetails?: (string) => void;
}

const DashboardCard: React.FunctionComponent<IProps> = (
  {
    dataList,
    isFetching,
    type,
    isError,
    planStatusCounts,
    expandDetails
  }
) => {
  if (isError) {
    return (
      <Card style={{ minHeight: '100%', height: '16em' }}>
        <div className="pf-l-flex">
          <div className="pf-l-flex__item">
            <StatusIcon isReady={false} />
          </div>
          <div className="pf-l-flex__item">
            Failed to fetch
            </div>
        </div>
      </Card>
    );
  }
  return (
    <Card style={{ minHeight: '100%', height: '16em' }}>
      {dataList && !isFetching ? (
        <React.Fragment>
          <CardHeader>
            <Title size="md">
              <HeaderText type={type} dataList={dataList} />
            </Title>
          </CardHeader>
          <CardBody>
            {type === 'plans' ? (
              <MigrationStatus planStatusCounts={planStatusCounts} />
            ) : (
                <CardStatus dataList={dataList} type={type} />
              )}
          </CardBody>
          <CardFooter>
            <CardFooterText dataList={dataList} type={type} expandDetails={expandDetails} />
          </CardFooter>
        </React.Fragment>
      ) : (
          <CardBody>
            <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100" />
            Loading
          </CardBody>
        )}
    </Card>
  );
};

export default DashboardCard;