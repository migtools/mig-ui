import React from 'react';
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
  SelectOptionObject,
} from '@patternfly/react-core';
import { Table, TableVariant, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useFilterState, useSortState, usePaginationState } from '../../../common/duck/hooks';
import { IFormValues, IOtherProps } from './WizardContainer';
import { IPlanPersistentVolume, IClusterStorageClass } from './types';
import { capitalize } from '../../../common/duck/utils';
import SimpleSelect from '../../../common/components/SimpleSelect';

interface IStorageClassTableProps
  extends Pick<IOtherProps, 'isFetchingPVList' | 'currentPlan'>,
    Pick<IFormValues, 'persistentVolumes' | 'pvStorageClassAssignment' | 'pvCopyMethodAssignment'> {
  storageClasses: IClusterStorageClass[];
  onStorageClassChange: (currentPV: IPlanPersistentVolume, value: string) => void;
  onCopyMethodChange: (currentPV: IPlanPersistentVolume, value: string) => void;
}

interface OptionWithValue extends SelectOptionObject {
  value: string;
}

const StorageClassTable: React.FunctionComponent<IStorageClassTableProps> = ({
  isFetchingPVList,
  currentPlan,
  persistentVolumes,
  pvStorageClassAssignment,
  pvCopyMethodAssignment,
  storageClasses,
  onStorageClassChange,
  onCopyMethodChange,
}: IStorageClassTableProps) => {
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
    const currentPV = currentPlan.spec.persistentVolumes.find(planPV => planPV.name === pv.name);
    const currentCopyMethod = pvCopyMethodAssignment[pv.name];
    const currentStorageClass = pvStorageClassAssignment[pv.name];

    const copyMethodOptions: OptionWithValue[] = currentPV.supported.copyMethods.map(
      (copyMethod: string) => ({
        value: copyMethod,
        toString: () => capitalize(copyMethod),
      })
    );

    const noneOption = { value: '', toString: () => 'None' };
    const storageClassOptions: OptionWithValue[] = [
      ...storageClasses.map(storageClass => ({
        value: storageClass.name,
        toString: () => `${storageClass.name}:${storageClass.provisioner}`,
      })),
      noneOption,
    ];

    return {
      cells: [
        pv.name,
        {
          title: capitalize(pv.type),
        },
        {
          title: (
            <SimpleSelect
              aria-label="Select copy method"
              onChange={(option: OptionWithValue) => onCopyMethodChange(currentPV, option.value)}
              options={copyMethodOptions}
              value={copyMethodOptions.find(option => option.value === currentCopyMethod)}
              placeholderText="Select a copy method..."
            />
          ),
        },
        {
          title: (
            <SimpleSelect
              aria-label="Select storage class"
              onChange={(option: OptionWithValue) => onStorageClassChange(currentPV, option.value)}
              options={storageClassOptions}
              value={
                storageClassOptions.find(
                  option => currentStorageClass && option.value === currentStorageClass.name
                ) || noneOption
              }
              placeholderText="Select a storage class..."
            />
          ),
        },
      ],
    };
  });

  // TODO add columns based on Vince's mockups (excluding Verify copy, until next PR)
  if (rows.length > 0) {
    return (
      <Grid gutter="md">
        <GridItem>
          <TextContent>
            <Text component={TextVariants.p}>Select target storage class for copied PVs</Text>
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
