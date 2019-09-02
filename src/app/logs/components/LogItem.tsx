/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Box } from '@rebass/emotion';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

const LogItem = ({ log }) => {
  const arrayOfLines = log.split(/\r?\n/);
  const myData = arrayOfLines.map((item, index) => {
    const rObj = {};
    const slicedItem = item.slice(1, -1).replace(/['"]+/g, ' ');
    rObj['value'] = slicedItem;
    return rObj;
  }
  );
  const columns = [{
    Header: 'Value', accessor: 'value',
  }];

  const StyledBox = styled(Box)`
    height: 100%;
    width: 100%;
  `;
  return (
    <StyledBox>
      <ReactTable
        style
        filterable
        defaultFilterMethod={(filter, row) => {
          return row[filter.id].includes(filter.value);
        }
        }
        columns={columns}
        data={myData}
      />
    </StyledBox>
  );
};

export default LogItem;
