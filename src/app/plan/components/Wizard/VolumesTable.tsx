/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Select from 'react-select';
import { css } from '@emotion/core';
import { connect } from 'react-redux';
import { Flex, Box, Text } from '@rebass/emotion';
import styled from '@emotion/styled';
import StatusIcon from '../../../common/components/StatusIcon';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import theme from '../../../../theme';
import Loader from 'react-loader-spinner';
import planOperations from '../../duck/operations';
import planSelectors from '../../duck/selectors';

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
  state = {
    options: [{ label: 'copy', value: 'copy' }, { label: 'move', value: 'move' }],
    selectedOption: null,
    rows: [],
  };
  handleTypeChange = (row, option) => {
    this.updateTableData(row.index, option.value);
  };
  getCurrentPlan = (): any => {
    return this.props.plans.find(p => p.MigPlan.metadata.name === this.props.values.planName);
  };

  updateTableData = (rowIndex, updatedValue) => {
    const currentPlan = this.getCurrentPlan();
    const { values } = this.props;
    const { rows } = this.state;
    const rowsCopy = [...rows];
    if (currentPlan !== null && values.persistentVolumes) {
      const updatedRow = { ...rowsCopy[rowIndex], type: updatedValue };

      rowsCopy[rowIndex] = updatedRow;
    }
    this.setState({ rows: rowsCopy });
    this.props.setFieldValue('persistentVolumes', rowsCopy);
  };

  getTableData() {
    const currentPlan = this.getCurrentPlan();
    // Builds table data from a combination of the formik values, and the
    // persistent volumes as seen on a MigPlan object.
    if (currentPlan) {
      const discoveredPersistentVolumes = currentPlan.MigPlan.spec.persistentVolumes || null;

      // No PVs discovered to be in use. This is normal for stateless cloud apps.
      if (!discoveredPersistentVolumes) {
        return [];
      }
      let mappedPVs;
      if (this.props.values.persistentVolumes) {
        mappedPVs = discoveredPersistentVolumes.map(planVolume => {
          let pvAction = 'copy'; // Default to copy
          if (this.props.values.persistentVolumes.length !== 0) {
            const rowVal = this.props.values.persistentVolumes.find(
              v => v.name === planVolume.name
            );
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
      } else {
        mappedPVs = discoveredPersistentVolumes.map(planVolume => {
          const pvAction = 'copy'; // Default to copy
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
      this.props.setFieldValue('persistentVolumes', mappedPVs);
      this.setState({ rows: mappedPVs });
    }
  }

  componentDidMount() {
    // Initializes the table values in formik, since it defaults to an
    // empty array.
    this.getTableData();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isFetching !== this.props.isFetching) {
      this.getTableData();
    }
  }

  render() {
    const StyledTextContent = styled(TextContent)`
      margin: 1em 0 1em 0;
    `;
    const { rows } = this.state;

    //TODO: added this component level error state to handle the case of no PVs
    // showing up after 3 checks of the interval. When the isPVError flag is checked,
    // the volumes form will show this error. Need to add redux actions & state to encapsulate
    // validation so that this error state enables the user to go to next page( that possibly
    // shows a different set of forms catered to stateless apps)

    if (this.props.isPVError) {
      return (
        <Box
          css={css`
            text-align: center;
          `}
        >
          <StyledTextContent>
            <Text color={theme.colors.statusRed} fontSize={[2, 3, 4]}>
              <StatusIcon isReady={false} />
              Unable to find PVs
            </Text>
          </StyledTextContent>
        </Box>
      );
    }
    if (this.props.isFetching) {
      return (
        <Flex
          css={css`
            height: 100%;
            text-align: center;
          `}
        >
          <Box flex="1" m="auto">
            <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100" />
            <Text fontSize={[2, 3, 4]}>
              {' '}
              Discovering persistent volumes attached to source projects.
            </Text>
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
                    onChange={(option: any) => this.handleTypeChange(row, option)}
                    options={row.original.supportedActions.map(a => {
                      // NOTE: Each PV may not support all actions (any at all even),
                      // we need to inspect the PV to determine this
                      return { value: a, label: a };
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
    plans: planSelectors.getPlansWithStatus(state),
    isPVError: state.plan.isPVError,
    isFetching: state.plan.isFetchingPVList,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    pvFetchRequest: () => dispatch(planOperations.pvFetchRequest()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VolumesTable);
