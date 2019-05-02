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
                        <HeaderDataListCell key="name" width={1}>
                            <span>Name</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="migrations" width={1}>
                            <span>Migrations</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="source" width={1}>
                            <span>Source</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="target" width={1}>
                            <span>Target</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="repo" width={1}>
                            <span>Repository</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="vols" width={1}>
                            <span>Persistent Volumes</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell key="status" width={3}>
                            <span>Last Status</span>
                        </HeaderDataListCell>,
                        <HeaderDataListCell width={1} key="spacer" />,

                    ]}
                />
                <StyledDataListAction aria-label="add-plan" aria-labelledby="plan-item" id="add-plan" >
                    <span/>
                </StyledDataListAction>

            </DataListItemRow>
        </DataListItem>
    );
};
export default PlanHeader;
