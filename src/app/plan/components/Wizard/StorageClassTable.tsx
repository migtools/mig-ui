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

const StorageClassTable = (props): any => {
  const { planList, clusterList, values, isFetchingPVList } = props;
  const [rows, setRows] = useState([]);
  const [storageClassOptions, setStorageClassOptions] = useState([]);

  const handleTypeChange = (row, option) => {
    updateTableData(row.index, option.value);
  };

  const getCurrentPlan = () => {
    return planList.find(p => p.MigPlan.metadata.name === values.planName);
  };

  const updateTableData = (rowIndex, updatedValue) => {
    const currentPlan = getCurrentPlan();
    const rowsCopy = [...rows];
    if (currentPlan !== null && values.persistentVolumes) {
      const updatedRow = { ...rowsCopy[rowIndex], storageClass: updatedValue };

      rowsCopy[rowIndex] = updatedRow;
    }

    setRows(rowsCopy);
    props.setFieldValue('persistentVolumes', rowsCopy);
  };

  useEffect(() => {
    const currentPlan = getCurrentPlan();
    const destCluster = clusterList.find(
      c => c.MigCluster.metadata.name === currentPlan.MigPlan.spec.destMigClusterRef.name
    );
    setStorageClassOptions(destCluster.MigCluster.spec.storageClasses);

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

  if (rows !== null) {
    return (
      <React.Fragment>
        <ReactTable
          css={css`
            font-size: 14px;
            .rt-td {
              overflow: visible;
            }
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
              resizable: false,
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
              resizable: false,
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
              resizable: false,
              Cell: row => {
                const defaultStorageClass = storageClassOptions.find(sc => sc.default === true);
                return (
                  <Select
                    onChange={(option: any) => handleTypeChange(row, option)}
                    options={storageClassOptions.map(sc => {
                      return { value: sc.name, label: sc.name + ':' + sc.provisioner };
                    })}
                    name="storageClasses"
                    value={{
                      label: defaultStorageClass.name + ':' + defaultStorageClass.provisioner,
                      value: defaultStorageClass.name,
                    }}
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
