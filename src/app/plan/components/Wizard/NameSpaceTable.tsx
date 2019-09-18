/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {
  GridItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { css } from '@emotion/core';
interface INamespaceTableProps {
  isEdit: boolean;
  values: any;
  sourceClusterNamespaces: any;
  setFieldValue: (fieldName, fieldValue) => void;
}

const NamespaceTable: React.FunctionComponent<INamespaceTableProps> = props => {
  const { isEdit, setFieldValue, sourceClusterNamespaces, values } = props;
  const [checkedNamespaceRows, setCheckedNamespaceRows] = useState({});
  const [selectAll, setSelectAll] = useState(0);


  useEffect(() => {
    const formValuesForNamespaces = sourceClusterNamespaces.filter((item) => {
      const keys = Object.keys(checkedNamespaceRows);

      for (const key of keys) {
        if (item.metadata.uid === key) {
          return item;
        }
      }
    });
    setFieldValue('selectedNamespaces', formValuesForNamespaces);
  }, [checkedNamespaceRows]);

  useEffect(() => {
    if (values.selectedNamespaces.length > 0) {
      const newSelected = Object.assign({}, checkedNamespaceRows);
      values.selectedNamespaces.filter((item, itemIndex) => {
        for (let i = 0; sourceClusterNamespaces.length > i; i++) {
          if (item.metadata && item.metadata.uid) {
            if (item.metadata.uid === sourceClusterNamespaces[i].metadata.uid) {
              newSelected[item.metadata.uid] = true;
            }
          } else {
            if (item === sourceClusterNamespaces[i].metadata.name) {
              newSelected[sourceClusterNamespaces[i].metadata.uid] = true;
            }
          }
        }
      });
      setCheckedNamespaceRows(newSelected);
    }
  }, [sourceClusterNamespaces]);

  const toggleSelectAll = () => {
    const newSelected = {};

    if (selectAll === 0) {
      sourceClusterNamespaces.forEach(item => {
        newSelected[item.metadata.uid] = true;
      });
    }
    setSelectAll(selectAll === 0 ? 1 : 0);
    setCheckedNamespaceRows(newSelected);
  };

  const selectRow = rowId => {
    const newSelected = Object.assign({}, checkedNamespaceRows);
    newSelected[rowId] = !checkedNamespaceRows[rowId];
    setCheckedNamespaceRows(newSelected);
    setSelectAll(2);
  };


  if (values.sourceCluster !== null) {
    return (
      <React.Fragment>
        <GridItem>
          <TextContent>
            <Text component={TextVariants.p}>
              Select projects to be migrated:
            </Text>
          </TextContent>
        </GridItem>

        <GridItem>
          <ReactTable
            css={css`
                font-size: 14px;
              `}
            data={sourceClusterNamespaces}
            columns={[
              {
                id: 'checkbox',
                accessor: '',
                resizable: false,
                width: 50,
                Cell: ({ original }) => {
                  return (
                    <div style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        onChange={() => selectRow(original.metadata.uid)}
                        checked={checkedNamespaceRows[original.metadata.uid] === true}
                      />
                    </div>
                  );
                },
                Header: () => {
                  return (
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectAll === 1}
                      ref={input => {
                        if (input) {
                          input.indeterminate = selectAll === 2;
                        }
                      }}
                      onChange={toggleSelectAll}
                    />
                  );
                }
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Name
                    </div>
                ),
                accessor: 'metadata.name',
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Display Name
                    </div>
                ),
                accessor: 'displayName',
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Number of Pods
                    </div>
                ),
                accessor: 'pods',
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Number of Services
                    </div>
                ),
                accessor: 'services',
              },
            ]}
            defaultPageSize={5}
            className="-striped -highlight"
          />
        </GridItem>
      </React.Fragment>
    );
  }
  else {
    return null;
  }
};

export default NamespaceTable;