import React, { useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
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
} from '@patternfly/react-core';
import { IFormValues, IOtherProps } from './WizardContainer';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import { IPlanPersistentVolume, IClusterStorageClass } from './types';

interface IStorageClassTableForm
  extends Pick<IOtherProps, 'isFetchingPVList' | 'currentPlan'>,
    Pick<IFormValues, 'pvStorageClassAssignment' | 'pvCopyMethodAssignment'> {
  filteredPersistentVolumes: IFormValues['persistentVolumes'];
  storageClassOptions: IClusterStorageClass[];
  onStorageClassChange: (currentPV: IPlanPersistentVolume, value: string) => void;
  onCopyMethodChange: (currentPV: IPlanPersistentVolume, value: string) => void;
}

const StorageClassTable: React.FunctionComponent<IStorageClassTableForm> = ({
  isFetchingPVList,
  currentPlan,
  filteredPersistentVolumes,
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

  const tableStyle = {
    fontSize: '14px',
  };

  // TODO convert to PF table, add sorting, filtering, pagination
  // TODO add columns based on Vince's mockups (excluding Verify copy, until next PR)
  if (filteredPersistentVolumes.length > 0) {
    return (
      <Grid gutter="md">
        <GridItem>
          <TextContent>
            <Text component={TextVariants.p}>Select storage class for copied PVs:</Text>
          </TextContent>
        </GridItem>
        <GridItem>
          <ReactTable
            style={tableStyle}
            data={filteredPersistentVolumes}
            columns={[
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    PV Name
                  </div>
                ),
                accessor: 'name',
                width: 180,
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Type
                  </div>
                ),
                accessor: 'type',
                width: 180,
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Copy Method
                  </div>
                ),
                accessor: '',
                width: 500,
                style: { overflow: 'visible' },
                Cell: row => {
                  const currentPV = currentPlan.spec.persistentVolumes.find(
                    pv => pv.name === row.original.name
                  );
                  const currentCopyMethod = pvCopyMethodAssignment[row.original.name];

                  const copyMethodOptionsMapped = currentPV.supported.copyMethods.map(cm => {
                    return { value: cm, label: cm };
                  });
                  return (
                    <Select
                      onChange={option => onCopyMethodChange(currentPV, option.value)}
                      options={copyMethodOptionsMapped}
                      name="copyMethods"
                      value={{
                        label: currentCopyMethod ? currentCopyMethod : 'None',
                        value: currentCopyMethod ? currentCopyMethod : '',
                      }}
                      placeholder="Select a copy method..."
                    />
                  );
                },
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Storage Class
                  </div>
                ),
                accessor: 'storageClass',
                width: 500,
                style: { overflow: 'visible' },
                Cell: row => {
                  const currentStorageClass = pvStorageClassAssignment[row.original.name];
                  const storageClassOptionsWithNone = storageClassOptions.map(sc => {
                    return { value: sc.name, label: `${sc.name}:${sc.provisioner}` };
                  });
                  storageClassOptionsWithNone.push({ value: '', label: 'None' });
                  return (
                    <Select
                      onChange={option => onStorageClassChange(row.original, option.value)}
                      options={storageClassOptionsWithNone}
                      name="storageClasses"
                      value={{
                        label: currentStorageClass
                          ? `${currentStorageClass.name}:${currentStorageClass.provisioner}`
                          : 'None',
                        value: currentStorageClass ? currentStorageClass.name : '',
                      }}
                      placeholder="Select a storage class..."
                    />
                  );
                },
              },
            ]}
            defaultPageSize={5}
            className="-striped -highlight"
          />
        </GridItem>
      </Grid>
    );
  } else {
    return <div />;
  }
};

export default StorageClassTable;
