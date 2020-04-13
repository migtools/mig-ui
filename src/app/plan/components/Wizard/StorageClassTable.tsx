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
import { FormikProps } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

export const pvStorageClassAssignmentKey = 'pvStorageClassAssignment';
export const pvCopyMethodAssignmentKey = 'pvCopyMethodAssignment';

interface IStorageClassTableForm
  extends Pick<IOtherProps, 'clusterList' | 'currentPlan' | 'isFetchingPVList'>,
    Pick<FormikProps<IFormValues>, 'setFieldValue' | 'values'> {}

const StorageClassTable: React.FunctionComponent<IStorageClassTableForm> = ({
  clusterList,
  currentPlan,
  isFetchingPVList,
  setFieldValue,
  values,
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

  const migPlanPvs = currentPlan.spec.persistentVolumes;

  const destCluster = clusterList.find(
    c => c.MigCluster.metadata.name === currentPlan.spec.destMigClusterRef.name
  );

  const storageClassOptions = destCluster.MigCluster.spec.storageClasses || [];

  // Build a pv => assignedStorageClass table, defaulting to the controller suggestion
  // TODO can we avoid this initialize-on-mount behavior?
  useEffect(() => {
    if (!values.pvStorageClassAssignment) {
      let pvStorageClassAssignment = {};
      if (migPlanPvs) {
        pvStorageClassAssignment = migPlanPvs.reduce((assignedScs, pv) => {
          const suggestedStorageClass = storageClassOptions.find(
            sc => sc.name === pv.selection.storageClass
          );
          assignedScs[pv.name] = suggestedStorageClass ? suggestedStorageClass : '';
          return assignedScs;
        }, {});
      }
      setFieldValue(pvStorageClassAssignmentKey, pvStorageClassAssignment);
    }
    // TODO should this only happen if (!values.pvCopyMethodAssignment), like above?
    let pvCopyMethodAssignment = {};
    if (migPlanPvs) {
      pvCopyMethodAssignment = migPlanPvs.reduce((assignedCms, pv) => {
        const supportedCopyMethods = pv.supported.copyMethods || [];
        const suggestedCopyMethod = supportedCopyMethods.find(cm => cm === pv.selection.copyMethod);
        assignedCms[pv.name] = suggestedCopyMethod ? suggestedCopyMethod : supportedCopyMethods[0];
        return assignedCms;
      }, {});
    }
    setFieldValue(pvCopyMethodAssignmentKey, pvCopyMethodAssignment);
  }, []);

  const rows = values.persistentVolumes.length
    ? values.persistentVolumes.filter(v => v.type === 'copy')
    : [];

  const handleStorageClassChange = (row, option) => {
    const pvName = row.original.name;
    const selectedScName = option.value;
    let newSc;
    if (selectedScName === '') {
      newSc = '';
    } else {
      newSc = storageClassOptions.find(sc => sc.name === selectedScName);
    }
    const updatedAssignment = {
      ...values.pvStorageClassAssignment,
      [pvName]: newSc,
    };
    setFieldValue(pvStorageClassAssignmentKey, updatedAssignment);
  };

  const handleCopyMethodChange = (selectedPV, option) => {
    const pvName = selectedPV.name;
    const selectedCmName = option.value;
    const newCm = selectedPV.supported.copyMethods.find(cm => cm === selectedCmName);
    const updatedAssignment = {
      ...values.pvCopyMethodAssignment,
      [pvName]: newCm,
    };
    setFieldValue(pvCopyMethodAssignmentKey, updatedAssignment);
  };

  const tableStyle = {
    fontSize: '14px',
  };

  if (rows !== null) {
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
            data={rows}
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
                  const migPlanPvs = currentPlan.spec.persistentVolumes;
                  const currentPV = migPlanPvs.find(pv => pv.name === row.original.name);
                  const currentCopyMethod = values.pvCopyMethodAssignment[row.original.name];

                  const copyMethodOptionsMapped = currentPV.supported.copyMethods.map(cm => {
                    return { value: cm, label: cm };
                  });
                  return (
                    <Select
                      onChange={option => handleCopyMethodChange(currentPV, option)}
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
                  const currentStorageClass = values.pvStorageClassAssignment[row.original.name];
                  const storageClassOptionsWithNone = storageClassOptions.map(sc => {
                    return { value: sc.name, label: sc.name + ':' + sc.provisioner };
                  });
                  storageClassOptionsWithNone.push({ value: '', label: 'None' });
                  return (
                    <Select
                      onChange={option => handleStorageClassChange(row, option)}
                      options={storageClassOptionsWithNone}
                      name="storageClasses"
                      value={{
                        label: currentStorageClass
                          ? currentStorageClass.name + ':' + currentStorageClass.provisioner
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
