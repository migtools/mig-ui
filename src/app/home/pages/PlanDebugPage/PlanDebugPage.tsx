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
  CardBody,
  Alert,
  TreeView,
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
const uuidv1 = require('uuid/v1');

import { convertRawTreeToViewTree } from '../../../debug/duck/utils';
import { IDebugReducerState, startDebugPolling, stopDebugPolling } from '../../../debug/duck/slice';
import QuestionCircleIcon from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { debugSelectors } from '../../../debug/duck';
import { IPlan } from '../../../plan/duck/types';
import { planSelectors } from '../../../plan/duck';

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
                      View important Kubernetes resources involved in the migration process. Currently
                      active resources are highlighted. This view is helpful for debugging migration
                      issues.
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
                  <TreeView
                    id={uuidv1()}
                    data={filteredTreeData ? filteredTreeData : []}
                    defaultAllExpanded
                  />
                </CardBody>
              )}
            </CardExpandableContent>
          </Card>
        )}
      </PageSection>
    </>
  );
};
