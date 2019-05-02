import React from 'react';
import {
    DataListItem,
    DataListCell,
} from '@patternfly/react-core';
import styled from '@emotion/styled';

const PlanHeader = ({ ...props }) => {
    const HeaderDataListCell = styled(DataListCell)`
  font-weight: 600;
`;
    return (
        <DataListItem
            key={0}
            isExpanded={false}
            aria-labelledby="simple-item1"
        >
            <HeaderDataListCell width={1}>
                <span>Name</span>
            </HeaderDataListCell>
            <HeaderDataListCell width={1}>
                <span>Migrations</span>
            </HeaderDataListCell>
            <HeaderDataListCell width={1}>
                <span>Source</span>
            </HeaderDataListCell>
            <HeaderDataListCell width={1}>
                <span>Target</span>
            </HeaderDataListCell>
            <HeaderDataListCell width={1}>
                <span>Repository</span>
            </HeaderDataListCell>
            <HeaderDataListCell width={1}>
                <span>Persistent Volumes</span>
            </HeaderDataListCell>
            <HeaderDataListCell width={3}>
                <span>Last Status</span>
            </HeaderDataListCell>
            <HeaderDataListCell width={1}>
            </HeaderDataListCell>
        </DataListItem>
    );
}
export default PlanHeader;
