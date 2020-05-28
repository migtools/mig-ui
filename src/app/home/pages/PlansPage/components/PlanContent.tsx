import React, { useState, useEffect } from 'react';
import { flatten } from 'lodash';
import { DataList, DataListContent, DataListItem, Flex, FlexItem } from '@patternfly/react-core';
import PlanActions from './PlanActions';
import PlanStatus from './PlanStatus';
import MigrationsTable from './MigrationsTable';
import { Table, TableHeader, TableBody, compoundExpand } from '@patternfly/react-table';
import { MigrationIcon } from '@patternfly/react-icons';
import { IAddPlanDisabledObjModel } from '../types';

interface IPlanContentProps {
  planList: any;
  isExpanded: boolean;
  addPlanDisabledObj: IAddPlanDisabledObjModel;
  toggleWizardOpen: () => void;
}

const PlanContent: React.FunctionComponent<IPlanContentProps> = ({
  planList,
  isExpanded,
  addPlanDisabledObj,
  toggleWizardOpen,
}: IPlanContentProps) => {
  return (
    <Table
      aria-label="migrations-history-table"
      onExpand={onExpand}
      rows={currentRows}
      cells={columns}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

export default PlanContent;
