/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { css } from '@emotion/core';
import styled from '@emotion/styled';
interface INamespaceTableProps {
  values: any;
  sourceClusterNamespaces: any;
  setFieldValue: (fieldName, fieldValue) => void;
}

const NamespaceTable: React.FunctionComponent<INamespaceTableProps> = props => {
  const { setFieldValue, sourceClusterNamespaces, values } = props;
  const [checkedNamespaceRows, setCheckedRows] = useState([]);


  useEffect(() => {
    if (values.selectedNamespaces.length > 0) {
      const checkedCopy = [];
      values.selectedNamespaces.filter((item, itemIndex) => {
        for (let i = 0; sourceClusterNamespaces.length > i; i++) {
          if (item.metadata.name === sourceClusterNamespaces[i].metadata.name) {
            checkedCopy[i] = true;
          }
        }
      });
      setCheckedRows(checkedCopy);
    }
  }, [sourceClusterNamespaces, values]);

  const selectRow = row => {
    const index = row.index;
    const checkedCopy = checkedNamespaceRows;
    checkedCopy[index] = !checkedNamespaceRows[index];

    setCheckedRows(checkedCopy);
    const formValuesForNamespaces = sourceClusterNamespaces.filter((item, itemIndex) => {
      for (let i = 0; checkedCopy.length > i; i++) {
        if (itemIndex === i) {
          if (checkedCopy[i]) {
            return item;
          }
        }
      }
    });
    setFieldValue('selectedNamespaces', formValuesForNamespaces);
  };
  const StyledTextContent = styled(TextContent)`
      margin: 1em 0 1em 0;
    `;

  if (values.sourceCluster !== null) {
    return (
      <React.Fragment>
        <StyledTextContent>
          <TextList component="dl">
            <TextListItem component="dt">Select projects to be migrated: </TextListItem>
          </TextList>
        </StyledTextContent>

        <ReactTable
          css={css`
              font-size: 14px;
            `}
          data={sourceClusterNamespaces}
          columns={[
            {
              Cell: row => {
                return (
                  <input
                    type="checkbox"
                    onChange={() => selectRow(row)}
                    checked={checkedNamespaceRows[row.index]}
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
      </React.Fragment>
    );
  }
  else {
    return null;
  }
};

export default NamespaceTable;