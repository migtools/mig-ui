/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import { css } from '@emotion/core';
import { Flex, Box, Text } from '@rebass/emotion';
import styled from '@emotion/styled';
import StatusIcon from '../../../common/components/StatusIcon';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import theme from '../../../../theme';
import Loader from 'react-loader-spinner';

const StorageClassTable = (props): any => {
  const {
    setFieldValue,
    planList,
    storageClassList,
    values,
    storageClassFetch,
    isStorageClassError,
    isFetchingStorageClasses,
  } = props;
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
    // storageClassFetch();
    // console.log('storageClassList', storageClassList);
    const currentPlan = getCurrentPlan();
    if (currentPlan) {
      const copiedPVs = currentPlan.MigPlan.spec.persistentVolumes || [];
      let mappedPVs;
      if (values.persistentVolumes) {
        mappedPVs = copiedPVs.map(planVolume => {
          let pvStorageClass = ''; // Default to emptry
          if (values.persistentVolumes.length !== 0) {
            const rowVal = values.persistentVolumes.find(v => v.name === planVolume.name);
            if (rowVal.type === 'copy') {
              pvStorageClass = rowVal.storageClass;
              setStorageClassOptions([pvStorageClass, 'other']);
              return {
                name: planVolume.name,
                type: planVolume.type,
                storageClass: pvStorageClass,
              };
            } else {
              return {};
            }
          }
        });
      } else {
        mappedPVs = [];
      }
      setFieldValue('persistentVolumes', mappedPVs);
      setRows(mappedPVs);
    }
  }, [isFetchingStorageClasses]); // Only re-run the effect if fetching value changes

  if (isStorageClassError) {
    return <div>error</div>;
  }
  if (isFetchingStorageClasses) {
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
              width: 120,
              resizable: false,
              Cell: row => (
                <Select
                  onChange={(option: any) => handleTypeChange(row, option)}
                  options={storageClassOptions.map(a => {
                    // NOTE: Each PV may not support all storage classes (any at all even),
                    // we need to inspect the PV to determine this
                    return { value: a, label: a };
                  })}
                  name="storageClasses"
                  value={{
                    label: row.original.storageClass,
                    value: row.original.storageClass,
                  }}
                />
              ),
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
