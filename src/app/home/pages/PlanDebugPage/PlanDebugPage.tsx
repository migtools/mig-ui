import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  PageSection,
  Bullseye,
  EmptyState,
  Spinner,
  Title,
  Card,
  Alert,
  CardHeader,
  CardExpandableContent,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';

import { convertRawTreeToViewTree } from '../../../debug/duck/utils';
import { IDebugReducerState, startDebugPolling, stopDebugPolling } from '../../../debug/duck/slice';
import { debugSelectors } from '../../../debug/duck';
import { IPlan } from '../../../plan/duck/types';
import { planSelectors } from '../../../plan/duck';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import TreeContainer from './components/TreeContainer';
import { IDebugTreeNode } from '../../../debug/duck/types';

export const PlanDebugPage: React.FunctionComponent = () => {
  const { planName } = useParams();
  const plans: IPlan[] = useSelector((state) => planSelectors.getPlansWithStatus(state));
  const dispatch = useDispatch();
  const debug: IDebugReducerState = useSelector((state) => state.debug);

  const debugTreeWithStatus: IDebugTreeNode = useSelector((state) =>
    debugSelectors.getDebugTreeWithStatus(state)
  );

  const [isOpen, setIsOpen] = useState(false);

  const treeData = debugTreeWithStatus && convertRawTreeToViewTree(debugTreeWithStatus, plans);

  return (
    <>
      <PageSection>
        {debug.errMsg ? (
          <Alert variant="danger" title={`Error loading debug data for plan "${planName}"`}>
            <p>{debug.errMsg}</p>
          </Alert>
        ) : (
          <Card id="image-card" isExpanded={isOpen}>
            <CardHeader
              onExpand={() => {
                const { isPolling } = debug;
                if (!isPolling) {
                  dispatch(startDebugPolling(planName));
                } else if (isPolling) {
                  dispatch(stopDebugPolling(planName));
                }
                setIsOpen(!isOpen);
              }}
              toggleButtonProps={{
                id: 'toggle-button',
                'aria-label': 'debug-details',
                'aria-expanded': isOpen,
              }}
            >
              <Title headingLevel="h1" size="xl" className={spacing.mrLg}>
                Migration plan resources
              </Title>
              <Popover
                position={PopoverPosition.bottom}
                bodyContent={
                  <>
                    <Title headingLevel="h2" size="xl">
                      <>Debug view</>
                    </Title>
                    <p className={spacing.mtMd}>
                      View important Kubernetes resources involved in the migration process.
                      Currently active resources are highlighted. This view is helpful for debugging
                      migration issues.
                      <br />
                      <br />
                      Resources are represented with cluster/namespace/name.
                    </p>
                  </>
                }
                aria-label="operator-mismatch-details"
                closeBtnAriaLabel="close--details"
                maxWidth="30rem"
              >
                <span>
                  <span className="pf-c-icon pf-m-info">
                    <OutlinedQuestionCircleIcon
                      className="pf-c-icon pf-m-default"
                      size="md"
                    ></OutlinedQuestionCircleIcon>
                  </span>
                </span>
              </Popover>
            </CardHeader>
            <CardExpandableContent>
              {debug.isFetchingInitialDebugTree ? (
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
                <TreeContainer treeData={treeData} />
              )}
            </CardExpandableContent>
          </Card>
        )}
      </PageSection>
    </>
  );
};
