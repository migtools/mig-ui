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

class VolumesTable2 extends React.Component<any, any> {
  handleChange = (selectedOption) => {
    this.setState({ selectedOption });
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
    const data = [
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
      {
        name: 'persistent_volume1',
        project: 'My Project1',
        storageClass: 'OpenStack Cinder',
        size: '120 GB',
        deployment: 'deployment_name',
        type: '',
        details: '',
      },
    ];
    if (rows !== null) {
      return (
        <React.Fragment>
          <ReactTable
            css={css`
          font-size: 14px;`}
            data={data}
            columns={[
              {
                Header: 'PV Name',
                accessor: 'name',
                width: 180,
                resizable: false,

              },
              {
                Header: 'Project',
                accessor: 'project',
                width: 150,
                resizable: false,
              },
              {
                Header: 'Storage Class',
                accessor: 'storageClass',
                width: 150,
                resizable: false,

              },
              {
                Header: 'Size',
                accessor: 'size',
                width: 75,
                resizable: false,
              },
              {
                Header: 'Deployment',
                accessor: 'deployment',
                width: 180,
                resizable: false,
              },
              {
                Header: 'Type',
                accessor: 'type',
                width: 120,
                resizable: false,
                Cell: row => (
                  <Select
                    value={selectedOption}
                    onChange={this.handleChange}
                    options={options}
                  />
                ),
              },

              {
                Header: 'Details',
                accessor: 'details',
                width: 40,
                resizable: false,
              },
            ]}
            defaultPageSize={10}
            className="-striped -highlight"
          />
        </React.Fragment>
      );
    } else {
      return <div />;
    }
  }
}
export default VolumesTable2;
