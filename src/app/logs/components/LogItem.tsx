/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Box } from '@rebass/emotion';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const LogItem = ({ log }) => {
  console.error(log);
  const myData = log !== {} ? log.map((item) => ({ value: item })) : [];
  const columns = [{
    Header: '', accessor: 'value'
  }];

  const StyledBox = styled(Box)`
    height: 100%;
    max-height: 100%;
    width: 100%;
  `;

  return (
    <StyledBox>
      <ReactTable
        filterable
        defaultFilterMethod={(filter, row) => {
          return row[filter.id].includes(filter.value);
        }
        }
        defaultPageSize={200}
        style={{ height: `${0.6 * window.innerHeight}px`, textAlign: 'left' }}
        columns={columns}
        data={myData}
        className="-highlight"
      />
    </StyledBox>
  );
};

export default LogItem;
