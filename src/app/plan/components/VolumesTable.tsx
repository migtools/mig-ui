/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import { css } from '@emotion/core';

const options = [
  { value: 'copy', label: 'copy' },
  { value: 'move', label: 'move' },
];
interface IState {
  page: number;
  perPage: number;
  pageOfItems: any[];
  rows: any;
  selectAll: any;
  checked: any;
}
interface IProps {
  values: any;
}

class VolumesTable extends React.Component<any, any> {
  handleTypeChange = (row, val) => {
    const { persistentVolumes } = this.props.values;
    const objIndex = persistentVolumes.findIndex(obj => obj.id === row.original.id);

    const updatedObj = { ...persistentVolumes[objIndex], type: val.value };

    const updatedData = [
      ...persistentVolumes.slice(0, objIndex),
      updatedObj,
      ...persistentVolumes.slice(objIndex + 1),
    ];
    this.props.setFieldValue('persistentVolumes', updatedData);
  }
  state = {
    page: 1,
    selectedOption: null,
    perPage: 20,
    pageOfItems: [],
    rows: [],
    checked: [],
    selectAll: false,
  };

  render() {
    const { values } = this.props;
    const { rows, selectedOption } = this.state;
    if (rows !== null) {
      return (
        <React.Fragment>
          <ReactTable
            css={css`
              font-size: 14px;
              .rt-td{
                overflow: visible;
              }
            `}
            data={values.persistentVolumes}
            columns={[
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >PV Name
                  </div>),
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
                  >Project
                  </div>),
                accessor: 'project',
                width: 150,
                resizable: false,
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >Storage Class
                  </div>),
                accessor: 'storageClass',
                width: 150,
                resizable: false,

              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >Size
                  </div>),
                accessor: 'size',
                width: 75,
                resizable: false,
              },
              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >Claim
                  </div>),
                accessor: 'claim',
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
                  >Type
                  </div>),
                accessor: 'type',
                width: 120,
                resizable: false,
                Cell: row => (
                  <Select
                    onChange={(val: any) => this.handleTypeChange(row, val)}
                    options={options}
                    name="persistentVolumes"
                    value={{ label: row.original.type, value: row.original.type }}

                  />
                ),
              },

              {
                Header: () => (
                  <div
                    style={{
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >Details
                  </div>),
                accessor: 'details',
                width: 50,
                resizable: false,
                textAlign: 'left',
                Cell: row => (
                  <a
                    href="https://google.com"
                    target="_blank"

                  >view
                  </a>
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
  }
}
export default VolumesTable;
