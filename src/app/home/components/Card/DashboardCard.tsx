/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import {
  Bullseye,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  EmptyState,
  Title,
} from '@patternfly/react-core';
import theme from '../../../../theme';
import Loader from 'react-loader-spinner';
import CardStatus from './Status/CardStatus';
import MigrationStatus from './Status/MigrationStatus';
import CardFooterText from './CardFooterText';
import HeaderText from './HeaderText';
import StatusIcon from '../../../common/components/StatusIcon';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

interface IProps {
  title: string;
  dataList: any[];
  isFetching: boolean;
  type?: string;
  isError: boolean;
  planStatusCounts?: any;
  loadingTitle: string;
  expandDetails?: (string) => void;
}

const DashboardCard: React.FunctionComponent<IProps> = (
  {
    dataList,
    isFetching,
    type,
    isError,
    planStatusCounts,
    expandDetails,
    loadingTitle,
  }
) => {
  if (isError) {
    return (
      <Card>
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
    <Card>
      {dataList && !isFetching ? (
        <React.Fragment>
          <CardHeader>
            <Title size="xl" headingLevel="h2">
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
          <Bullseye>
            <EmptyState variant="small">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                {loadingTitle}
              </Title>
            </EmptyState>
          </Bullseye>
        </CardBody>
      )}
    </Card>
  );
};

export default DashboardCard;
