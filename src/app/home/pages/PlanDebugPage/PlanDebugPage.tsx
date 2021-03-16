import React, { useEffect, useState } from 'react';
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
  Button,
  CardHeader,
  CardExpandableContent,
  CardFooter,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';
import { push } from 'connected-react-router';
import {
  DEBUG_PATH_SEARCH_KEY,
  RAW_OBJECT_VIEW_ROUTE,
  IDebugTreeNode,
} from '../../../debug/duck/types';

import { convertRawTreeToViewTree } from '../../../debug/duck/utils';
import { treeFetchRequest } from '../../../debug/duck/slice';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import {
  ExclamationTriangleIcon,
  QuestionCircleIcon,
  SpaIconConfig,
} from '@patternfly/react-icons/dist/js/icons';

export const PlanDebugPage: React.FunctionComponent = () => {
  const { planName } = useParams();
  const dispatch = useDispatch();
  const debug = useSelector((state) => state.debug);
  const [isOpen, setIsOpen] = useState(false);

  const refreshDebugTree = () => {
    dispatch(treeFetchRequest(planName));
  };

  useEffect(() => {
    refreshDebugTree();
  }, []);

  const viewRawDebugObject = (node: IDebugTreeNode) => {
    const encodedPath = encodeURI(node.objectLink);
    dispatch(
      push({
        pathname: RAW_OBJECT_VIEW_ROUTE,
        search: `?${DEBUG_PATH_SEARCH_KEY}=${encodedPath}`,
      })
    );
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

  const treeData =
    debug.tree && convertRawTreeToViewTree(debug.tree, debug.debugRefs, viewRawDebugObject);
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
          <Card id="image-card" isExpanded={isOpen}>
            <CardHeader
              onExpand={() => setIsOpen(!isOpen)}
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
                      View the Kubernetes resources created by the migration process. Currently
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
                  <SplitItem>
                    <Button onClick={refreshDebugTree} variant="primary">
                      Refresh
                    </Button>
                  </SplitItem>
                </Split>
                <TreeView data={filteredTreeData} defaultAllExpanded />
              </CardBody>
              {/* <CardFooter>Footer</CardFooter> */}
            </CardExpandableContent>
          </Card>
        )}
      </PageSection>
    </>
  );
};
