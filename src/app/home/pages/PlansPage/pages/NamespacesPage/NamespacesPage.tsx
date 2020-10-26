import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  PageSection,
  Bullseye,
  EmptyState,
  Spinner,
  Title,
  Alert,
  Button,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { push } from 'connected-react-router';
import { IReduxState } from '../../../../../../reducers';
import { IMigPlan } from '../../../../../plan/duck/types';

interface INamespacesPageProps {
  planList: IMigPlan[];
  refreshAnalyticRequest: (analyticName: string) => void;
  isRefreshingAnalytic: boolean;
}

const NamespacesPage: React.FunctionComponent<INamespacesPageProps> = ({
  planList,
  addPlanDisabledObj,
}: INamespacesPageProps) => {
  const isLoadingAnalytic: boolean =
    // initial loading state to show when a miganalytic is first started or updated.
    !!(plan?.PlanStatus?.analyticPercentComplete !== 100 && plan.PlanStatus.latestAnalytic) ||
    // Plan is currenlty being Closed/Deleted
    plan.PlanStatus.isPlanLocked ||
    // Analytic is being manually refreshed
    isRefreshingAnalytic;

  const noMigAnlyticFound: boolean = plan?.Analytics?.length === 0;

  const { planName } = useParams();

  const refreshDebugTree = () => {
    fetchDebugTree(planName);
  };

  useEffect(() => {
    refreshDebugTree();
  }, []);

  const viewRawDebugObject = (node: IDebugTreeNode) => {
    routeRawDebugObject(node.objectLink);
  };

  const [searchText, setSearchText] = useState('');

  const filterSubtree = (items: TreeViewDataItem[]): TreeViewDataItem[] =>
    items
      .map((item) => {
        const nameMatches = (item.name as string).toLowerCase().includes(searchText.toLowerCase());
        if (!item.children) {
          return nameMatches ? item : null;
        }
        const filteredChildren = filterSubtree(item.children);
        if (filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter((item) => !!item) as TreeViewDataItem[];

  const treeData = debug.tree && convertRawTreeToViewTree(debug.tree, viewRawDebugObject);
  let filteredTreeData = treeData;
  if (searchText && treeData) {
    filteredTreeData = filterSubtree(treeData);
  }

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1" size="2xl">
          Migration plan resources (DEBUG)
        </Title>
      </PageSection>
      <PageSection>
        {debug.errMsg ? (
          <Alert variant="danger" title={`Error loading debug data for plan "${planName}"`}>
            <p>{debug.errMsg}</p>
          </Alert>
        ) : debug.isLoading ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <>
            <Flex className={`${spacing.mlXl} ${spacing.plXl} ${spacing.myMd}`}>
              <FlexItem>
                <Button
                  id="add-plan-btn"
                  onClick={() => refreshAnalyticRequest(plan.MigPlan.metadata.name)}
                  isDisabled={isLoadingAnalytic}
                  variant="secondary"
                >
                  Refresh
                </Button>
              </FlexItem>
              <FlexItem>
                <TextContent>
                  {!isLoadingAnalytic && (
                    <Text component={TextVariants.small}>
                      Last updated:{` `}
                      {moment(plan.PlanStatus.latestAnalyticTransitionTime)
                        .local()
                        .format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  )}
                </TextContent>
              </FlexItem>
            </Flex>
            <AnalyticsTable
              type="Migrations"
              analyticPercentComplete={plan.PlanStatus.analyticPercentComplete}
              latestAnalytic={plan.PlanStatus.latestAnalytic}
              migAnalytics={plan.Analytics}
              isPlanLocked={plan.PlanStatus.isPlanLocked}
              isRefreshingAnalytic={isRefreshingAnalytic}
              id="migrations-history-expansion-table"
            />
          </>
        )}
      </PageSection>
    </>
  );
};

export const PlanDebugPage = connect((state: IReduxState) => ({
  planList: state.plan.migPlanList,
}))(NamespacesPage);
