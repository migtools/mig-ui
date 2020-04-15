import React from 'react';
import Select from 'react-select';
import {
  Bullseye,
  EmptyState,
  Title,
  Grid,
  GridItem,
  TextContent,
  Text,
  TextVariants,
  Spinner,
  Level,
  LevelItem,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import { Table, TableVariant, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFilterState, useSortState, usePaginationState } from '../../../common/duck/hooks';
import { IFormValues, IOtherProps } from './WizardContainer';
import { IPlanPersistentVolume, IClusterStorageClass } from './types';
import { capitalize } from '../../../common/duck/utils';

interface IStorageClassTableForm
  extends Pick<IOtherProps, 'isFetchingPVList' | 'currentPlan'>,
    Pick<IFormValues, 'persistentVolumes' | 'pvStorageClassAssignment' | 'pvCopyMethodAssignment'> {
  storageClassOptions: IClusterStorageClass[];
  onStorageClassChange: (currentPV: IPlanPersistentVolume, value: string) => void;
  onCopyMethodChange: (currentPV: IPlanPersistentVolume, value: string) => void;
}

const StorageClassTable: React.FunctionComponent<IStorageClassTableForm> = ({
  isFetchingPVList,
  currentPlan,
  persistentVolumes,
  pvStorageClassAssignment,
  pvCopyMethodAssignment,
  storageClassOptions,
  onStorageClassChange,
  onCopyMethodChange,
}: IStorageClassTableForm) => {
  if (isFetchingPVList) {
    return (
      <Bullseye>
        <EmptyState variant="small">
          <div className="pf-c-empty-state__icon">
            <Spinner size="xl" />
          </div>
          <Title headingLevel="h2" size="xl">
            Discovering storage classes...
          </Title>
        </EmptyState>
      </Bullseye>
    );
  }

  const columns = [
    { title: 'PV name' },
    { title: 'Migration type' },
    { title: 'Copy method' },
    { title: 'Storage class' },
  ];
  // const sortKeys = ['name', 'type', 'TODO copy method, derived?', 'storageClass'];
  // TODO filterCategories

  // TODO useFilterState
  // TODO useSortState
  const { currentPageItems, paginationProps } = usePaginationState(persistentVolumes, 10);

  const rows = currentPageItems.map(pv => {
    const currentPV = currentPlan.spec.persistentVolumes.find(pv => pv.name === pv.name);
    const currentCopyMethod = pvCopyMethodAssignment[pv.name];
    const currentStorageClass = pvStorageClassAssignment[pv.name];

    return {
      cells: [
        pv.name,
        {
          title: capitalize(pv.type),
        },
        {
          title: (
            // TODO replace with PF Select
            <Select
              onChange={option => onCopyMethodChange(currentPV, option.value)}
              options={currentPV.supported.copyMethods.map(cm => {
                return { value: cm, label: cm };
              })}
              name="copyMethods"
              value={{
                label: currentCopyMethod ? currentCopyMethod : 'None',
                value: currentCopyMethod ? currentCopyMethod : '',
              }}
              placeholder="Select a copy method..."
            />
          ),
        },
        {
          title: (
            // TODO replace with PF Select
            <Select
              onChange={option => onStorageClassChange(currentPV, option.value)}
              options={[
                ...storageClassOptions.map(sc => {
                  return { value: sc.name, label: `${sc.name}:${sc.provisioner}` };
                }),
                { value: '', label: 'None' },
              ]}
              name="storageClasses"
              value={{
                label: currentStorageClass
                  ? `${currentStorageClass.name}:${currentStorageClass.provisioner}`
                  : 'None',
                value: currentStorageClass ? currentStorageClass.name : '',
              }}
              placeholder="Select a storage class..."
            />
          ),
        },
      ],
    };
  });

  // TODO add columns based on Vince's mockups (excluding Verify copy, until next PR)
  if (persistentVolumes.length > 0) {
    return (
      <Grid gutter="md">
        <GridItem>
          <TextContent>
            <Text component={TextVariants.p}>Select storage class for copied PVs:</Text>
          </TextContent>
        </GridItem>
        <GridItem>
          <Level>
            <LevelItem>TODO: filters</LevelItem>
            <LevelItem>
              <Pagination widgetId="storage-class-table-pagination-top" {...paginationProps} />
            </LevelItem>
          </Level>
          <Table
            aria-label="Storage class selections table"
            variant={TableVariant.compact}
            cells={columns}
            rows={rows}
          >
            <TableHeader />
            <TableBody />
          </Table>
          <Pagination
            widgetId="storage-class-table-pagination-bottom"
            variant={PaginationVariant.bottom}
            className={spacing.mtMd}
            {...paginationProps}
          />
        </GridItem>
      </Grid>
    );
  } else {
    return <div />;
  }
};

export default StorageClassTable;
