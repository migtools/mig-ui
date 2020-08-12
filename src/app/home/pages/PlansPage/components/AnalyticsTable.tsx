import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import {
  Button,
  Bullseye,
  EmptyState,
  Title,
  Text,
  TextContent,
  TextVariants,
  Spinner,
  Popover,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateVariant,
  PopoverPosition,
  Progress,
  ProgressSize,
  ProgressVariant,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IAnalytic } from '../../../../plan/duck/types';
import ReactJson from 'react-json-view';
const styles = require('./AnalyticsTable.module');

interface IProps {
  migAnalytics?: IAnalytic[];
  id?: string;
  type?: string;
  isPlanLocked: boolean;
  isRefreshingAnalytic: boolean;
  latestAnalytic: IAnalytic;
  analyticPercentComplete: number;
}

const AnalyticsTable: React.FunctionComponent<IProps> = ({
  migAnalytics,
  isPlanLocked,
  latestAnalytic,
  analyticPercentComplete,
  isRefreshingAnalytic,
}) => {
  const [currentRows, setCurrentRows] = useState([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);

  const columns = [
    { title: 'Namespace' },
    { title: 'Kubernetes resources' },
    { title: 'PVCs' },
    { title: 'PVC capacity' },
    { title: 'Images' },
    { title: 'Image size' },
    { title: '' },
  ];

  function ProgressWrapper() {
    return (
      <Progress
        value={latestAnalytic?.status?.analytics?.percentComplete || 0}
        title={'Retrieving namespace details'}
        size={ProgressSize.sm}
        variant={ProgressVariant.info}
      />
    );
  }

  useEffect(() => {
    const namespaces = latestAnalytic?.status?.analytics?.namespaces
      ? latestAnalytic?.status?.analytics?.namespaces
      : [];

    setIsLoadingAnalytics(
      (analyticPercentComplete !== 100 && latestAnalytic) || isRefreshingAnalytic ? true : false
    );

    const mappedRows = namespaces.map((namespace) => {
      const rowCells = [
        { title: namespace?.namespace || 0 },
        { title: namespace.k8sResourceTotal || 0 },
        { title: namespace.pvCount || 0 },
        { title: namespace.pvCapacity || 0 },
        { title: namespace.imageCount || 0 },
        { title: namespace.imageSizeTotal || 0 },
        {
          title: (
            <Popover
              className={styles.jsonPopover}
              position={PopoverPosition.top}
              bodyContent={
                namespace ? (
                  <ReactJson src={namespace} enableClipboard={false} />
                ) : (
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={ExclamationTriangleIcon} />
                    <Title headingLevel="h5" size="sm">
                      No namespace data found
                    </Title>
                    <EmptyStateBody>Unable to retrieve namespace data</EmptyStateBody>
                  </EmptyState>
                )
              }
              aria-label="pv-details"
              closeBtnAriaLabel="close-pv-details"
              maxWidth="200rem"
            >
              <Button isDisabled={isLoadingAnalytics} variant="link">
                View JSON
              </Button>
            </Popover>
          ),

          props: {
            className: 'pf-c-table__action',
          },
        },
      ];
      return {
        cells: rowCells,
      };
    });
    const analytics = latestAnalytic?.status?.analytics || [];
    const totalsRowCells = analytics
      ? [
          {
            title: (
              <TextContent className={spacing.mbMd}>
                <Text component={TextVariants.h5}> Plan total</Text>
              </TextContent>
            ),
          },
          {
            title: (
              <TextContent className={spacing.mbMd}>
                <Text component={TextVariants.h5}> {analytics.k8sResourceTotal || 0}</Text>
              </TextContent>
            ),
          },
          {
            title: (
              <TextContent className={spacing.mbMd}>
                <Text component={TextVariants.h5}> {analytics.pvCount || 0}</Text>
              </TextContent>
            ),
          },
          {
            title: (
              <TextContent className={spacing.mbMd}>
                <Text component={TextVariants.h5}> {analytics.pvCapacity || 0}</Text>
              </TextContent>
            ),
          },
          {
            title: (
              <TextContent className={spacing.mbMd}>
                <Text component={TextVariants.h5}> {analytics.imageCount || 0}</Text>
              </TextContent>
            ),
          },
          {
            title: (
              <TextContent className={spacing.mbMd}>
                <Text component={TextVariants.h5}> {analytics.imageSizeTotal || 0}</Text>
              </TextContent>
            ),
          },
        ]
      : [];
    const totalsRow = {
      cells: totalsRowCells,
      isTotalsRow: true,
    };
    mappedRows.push(totalsRow);
    setCurrentRows(mappedRows);
  }, [migAnalytics, isRefreshingAnalytic]);

  if (isPlanLocked) {
    return (
      <Bullseye>
        <EmptyState variant="small">
          <div className="pf-c-empty-state__icon">
            <Spinner size="xl" />
          </div>
        </EmptyState>
      </Bullseye>
    );
  }

  if (isLoadingAnalytics) {
    return (
      <Bullseye>
        <EmptyState variant="small">
          <div className="pf-c-empty-state__icon">
            <ProgressWrapper />
          </div>
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <React.Fragment>
      {migAnalytics?.length > 0 ? (
        <Table
          aria-label="migrations-history-table"
          cells={columns}
          rows={currentRows}
          className={styles.customTableStyle}
        >
          <TableHeader />
          <TableBody />
        </Table>
      ) : (
        <Bullseye>
          <EmptyState variant="small">
            <Title headingLevel="h2" size="xl">
              No analytics started
            </Title>
          </EmptyState>
        </Bullseye>
      )}
    </React.Fragment>
  );
};

export default AnalyticsTable;
