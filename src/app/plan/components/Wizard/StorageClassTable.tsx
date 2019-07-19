/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
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

const [stepIdReached, setStepIdReached] = useState(1);

// interface IState {
//   page: number;
//   perPage: number;
//   pageOfItems: any[];
//   rows: any;
//   selectAll: any;
//   checked: any;
// }
// interface IProps {
//   values: any;
// }

const VolumesTable = props => {
  return <div />;
};
