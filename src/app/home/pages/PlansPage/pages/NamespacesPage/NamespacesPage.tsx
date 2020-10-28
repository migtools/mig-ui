import React, { useContext, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
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
  TextContent,
  TextVariants,
  Text,
  Grid,
  GridItem,
  Breadcrumb,
  BreadcrumbItem,
} from '@patternfly/react-core';
import { IReduxState } from '../../../../../../reducers';
import { IPlan } from '../../../../../plan/duck/types';
import { PlanActions, planSelectors } from '../../../../../plan/duck';
import AnalyticsTable from '../../components/AnalyticsTable';
import moment from 'moment';
import { PollingContext } from '../../../../duck/context';

interface INamespacesPageProps {
  planList: IPlan[];
  refreshAnalyticRequest: (analyticName: string) => void;
  isRefreshingAnalytic: boolean;
}

const BaseNamespacesPage: React.FunctionComponent<INamespacesPageProps> = ({
  planList,
  isRefreshingAnalytic,
  refreshAnalyticRequest,
}: INamespacesPageProps) => {
  const { planName } = useParams();
  const plan = planList.find((planItem: IPlan) => planItem.MigPlan.metadata.name === planName);
  const history = useHistory();
  if (!plan) {
    history.push('/');
    return null;
  }
  const isLoadingAnalytic: boolean =
    // initial loading state to show when a miganalytic is first started or updated.
    !!(plan?.PlanStatus?.analyticPercentComplete !== 100 && plan.PlanStatus.latestAnalytic) ||
    // Plan is currenlty being Closed/Deleted
    plan.PlanStatus.isPlanLocked ||
    // Analytic is being manually refreshed
    isRefreshingAnalytic;

  const noMigAnlyticFound: boolean = plan?.Analytics?.length === 0;
  const error = null;
  return (
    <>
      <PageSection variant="light">
        <Breadcrumb className={`${spacing.mbLg} ${spacing.prLg}`}>
          <BreadcrumbItem>
            <Link to="/plans">Plans</Link>
          </BreadcrumbItem>
          <BreadcrumbItem to="#" isActive>
            {planName}
          </BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1" size="2xl">
          Namespaces page
        </Title>
      </PageSection>
      <PageSection>
        {isLoadingAnalytic ? (
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
            <Flex className={`${spacing.myMd}`}>
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

export const NamespacesPage = connect(
  (state: IReduxState) => ({
    isRefreshingAnalytic: state.plan.isRefreshingAnalytic,
    planList: planSelectors.getPlansWithStatus(state),
  }),
  (dispatch) => ({
    refreshAnalyticRequest: (analyticName: string) =>
      dispatch(PlanActions.refreshAnalyticRequest(analyticName)),
  })
)(BaseNamespacesPage);
