import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {
  GridItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

const styles = require('./NamespaceTable.module');
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
    if (sourceClusterNamespaces.length > 0) {
      const formValuesForNamespaces = sourceClusterNamespaces.filter((item) => {
        const keys = Object.keys(checkedNamespaceRows);

        for (const key of keys) {
          if (item.name === key && checkedNamespaceRows[key]) {
            return item;
          }
        }
      }).map((namespace) => namespace.name);

      setFieldValue('selectedNamespaces', formValuesForNamespaces);
    }
  }, [checkedNamespaceRows]);

  useEffect(() => {
    if (values.selectedNamespaces.length > 0 && sourceClusterNamespaces.length > 0) {
      const newSelected = Object.assign({}, checkedNamespaceRows);
      values.selectedNamespaces.filter((item, _) => {
        for (let i = 0; sourceClusterNamespaces.length > i; i++) {
          if (item === sourceClusterNamespaces[i].name) {
            newSelected[item] = true;
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
        newSelected[item.name] = true;
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

  const tableStyle = {
    fontSize: '14px',
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
            className="-striped -highlight"
            style={tableStyle}
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
                        onChange={() => selectRow(original.name)}
                        checked={checkedNamespaceRows[original.name] === true}
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
                accessor: 'name',
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Number of pods
                    </div>
                ),
                accessor: 'podCount',
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Number of PV claims
                    </div>
                ),
                accessor: 'pvcCount',
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
                accessor: 'serviceCount',
              },
            ]}
            defaultPageSize={5}
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
