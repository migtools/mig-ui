import React, { useEffect, useState } from 'react';
import { IRow, Table, TableBody, TableHeader, sortable } from '@patternfly/react-table';
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
  Tooltip,
  TooltipPosition,
  Level,
  LevelItem,
  Pagination,
} from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { IAnalytic } from '../../../../plan/duck/types';
import ReactJson from 'react-json-view';
import { useSortState } from '../../../../common/duck/hooks';
import { usePaginationState } from '../../../../common/duck/hooks/usePaginationState';
const styles = require('./AnalyticsTable.module').default;

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
  const getSortValues = (namespaceFromAnalytic: any) => {
    const {
      namespace,
      k8sResourceTotal,
      pvCount,
      pvCapacity,
      imageCount,
      imageSizeTotal,
    } = namespaceFromAnalytic;
    return [namespace, k8sResourceTotal, pvCount, pvCapacity, imageCount];
  };

  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);

  useEffect(() => {
    setIsLoadingAnalytics(
      (analyticPercentComplete !== 100 && latestAnalytic) || isRefreshingAnalytic ? true : false
    );
  }, [analyticPercentComplete, latestAnalytic, isRefreshingAnalytic]);

  const columns = [
    { title: 'Namespace', transforms: [sortable] },
    { title: 'Kubernetes resources', transforms: [sortable] },
    { title: 'PVCs', transforms: [sortable] },
    { title: 'PVC capacity', transforms: [sortable] },
    { title: 'Images', transforms: [sortable] },
    { title: 'Image size', transforms: [sortable] },
    { title: '' },
  ];

  function ProgressWrapper() {
    return (
      <Progress
        value={analyticPercentComplete ? analyticPercentComplete : 0}
        title={'Retrieving namespace details'}
        size="sm"
      />
    );
  }

  const namespaces = latestAnalytic?.status?.analytics?.namespaces
    ? latestAnalytic?.status?.analytics?.namespaces
    : [];
  const { sortBy, onSort, sortedItems } = useSortState(namespaces, getSortValues);
  const { currentPageItems, setPageNumber, paginationProps } = usePaginationState(sortedItems, 10);
  useEffect(() => setPageNumber(1), [sortBy, setPageNumber]);

  const rows: IRow[] = [];
  currentPageItems.forEach((namespace) => {
    const {
      namespace: name,
      k8sResourceTotal,
      pvCount,
      pvCapacity,
      imageCount,
      imageSizeTotal,
    } = namespace;
    rows.push({
      cells: [
        { title: name || 0 },
        {
          title: (
            <>
              <span className={spacing.mrSm}>{namespace.k8sResourceTotal || 0}</span>
              {k8sResourceTotal > 10000 && (
                <Tooltip
                  position={TooltipPosition.top}
                  content={
                    <div>
                      The namespace contains a large number of Kubernetes resources. Migrating this
                      many namespaces might take a very long time. We recommend removing unecessary
                      resources before attempting a migration.
                    </div>
                  }
                  aria-label="warning-details"
                  isContentLeftAligned
                  maxWidth="20rem"
                >
                  <span className="pf-c-icon pf-m-warning">
                    <ExclamationTriangleIcon />
                  </span>
                </Tooltip>
              )}
            </>
          ),
        },
        { title: pvCount || 0 },
        { title: pvCapacity || 0 },
        { title: imageCount || 0 },
        { title: imageSizeTotal || 0 },
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
                    <Title headingLevel="h5">No namespace data found</Title>
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
      ],
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
    rows.push(totalsRow);
  });

  const staleCompleteValue = isRefreshingAnalytic && analyticPercentComplete === 100;

  if (isPlanLocked || staleCompleteValue) {
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

  if (isRefreshingAnalytic || isLoadingAnalytics) {
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

  if (migAnalytics?.length === 0) {
    return (
      <Bullseye>
        <EmptyState variant="small">
          <Title headingLevel="h2" size="xl">
            No analytics started
          </Title>
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <>
      <Level>
        <LevelItem />
        <LevelItem>
          <Pagination {...paginationProps} widgetId="providers-table-pagination-top" />
        </LevelItem>
      </Level>
      <Table
        aria-label="migration-analytics-table"
        cells={columns}
        rows={rows}
        onSort={onSort}
        className={`${spacing.mtMd}`}
      >
        <TableHeader />
        <TableBody />
      </Table>

      <Pagination variant="bottom" {...paginationProps} widgetId="providers-table-pagination-top" />
    </>
  );
};

export default AnalyticsTable;
