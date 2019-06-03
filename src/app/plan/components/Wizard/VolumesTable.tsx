/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import { css } from '@emotion/core';
import { connect } from 'react-redux';

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
  currentPlan: any;
}

class VolumesTable extends React.Component<any, any> {
  handleTypeChange = (row, val) => {
    // On change of the pv's action (type), update the persistentVolumes value
    // so the state is correct in formik
    const { persistentVolumes } = this.props.values;
    const objIndex = persistentVolumes.findIndex(v => v.name === row.original.name);

    const updatedPv = { ...persistentVolumes[objIndex], type: val.value };

    const updatedPersistentVolumes = [
      ...persistentVolumes.slice(0, objIndex),
      updatedPv,
      ...persistentVolumes.slice(objIndex + 1),
    ];
    this.props.setFieldValue('persistentVolumes', updatedPersistentVolumes);
  };
  state = {
    page: 1,
    selectedOption: null,
    perPage: 20,
    pageOfItems: [],
    rows: [],
    checked: [],
    selectAll: false,
  };

  getTableData() {
    // Builds table data from a combination of the formik values, and the
    // persistent volumes as seen on a MigPlan object.
    const discoveredPersistentVolumes = this.props.currentPlan.spec.persistentVolumes;

    // No PVs discovered to be in use. This is normal for stateless cloud apps.
    if(!discoveredPersistentVolumes) {
      return [];
    }

    return discoveredPersistentVolumes.map(planVolume => {
      let pvAction = 'copy'; // Default to copy
      if(this.props.values.persistentVolumes.length !== 0) {
        const rowVal = this.props.values.persistentVolumes.find(v => v.name === planVolume.name);
        pvAction = rowVal.type;
      }

      // TODO: A number of these values will need to be further supported by the
      // controller. Today the data is not available.
      // See the mig controller issue describing what data we need here:
      // https://github.com/fusor/mig-controller/issues/134
      return {
        name: planVolume.name,
        project: '',
        storageClass: '',
        size: '100 Gi',
        claim: '',
        type: pvAction,
        details: '',
        supportedActions: planVolume.supportedActions,
      };
    });
  }

  componentDidMount() {
    // Initializes the table values in formik, since it defaults to an
    // empty array.
    this.props.setFieldValue('persistentVolumes', this.getTableData());
  }

  render() {
    const { values, currentPlan } = this.props;
    const { rows, selectedOption } = this.state;

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
            data={this.getTableData()}
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
                    Project
                  </div>
                ),
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
                  >
                    Storage Class
                  </div>
                ),
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
                  >
                    Size
                  </div>
                ),
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
                  >
                    Claim
                  </div>
                ),
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
                  >
                    Type
                  </div>
                ),
                accessor: 'type',
                width: 120,
                resizable: false,
                Cell: row => (
                  <Select
                    onChange={(val: any) => this.handleTypeChange(row, val)}
                    options={row.original.supportedActions.map(a => {
                      // NOTE: Each PV may not support all actions (any at all even),
                      // we need to inspect the PV to determine this
                      return {value: a, label: a};
                    })}
                    name="persistentVolumes"
                    value={{
                      label: row.original.type,
                      value: row.original.type,
                    }}
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
                  >
                    Details
                  </div>
                ),
                accessor: 'details',
                width: 50,
                resizable: false,
                textAlign: 'left',
                Cell: row => (
                  <a href="https://google.com" target="_blank">
                    view
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

const mapStateToProps = state => {
  return {
    plans: state.plan.migPlanList.map(p => p.MigPlan),
  };
};

export default connect(
  mapStateToProps, null,
)(VolumesTable);
