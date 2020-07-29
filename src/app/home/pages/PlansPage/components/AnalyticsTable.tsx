import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import {
  Bullseye,
  EmptyState,
  Title,
  Text,
  TextContent,
  TextVariants,
  Spinner,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IAnalytic } from '../../../../plan/duck/types';
const styles = require('./AnalyticsTable.module');

interface IProps {
  migAnalytics?: IAnalytic[];
  id?: string;
  type?: string;
  isPlanLocked?: boolean;
}

const AnalyticsTable: React.FunctionComponent<IProps> = ({ migAnalytics, isPlanLocked }) => {
  const [currentRows, setCurrentRows] = useState([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const columns = [
    { title: 'Namespace' },
    { title: 'Total Kubernetes resources' },
    { title: 'Total PVCs' },
    { title: 'Total PVC capacity' },
    { title: 'Total images' },
    { title: 'Total image size' },
  ];

  useEffect(() => {
    const latestMigAnalytic = migAnalytics ? migAnalytics[0] : null;
    const namespaces = latestMigAnalytic?.status?.analytics?.namespaces
      ? latestMigAnalytic?.status?.analytics?.namespaces
      : [];

    setIsLoadingAnalytics(
      latestMigAnalytic?.status?.analytics?.percentComplete !== 100 ? true : false
    );

    const mappedRows = namespaces.map((namespace) => {
      console.log('analytic');
      const rowCells = [
        { title: namespace?.namespace || 0 },
        { title: namespace.k8sResourceTotal || 0 },
        { title: namespace.pvCount || 0 },
        { title: namespace.pvCapacity || 0 },
        { title: namespace.imageCount || 0 },
        { title: namespace.imageSizeTotal || 0 },
        // {
        //   title: <MigrationActions migration={migration} />,
        //   props: {
        //     className: 'pf-c-table__action',
        //   },
        // },
      ];
      return {
        cells: rowCells,
      };
    });
    const analytics = latestMigAnalytic?.status?.analytics || [];
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
  }, [migAnalytics]);

  if (isPlanLocked || isLoadingAnalytics) {
    return (
      <Bullseye>
        <EmptyState variant="small">
          <div className="pf-c-empty-state__icon">
            <Spinner size="xl" />
          </div>

          {isLoadingAnalytics && (
            <Title headingLevel="h2" size="xl">
              Retrieving namespace details
            </Title>
          )}
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
