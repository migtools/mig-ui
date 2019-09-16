/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import { css } from '@emotion/core';
import {
  Bullseye,
  EmptyState,
  Title,
} from '@patternfly/react-core';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';

export const pvStorageClassAssignmentKey = 'pvStorageClassAssignment';
export const pvCopyMethodAssignmentKey = 'pvCopyMethodAssignment';

interface IProps {
  values: any;
  currentPlan: any;
  clusterList: any;
  isFetchingPVList: any;
  setFieldValue: any;

}
const StorageClassTable = (props: IProps) => {

  const { currentPlan,
    clusterList,
    values,
    isFetchingPVList } = props;
  const [rows, setRows] = useState([]);
  const [storageClassOptions, setStorageClassOptions] = useState([]);
  const [copyMethodOptions, setCopyMethodOptions] = useState([]);
  // Create a bit of state that will hold the storage class assignments
  // for each of the pvs. This will get set on the plan values.
  const [pvStorageClassAssignment, setPvStorageClassAssignment] = useState({});
  const [pvCopyMethodAssignment, setPvCopyMethodAssignment] = useState({});

  const handleStorageClassChange = (row, option) => {
    const pvName = row.original.name;
    const selectedScName = option.value;
    const newSc = storageClassOptions.find(sc => sc.name === selectedScName);
    const updatedAssignment = {
      ...pvStorageClassAssignment,
      [pvName]: newSc,
    };

    setPvStorageClassAssignment(updatedAssignment);
    props.setFieldValue(pvStorageClassAssignmentKey, updatedAssignment);
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
    props.setFieldValue(pvCopyMethodAssignmentKey, updatedAssignment);
  };

  useEffect(() => {
    const migPlanPvs = currentPlan.spec.persistentVolumes;

    const destCluster = clusterList.find(
      c => c.MigCluster.metadata.name === currentPlan.spec.destMigClusterRef.name
    );

    const destStorageClasses = destCluster.MigCluster.spec.storageClasses || [];

    setStorageClassOptions(destStorageClasses);
    // Build a pv => assignedStorageClass table, defaulting to the controller suggestion
    const initialAssignedScs = migPlanPvs ? migPlanPvs.reduce((assignedScs, pv) => {
      const suggestedStorageClass = destStorageClasses.find(sc =>
        sc.name === pv.selection.storageClass
      );
      assignedScs[pv.name] = suggestedStorageClass ? suggestedStorageClass : destStorageClasses[0];
      return assignedScs;
    }, {}) : {};

    setPvStorageClassAssignment(initialAssignedScs);
    props.setFieldValue(pvStorageClassAssignmentKey, initialAssignedScs);


    const initialAssignedCms = migPlanPvs ? migPlanPvs.reduce((assignedCms, pv) => {
      const supportedCopyMethods = pv.supported.copyMethods || [];

      const suggestedCopyMethod = supportedCopyMethods.find(cm =>
        cm === pv.selection.copyMethod
      );

      assignedCms[pv.name] = suggestedCopyMethod ? suggestedCopyMethod : supportedCopyMethods[0];
      return assignedCms;
    }, {}) : {};

    setPvCopyMethodAssignment(initialAssignedCms);
    props.setFieldValue(pvCopyMethodAssignmentKey, initialAssignedCms);

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

  if (rows !== null) {
    return (
      <React.Fragment>
        <ReactTable
          css={css`
            font-size: 14px;
          `}
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
                // const supportedCopyMethods = pv.supported.copyMethods || [];
                const migPlanPvs = currentPlan.spec.persistentVolumes;
                const currentPV = migPlanPvs.find(pv => pv.name === row.original.name)
                const currentCopyMethod = pvCopyMethodAssignment[row.original.name];

                const copyMethodOptionsMapped = currentPV.supported.copyMethods.map(cm => {
                  return { value: cm, label: cm };
                });
                return (
                  <Select
                    onChange={(option) => handleCopyMethodChange(currentPV, option)}
                    options={
                      copyMethodOptionsMapped
                    }
                    name="copyMethods"
                    value={{
                      label: currentCopyMethod ?
                        currentCopyMethod : 'None',
                      value: currentCopyMethod ?
                        currentCopyMethod : '',
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
                    onChange={(option: any) => handleStorageClassChange(row, option)}
                    options={
                      storageClassOptionsWithNone
                    }
                    name="storageClasses"
                    value={{
                      label: currentStorageClass ?
                        currentStorageClass.name + ':' + currentStorageClass.provisioner : 'None',
                      value: currentStorageClass ?
                        currentStorageClass.name : '',
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
      </React.Fragment>
    );
  } else {
    return <div />;
  }
};

export default StorageClassTable;
