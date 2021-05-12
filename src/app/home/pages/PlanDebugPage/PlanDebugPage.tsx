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
import {
  IDebugReducerState,
  startDebugPolling,
  stopDebugPolling,
  clearJSONView,
} from '../../../debug/duck/slice';
import { debugSelectors } from '../../../debug/duck';
import { IPlan } from '../../../plan/duck/types';
import { planSelectors } from '../../../plan/duck';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { TreeContainer } from './components/TreeContainer';

export const PlanDebugPage: React.FunctionComponent = () => {
  const { planName, migrationID } = useParams();
  const plans: IPlan[] = useSelector((state) => planSelectors.getPlansWithStatus(state));
  const dispatch = useDispatch();
  const debug: IDebugReducerState = useSelector((state) => state.debug);
  const debugRefs: IDebugRefWithStatus[] = useSelector((state) =>
    debugSelectors.getDebugRefsWithStatus(state)
  );

  useEffect(() => {
    // Start polling when Debug component loads
    const { isPolling } = debug;
    if (!isPolling) {
      dispatch(startDebugPolling({ planName: planName, migrationID: migrationID }));
    }
    return () => {
      // Cleanup on dismount of Debug component, stop polling
      dispatch(stopDebugPolling(planName));
      dispatch(clearJSONView());
    };
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  const [searchText, setSearchText] = useState('');

  const filterSubtree = (items: TreeViewDataItem[]): TreeViewDataItem[] =>
    items
      .map((item) => {
        const nameMatches = (item.id as string).toLowerCase().includes(searchText.toLowerCase());
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

  const treeData = debug.tree && convertRawTreeToViewTree(debug.tree, debugRefs, plans);
  let filteredTreeData = treeData;
  if (searchText && treeData) {
    filteredTreeData = filterSubtree(treeData);
  }

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
                setIsOpen(!isOpen);
              }}
              toggleButtonProps={{
                id: 'toggle-button',
                'aria-label': 'debug-details',
                'aria-expanded': isOpen,
              }}
            >
              <Title headingLevel="h1" size="xl" className={spacing.mrLg}>
                Migration resources
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
                <CardBody>
                  <Split hasGutter>
                    <SplitItem isFilled>
                      <SearchInput
                        placeholder="Type to search"
                        value={searchText}
                        onChange={setSearchText}
                        onClear={() => setSearchText('')}
                      />
                    </SplitItem>
                  </Split>
                  <TreeContainer filteredTreeData={filteredTreeData} />
                </CardBody>
              )}
            </CardExpandableContent>
          </Card>
        )}
      </PageSection>
    </>
  );
};
