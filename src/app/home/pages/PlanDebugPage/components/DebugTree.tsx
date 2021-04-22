import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableHeader, TableBody, headerCol } from '@patternfly/react-table';
import { table } from 'console';
import { treeRowCustom } from './TreeRowCustom';
import { usePausedPollingEffect } from '../../../../common/context/PollingContext';
import { IDebugReducerState, debugSelectors } from '../../../../debug/duck';
import { IDebugRefWithStatus } from '../../../../debug/duck/types';
import { useSelector, useDispatch } from 'react-redux';
import { startDebugPolling, stopDebugPolling } from '../../../../debug/duck/slice';
import { convertRawTreeToViewTree } from '../../../../debug/duck/utils';
import { planSelectors } from '../../../../plan/duck';
import { IPlan } from '../../../../plan/duck/types';
import { Bullseye, EmptyState, Spinner, Title } from '@patternfly/react-core';

export const DebugTree: React.FunctionComponent = () => {
  const { planName } = useParams();
  usePausedPollingEffect();
  const [expandedRows, setExpandedRows] = useState([]);
  const [builtRows, setBuiltRows] = useState([]);
  const [cells, setCells] = useState([]);
  const debug: IDebugReducerState = useSelector((state) => state.debug);
  const plans: IPlan[] = useSelector((state) => planSelectors.getPlansWithStatus(state));
  const debugRefs: IDebugRefWithStatus[] = useSelector((state) =>
    debugSelectors.getDebugRefsWithStatus(state)
  );
  const dispatch = useDispatch();
  useEffect(() => {
    const { isPolling } = debug;
    if (!isPolling) {
      dispatch(startDebugPolling(planName));
    }
    return () => {
      dispatch(stopDebugPolling(planName));
    };
  }, []);

  useEffect(() => {
    const treeData =
      (debug.tree && debugRefs.length && convertRawTreeToViewTree(debug.tree, debugRefs, plans)) ||
      [];

    const buildRows = ([x, ...xs], level, posinset, isHidden = false) => {
      console.log('buildRows');
      if (x) {
        const isExpanded = expandedRows.includes(x.id);
        return [
          {
            cells: [x.id, x.kind, x.namespace, x.status, x.dropdown],
            props: {
              isExpanded,
              isHidden,
              'aria-level': level,
              'aria-posinset': posinset,
              'aria-setsize': x.children ? x.children.length : 0,
            },
          },
          ...(x.children && x.children.length
            ? buildRows(x.children, level + 1, 1, !isExpanded || isHidden)
            : []),
          // @ts-ignore
          ...buildRows(xs, level, posinset + 1, isHidden),
        ];
      }
      return [];
    };
    //@ts-ignore
    setBuiltRows(buildRows(treeData, 1, 1, false));
  }, [debug.isFetchingInitialDebugTree, expandedRows]);

  useEffect(() => {
    setCells([
      { title: 'ID', cellTransforms: [treeRowCustom(onCollapse)] },
      'Kind',
      'Namespace',
      'Status',
      'Action',
    ]);
  }, []);

  const onCollapse = (event, rowIndex, title) => {
    console.log('onCollapse');
    setExpandedRows((expandedRows) => {
      const openedIndex = expandedRows.indexOf(title);
      const newExpandedRows =
        openedIndex === -1 ? [...expandedRows, title] : expandedRows.filter((o) => o !== title);
      return newExpandedRows;
    });
  };
  console.log('debugTree');
  return (
    <>
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
        <Table
          isTreeTable
          aria-label="Tree table"
          cells={cells}
          rows={builtRows}
          // rows={buildRows(filteredTreeData, 1, 1)}
        >
          <TableHeader />
          <TableBody />
        </Table>
      )}
    </>
  );
};
