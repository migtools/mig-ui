import React from 'react';
import {
    DataListItem,
    DataListCell,
    DataListItemRow,
    DataListItemCells,
    DataListAction,
    DataList,
} from '@patternfly/react-core';
import styled from '@emotion/styled';

const PlanHeader = ({ ...props }) => {
    const HeaderDataListCell = styled(DataListCell)`
  font-weight: 600;
  margin-top: auto;
`;
    const StyledDataListAction = styled(DataListAction)`
    width: 15em;
`;
    return (
        <DataListItem
            key={0}
            aria-labelledby="simple-item1"
        >
            <DataListItemRow>
                <DataListItemCells
                    dataListCells={[
                        <HeaderDataListCell key="name" width={2}>
                            <span>Name</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="migrations" width={2}>
                            <span>Migrations</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="source" width={2}>
                            <span>Source</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="target" width={2}>
                            <span>Target</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="repo" width={2}>
                            <span>Repository</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="vols" width={2}>
                            <span>Persistent Volumes</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="status" width={3}>
                            <span>Last Status</span>
                        </HeaderDataListCell>,

                    ]}
                />
                <StyledDataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan" >
                    <span />
                </StyledDataListAction>

            </DataListItemRow>
        </DataListItem>
    );
};
export default PlanHeader;
