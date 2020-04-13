import React, { useState, useEffect } from 'react';
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
  const [rows, setRows] = useState([]);
  const [storageClassOptions, setStorageClassOptions] = useState([]);
  const [pvStorageClassAssignment, setPvStorageClassAssignment] = useState({});
  const [pvCopyMethodAssignment, setPvCopyMethodAssignment] = useState({});

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
      ...pvStorageClassAssignment,
      [pvName]: newSc,
    };

    setPvStorageClassAssignment(updatedAssignment);
    setFieldValue(pvStorageClassAssignmentKey, updatedAssignment);
  };

  const handleCopyMethodChange = (selectedPV, option) => {
    const pvName = selectedPV.name;
    const selectedCmName = option.value;
    const newCm = selectedPV.supported.copyMethods.find(cm => cm === selectedCmName);
    const updatedAssignment = {
      ...pvCopyMethodAssignment,
      [pvName]: newCm,
    };

    setPvCopyMethodAssignment(updatedAssignment);
    setFieldValue(pvCopyMethodAssignmentKey, updatedAssignment);
  };

  useEffect(() => {
    const migPlanPvs = currentPlan.spec.persistentVolumes;

    const destCluster = clusterList.find(
      c => c.MigCluster.metadata.name === currentPlan.spec.destMigClusterRef.name
    );

    const destStorageClasses = destCluster.MigCluster.spec.storageClasses || [];

    setStorageClassOptions(destStorageClasses);
    // Build a pv => assignedStorageClass table, defaulting to the controller suggestion
    let initialAssignedScs;
    if (values.pvStorageClassAssignment) {
      setPvStorageClassAssignment(values.pvStorageClassAssignment);
    } else {
      initialAssignedScs = migPlanPvs ? migPlanPvs.reduce((assignedScs, pv) => {
        const suggestedStorageClass = destStorageClasses.find(sc =>
          sc.name === pv.selection.storageClass
        );
        assignedScs[pv.name] = suggestedStorageClass ? suggestedStorageClass : '';
        return assignedScs;
      }, {}) : {};
      setPvStorageClassAssignment(initialAssignedScs);
      setFieldValue(pvStorageClassAssignmentKey, initialAssignedScs);
    }


    const initialAssignedCms = migPlanPvs ? migPlanPvs.reduce((assignedCms, pv) => {
      const supportedCopyMethods = pv.supported.copyMethods || [];

      const suggestedCopyMethod = supportedCopyMethods.find(cm =>
        cm === pv.selection.copyMethod
      );

      assignedCms[pv.name] = suggestedCopyMethod ? suggestedCopyMethod : supportedCopyMethods[0];
      return assignedCms;
    }, {}) : {};

    setPvCopyMethodAssignment(initialAssignedCms);
    setFieldValue(pvCopyMethodAssignmentKey, initialAssignedCms);

    if (values.persistentVolumes.length) {
      setRows(values.persistentVolumes.filter(v => v.type === 'copy'));
    }
  }, [isFetchingPVList]); // Only re-run the effect if fetching value changes

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
                  const currentCopyMethod = pvCopyMethodAssignment[row.original.name];

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
                  const currentStorageClass = pvStorageClassAssignment[row.original.name];
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
