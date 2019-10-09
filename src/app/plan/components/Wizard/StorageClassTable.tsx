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


const StorageClassTable = (props) => {
  const {
    isEdit,
    currentPlan,
    clusterList,
    values,
    isFetchingPVList,
    setFieldValue
  } = props;
  const [rows, setRows] = useState([]);
  const [expandedDropdownMap, setExpandedDropdownMap] = useState({});
  const [storageClassOptions, setStorageClassOptions] = useState([]);
  // Create a bit of state that will hold the storage class assignments
  // for each of the pvs. This will get set on the plan values.
  const [pvStorageClassAssignment, setPvStorageClassAssignment] = useState({});
  const [selectedStorageClassMap, setSelectedStorageClassMap] = useState({});

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
    if (selectedScName === 'none') {
      newSc = 'none';
    } else {
      newSc = storageClassOptions.find(sc =>
        sc.name === selectedScName
      );
    }
    // const updatedAssignment = {
    //   ...pvStorageClassAssignment,
    //   [pvName]: newSc,
    // };

    const newSelectedStorageClassMap = Object.assign({}, selectedStorageClassMap);
    const pvObj = {
      storageClass: selection,
      name: pvName
    };
    newSelectedStorageClassMap[index] = pvObj;
    setSelectedStorageClassMap(newSelectedStorageClassMap);

    const updatedPVFormValues = values.persistentVolumes.map((pv) => {
      if (pv.name === pvName) {
        pv.selection.storageClass = selection;
      }
      return pv;
    });
    setFieldValue('persistentVolumes', updatedPVFormValues);

    const newExpandedMap = Object.assign({}, expandedDropdownMap);
    newExpandedMap[index] = !expandedDropdownMap[index];
    setExpandedDropdownMap(newExpandedMap);

  };

  const onToggle = (isOpen, index) => {
    const newExpandedMap = Object.assign({}, expandedDropdownMap);
    newExpandedMap[index] = !expandedDropdownMap[index];
    setExpandedDropdownMap(newExpandedMap);
  };

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
    let selectedValue = 'none';
    let expandedValue;
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
          storageClassOptionsWithNone.push({ value: 'none' });
          expandedValue = expandedDropdownMap[pvIndex] === true;

          const newSelectedStorageClassMap = Object.assign({}, selectedStorageClassMap);

          if (planVolume && planVolume.selection && planVolume.selection.storageClass) {
            const pvObj = {
              storageClass: planVolume.selection.storageClass,
              name: planVolume.name
            };
            newSelectedStorageClassMap[pvIndex] = pvObj;
            setSelectedStorageClassMap(newSelectedStorageClassMap);

            if (newSelectedStorageClassMap[pvIndex] && newSelectedStorageClassMap[pvIndex].storageClass) {
              selectedValue = newSelectedStorageClassMap[pvIndex].storageClass;
            }
            const updatedPVFormValues = values.persistentVolumes.map((pv) => {
              if (pv.name === planVolume.name) {
                pv.selection.storageClass = planVolume.selection.storageClass;
              }
              return pv;

            });
            setFieldValue('persistentVolumes', updatedPVFormValues);

          } else {
            let pvObj;
            pvObj = {
              storageClass: storageClassOptionsWithNone[0].value,
              name: planVolume.name
            };

            newSelectedStorageClassMap[pvIndex] = pvObj;
            setSelectedStorageClassMap(newSelectedStorageClassMap);

            if (newSelectedStorageClassMap[pvIndex] && newSelectedStorageClassMap[pvIndex].storageClass) {
              selectedValue = newSelectedStorageClassMap[pvIndex].storageClass;
            }
            const updatedPVFormValues = values.persistentVolumes.map((pv) => {
              if (pv.name === planVolume.name) {
                pv.selection.storageClass = planVolume.selection.storageClass;
              }
              return pv;
            });
            setFieldValue('persistentVolumes', updatedPVFormValues);

          }


          const rowCells = [
            { title: planVolume.name },
            { title: planVolume.selection.action },
            {
              title: (
                <Select
                  selections={
                    selectedValue}
                  isExpanded={expandedValue}
                  onToggle={(isOpen) => {
                    onToggle(isOpen, pvIndex);
                  }}
                  onSelect={(e, selection) => {
                    onSelect(selection, pvIndex, planVolume.name);
                  }}
                >
                  {storageClassOptionsWithNone.map((action, index) => {
                    return (
                      <SelectOption
                        key={index}
                        value={action.value}
                      >
                        {action.value !== 'none' ?
                          action.value + ':' + action.provisioner : 'None'}

                      </SelectOption>
                    );
                  })}
                </Select>

              ),

            },
          ];

          return {
            cells: rowCells
          };
        });
      return storageClassRows;
    }
    return [];
  };
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
