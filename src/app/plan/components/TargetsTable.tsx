import React from 'react';
import { Title } from '@patternfly/react-core';
import { Button, Card, CardHeader, CardBody, CardFooter, Switch } from '@patternfly/react-core';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { EditAltIcon, TimesIcon } from '@patternfly/react-icons';
import { css } from '@emotion/core';
interface IState {
  page: number;
  perPage: number;
  pageOfItems: any[];
  rows: any;
  selectAll: any;
  editableList: any;
}
interface IProps {
  values: any;
}

class TargetsTable extends React.Component<IProps, IState> {
  state = {
    page: 1,
    perPage: 20,
    pageOfItems: [],
    rows: [],
    selectAll: false,
    editableList: [],
  };


  componentDidMount() {
    if (this.props.values.selectedNamespaces) {
      this.setState({ rows: this.props.values.selectedNamespaces });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.values !== this.props.values) {
      this.setState({ rows: this.props.values.selectedNamespaces });
    }
  }
  renderEditable = (cellInfo) => {

    return (
      <div
        style={{ backgroundColor: '#fafafa' }}
        contentEditable={this.state.editableList[cellInfo.row._index]}

        suppressContentEditableWarning
        onBlur={e => {
          const rows = [...this.state.rows];
          rows[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
          this.setState({ rows });
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.rows[cellInfo.index][cellInfo.column.id],
        }}
      />
    );
  }
  toggleRowEditable = row => {

    const index = row.index;
    const editableListCopy = this.state.editableList;
    editableListCopy[index] = !this.state.editableList[index];

    this.setState({
      editableList: editableListCopy,
    });
  }

  render() {
    const { values } = this.props;
    const { rows } = this.state;

    if (values.selectedNamespaces !== null && values.targetCluster !== null) {
      return (
        <ReactTable
          css={css`
              font-size: 14px;
              .rt-td{
                overflow: visible;
              }
            `}

          data={rows}
          columns={[
            {
              Header: () => (
                <div
                  style={{
                    fontWeight: 600,
                    textAlign: "left"
                  }}
                >Source Project Name
                  </div>),
              accessor: 'name',
              Cell: this.renderEditable,
            },
            {
              Header: () => (
                <div
                  style={{
                    textAlign: "left",
                    fontWeight: 600
                  }}
                >Target Project Name
                  </div>),
              accessor: 'targetName',
              Cell: this.renderEditable,
            },
            {
              accessor: 'id',
              Cell: row => (
                <Button
                  id={`id-${row.index}`}
                  // label={this.state.editableList[row.index] ? 'Edit' : 'Locked'}
                  // isChecked={this.state.editableList[row.index] || false}
                  onClick={() => this.toggleRowEditable(row)}
                  aria-label="Edit"
                  variant="link"
                >
                  {this.state.editableList[row.index] ?
                    <TimesIcon /> : <EditAltIcon />
                  }
                </Button>
                // <Switch
                //   id={`id-${row.index}`}
                //   label={this.state.editableList[row.index] ? 'Edit' : 'Locked'}
                //   isChecked={this.state.editableList[row.index] || false}
                //   onChange={() => this.toggleRowEditable(row)}
                //   aria-label="Edit"
                // />
              ),
            },

          ]}
          defaultPageSize={5}
          className="-striped -highlight"
        />
      );
    } else {
      return <div />;
    }
  }
}
export default TargetsTable;
