/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { css } from '@emotion/core';
import {
  Bullseye,
  EmptyState,
  Title,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table';

export const pvStorageClassAssignmentKey = 'pvStorageClassAssignment';

const StorageClassTable = (props) => {
  const { isEdit, currentPlan, clusterList, values, isFetchingPVList } = props;
  const [rows, setRows] = useState([]);
  const [expandedDropdownMap, setExpandedDropdownMap] = useState({});
  const [storageClassOptions, setStorageClassOptions] = useState([]);
  // Create a bit of state that will hold the storage class assignments
  // for each of the pvs. This will get set on the plan values.
  const [pvStorageClassAssignment, setPvStorageClassAssignment] = useState({});

  const columns = [
    'PV Name',
    'Type',
    'Storage Class'
  ];

  // const handleStorageClassChange = (row, option) => {
  //   const pvName = row.original.name;
  //   const selectedScName = option.value;
  //   let newSc;
  //   if (selectedScName === '') {
  //     newSc = '';
  //   } else {
  //     newSc = storageClassOptions.find(sc =>
  //       sc.name === selectedScName
  //     );
  //   }
  //   const updatedAssignment = {
  //     ...pvStorageClassAssignment,
  //     [pvName]: newSc,
  //   };

  //   setPvStorageClassAssignment(updatedAssignment);
  //   props.setFieldValue(pvStorageClassAssignmentKey, updatedAssignment);
  // };

  const onSelect = (selection, index, pvName) => {
    const selectedScName = selection;
    let newSc;
    if (selectedScName === '') {
      newSc = '';
    } else {
      newSc = storageClassOptions.find(sc =>
        sc.name === selectedScName
      );
    }
    const updatedAssignment = {
      ...pvStorageClassAssignment,
      [pvName]: newSc,
    };

    setPvStorageClassAssignment(updatedAssignment);
    props.setFieldValue(pvStorageClassAssignmentKey, updatedAssignment);
    ////////////////////
    const newExpandedMap = Object.assign({}, expandedDropdownMap);
    newExpandedMap[index] = !expandedDropdownMap[index];
    setExpandedDropdownMap(newExpandedMap);

    // const newSelectedActionMap = Object.assign({}, selectedActionMap);
    // const pvObj = {
    //   action: selection,
    //   name: pvName
    // }
    // newSelectedActionMap[index] = pvObj;
    // setSelectedActionMap(newSelectedActionMap);
    // const updatedPVFormValues = values.persistentVolumes.map((pv) => {
    //   if (pv.name === pvName) {
    //     pv.selection.action = selection
    //   }
    //   return pv;
    // })
    // setFieldValue('persistentVolumes', updatedPVFormValues);

  }

  const onToggle = (isOpen, index) => {
    const newExpandedMap = Object.assign({}, expandedDropdownMap);
    newExpandedMap[index] = !expandedDropdownMap[index];
    setExpandedDropdownMap(newExpandedMap);
  };

  // useEffect(() => {
  //   const destCluster = clusterList.find(
  //     c => c.MigCluster.metadata.name === currentPlan.spec.destMigClusterRef.name
  //   );

  //   const destStorageClasses = destCluster.MigCluster.spec.storageClasses || [];

  //   setStorageClassOptions(destStorageClasses);
  //   // Build a pv => assignedStorageClass table, defaulting to the controller suggestion
  //   const migPlanPvs = currentPlan.spec.persistentVolumes;
  //   let initialAssignedScs;
  //   if (values.pvStorageClassAssignment) {
  //     setPvStorageClassAssignment(values.pvStorageClassAssignment);
  //   } else {
  //     initialAssignedScs = migPlanPvs ? migPlanPvs.reduce((assignedScs, pv) => {
  //       const suggestedStorageClass = destStorageClasses.find(sc =>
  //         sc.name === pv.selection.storageClass
  //       );
  //       assignedScs[pv.name] = suggestedStorageClass ? suggestedStorageClass : '';
  //       return assignedScs;
  //     }, {}) : {};
  //     setPvStorageClassAssignment(initialAssignedScs);
  //     props.setFieldValue(pvStorageClassAssignmentKey, initialAssignedScs);
  //   }

  //   if (values.persistentVolumes.length) {
  //     setRows(values.persistentVolumes.filter(v => v.selection.action === 'copy'));
  //   }
  // }, [isFetchingPVList]); // Only re-run the effect if fetching value changes
  const buildNewRows = () => {
    // const destCluster = clusterList.find(
    //   c => c.MigCluster.metadata.name === currentPlan.spec.destMigClusterRef.name
    // );

    // const destStorageClasses = destCluster.MigCluster.spec.storageClasses || [];
    // setStorageClassOptions(destStorageClasses);
    // // Build a pv => assignedStorageClass table, defaulting to the controller suggestion
    // const migPlanPvs = currentPlan.spec.persistentVolumes;
    // let initialAssignedScs;
    // if (values.pvStorageClassAssignment) {
    //   setPvStorageClassAssignment(values.pvStorageClassAssignment);
    // } else {
    //   initialAssignedScs = migPlanPvs ? migPlanPvs.reduce((assignedScs, pv) => {
    //     const suggestedStorageClass = destStorageClasses.find(sc =>
    //       sc.name === pv.selection.storageClass
    //     );
    //     assignedScs[pv.name] = suggestedStorageClass ? suggestedStorageClass : '';
    //     return assignedScs;
    //   }, {}) : {};
    //   setPvStorageClassAssignment(initialAssignedScs);
    //   props.setFieldValue(pvStorageClassAssignmentKey, initialAssignedScs);
    // }

    if (values.persistentVolumes.length) {
      // setRows(values.persistentVolumes.filter(v => v.selection.action === 'copy'));
      const storageClassRows = values.persistentVolumes
        .filter(v => v.selection.action === 'copy')
        .map((planVolume, pvIndex) => {
          const destCluster = clusterList.find(
            c => c.MigCluster.metadata.name === currentPlan.spec.destMigClusterRef.name
          );

          const destStorageClasses = destCluster.MigCluster.spec.storageClasses || [];

          setStorageClassOptions(destStorageClasses);

          const currentStorageClass = pvStorageClassAssignment[planVolume.name];
          const storageClassOptionsWithNone = destStorageClasses.map(sc => {
            return { value: sc.name, provisioner: sc.provisioner };
          });
          storageClassOptionsWithNone.push({ value: '' });
          const expandedValue = expandedDropdownMap[pvIndex] === true;

          const rowCells = [
            { title: planVolume.name },
            { title: planVolume.selection.action },
            {
              title: (
                <Select
                  selections={
                    currentStorageClass ?
                      currentStorageClass.name + ':' + currentStorageClass.provisioner : ''}
                  isExpanded={expandedValue}
                  onToggle={(isOpen) => {
                    onToggle(isOpen, pvIndex)
                  }}
                  onSelect={(e, selection) => {
                    onSelect(selection, pvIndex, planVolume.name)
                  }}
                >
                  {storageClassOptionsWithNone.map((action, index) => {
                    return (
                      <SelectOption
                        key={index}
                        value={action.value}
                      >
                        {action.value ?
                          action.value + ':' + action.provisioner : ''}

                      </SelectOption>
                    )
                  })}
                </Select>

              ),

            },
          ];

          return {
            cells: rowCells
          };
        })
      return storageClassRows;
    }
    return [];
  }
  useEffect(() => {
    const newRows = buildNewRows();
    setRows(newRows);
  }, [currentPlan, expandedDropdownMap]);


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
        {/* <ReactTable
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
                    onChange={(option) => handleStorageClassChange(row, option)}
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
        /> */}
        <Table
          aria-label="migrations-history-table"
          cells={columns}
          rows={rows}
          className="pf-m-vertical-align-content-center"
        >
          <TableHeader />
          <TableBody />
        </Table>

      </React.Fragment>
    );
  } else {
    return <div />;
  }
};

export default StorageClassTable;
