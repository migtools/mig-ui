import React, { useState, useEffect } from 'react';
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
  CardBody,
  Alert,
  TreeViewDataItem,
  Split,
  SplitItem,
  SearchInput,
  CardHeader,
  CardExpandableContent,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';
import { IDebugRefWithStatus } from '../../../debug/duck/types';

import { convertRawTreeToViewTree } from '../../../debug/duck/utils';
import { IDebugReducerState, startDebugPolling, stopDebugPolling } from '../../../debug/duck/slice';
import QuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { debugSelectors } from '../../../debug/duck';
import { IPlan } from '../../../plan/duck/types';
import { planSelectors } from '../../../plan/duck';
import { DebugTree } from './components/DebugTree';
import { usePausedPollingEffect } from '../../../common/context/PollingContext';

export const PlanDebugPage: React.FunctionComponent = () => {
  const { planName } = useParams();
  const plans: IPlan[] = useSelector((state) => planSelectors.getPlansWithStatus(state));
  const dispatch = useDispatch();
  const debug: IDebugReducerState = useSelector((state) => state.debug);
  const debugRefs: IDebugRefWithStatus[] = useSelector((state) =>
    debugSelectors.getDebugRefsWithStatus(state)
  );

  const [isOpen, setIsOpen] = useState(false);

  const [searchText, setSearchText] = useState('');

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
                // const { isPolling } = debug;
                // if (!isPolling) {
                //   dispatch(startDebugPolling(planName));
                // } else if (isPolling) {
                //   dispatch(stopDebugPolling(planName));
                // }
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
                    </p>
                  </>
                }
                aria-label="operator-mismatch-details"
                closeBtnAriaLabel="close--details"
                maxWidth="30rem"
              >
                <span>
                  <span className="pf-c-icon pf-m-info">
                    <QuestionCircleIcon size="md" />
                  </span>
                </span>
              </Popover>
            </CardHeader>
            <CardExpandableContent>
              <CardBody>
                <DebugTree />
              </CardBody>
            </CardExpandableContent>
          </Card>
        )}
      </PageSection>
    </>
  );
};
