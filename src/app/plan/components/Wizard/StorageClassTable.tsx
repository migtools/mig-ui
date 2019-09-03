/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import { css } from '@emotion/core';
import { Flex, Box, Text } from '@rebass/emotion';
import theme from '../../../../theme';
import Loader from 'react-loader-spinner';

export const pvStorageClassAssignmentKey = 'pvStorageClassAssignment';

const StorageClassTable = (props): any => {
  const { currentPlan, clusterList, values, isFetchingPVList } = props;
  const migPlanPvs = currentPlan.spec.persistentVolumes;
  const [rows, setRows] = useState([]);
  const [storageClassOptions, setStorageClassOptions] = useState([]);
  // Create a bit of state that will hold the storage class assignments
  // for each of the pvs. This will get set on the plan values.
  const [pvStorageClassAssignment, setPvStorageClassAssignment] = useState({});

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

  useEffect(() => {
    const destCluster = clusterList.find(
      c => c.MigCluster.metadata.name === currentPlan.spec.destMigClusterRef.name
    );

    const scs = destCluster.MigCluster.spec.storageClasses || [];
    setStorageClassOptions(scs);
    // Build a pv => assignedStorageClass table, defaulting to the controller suggestion
    const initialAssignedScs = migPlanPvs ? migPlanPvs.reduce((assignedScs, pv) => {
      const suggestedStorageClass = scs.find(sc =>
        sc.name === pv.selection.storageClass
      );
      assignedScs[pv.name] = suggestedStorageClass ? suggestedStorageClass : scs[0];
      return assignedScs;
    }, {}) : {};
    setPvStorageClassAssignment(initialAssignedScs);
    props.setFieldValue(pvStorageClassAssignmentKey, initialAssignedScs);

    if (values.persistentVolumes.length) {
      setRows(values.persistentVolumes.filter(v => v.type === 'copy'));
    }
  }, [isFetchingPVList]); // Only re-run the effect if fetching value changes

  if (isFetchingPVList) {
    return (
      <Flex
        css={css`
          height: 100%;
          text-align: center;
        `}
      >
        <Box flex="1" m="auto">
          <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100" />
          <Text fontSize={[2, 3, 4]}> Discovering storage classes.</Text>
        </Box>
      </Flex>
    );
  }

  if (storageClassOptions.length === 0) {
    return (
      <Flex
        css={css`
          height: 100%;
          text-align: center;
        `}
      >
        <Box flex="1" m="auto">
          <Text fontSize={[2, 3, 4]}>No StorageClasses available for selection in target cluster</Text>
        </Box>
      </Flex>
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
                  Storage Class
                </div>
              ),
              accessor: 'storageClass',
              width: 500,
              style: { overflow: 'visible' },
              Cell: row => {
                const currentStorageClass = pvStorageClassAssignment[row.original.name];
                return (
                  <Select
                    onChange={(option: any) => handleStorageClassChange(row, option)}
                    options={storageClassOptions.map(sc => {
                      return { value: sc.name, label: sc.name + ':' + sc.provisioner };
                    })}
                    name="storageClasses"
                    value={{
                      label: currentStorageClass ?
                        currentStorageClass.name + ':' + currentStorageClass.provisioner : 'No storage class selected',
                      value: currentStorageClass ?
                        currentStorageClass.name : 'No storage class selected',
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
