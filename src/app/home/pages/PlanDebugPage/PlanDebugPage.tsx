import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  PageSection,
  Bullseye,
  EmptyState,
  Spinner,
  Title,
  Card,
  CardBody,
  Alert,
} from '@patternfly/react-core';
import { push } from 'connected-react-router';
import crawl from 'tree-crawl';
import {
  IDecompDebugObject,
  DEBUG_PATH_SEARCH_KEY,
  RAW_OBJECT_VIEW_ROUTE,
} from '../../../debug/duck/types';
import { IReduxState } from '../../../../reducers';
import { IDebugReducerState, DebugActions } from '../../../debug/duck';
import { TreeView } from '../../../common/components/TreeView';
import { convertRawTreeToViewTree } from '../../../debug/duck/utils';

interface IBasePlanDebugPageProps {
  debug: IDebugReducerState;
  fetchDebugTree: (planName: string) => void;
  routeRawDebugObject: (path: string) => void;
}

const BasePlanDebugPage: React.FunctionComponent<IBasePlanDebugPageProps> = ({
  debug,
  fetchDebugTree,
  routeRawDebugObject,
}: IBasePlanDebugPageProps) => {
  const { planName } = useParams();

  const refreshDebugTree = () => {
    fetchDebugTree(planName);
  };

  useEffect(() => {
    refreshDebugTree();
  }, []);

  const viewRawDebugObject = (decomp: IDecompDebugObject) => {
    crawl(
      debug.tree,
      (node, ctx) => {
        if (node.name === decomp.name) {
          ctx.break();
          routeRawDebugObject(node.objectLink);
        }
      },
      { order: 'pre' }
    );
  };

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
          <Card>
            <CardBody>
              <TreeView
                data={convertRawTreeToViewTree(debug.tree)}
                viewRawDebugObject={viewRawDebugObject}
              />
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

export const PlanDebugPage = connect(
  (state: IReduxState) => ({
    debug: state.debug,
  }),
  (dispatch) => ({
    fetchDebugTree: (planName: string) => dispatch(DebugActions.debugTreeFetchRequest(planName)),
    routeRawDebugObject: (path: string) => {
      const encodedPath = encodeURI(path);
      dispatch(
        push({
          pathname: RAW_OBJECT_VIEW_ROUTE,
          search: `?${DEBUG_PATH_SEARCH_KEY}=${encodedPath}`,
        })
      );
    },
  })
)(BasePlanDebugPage);
