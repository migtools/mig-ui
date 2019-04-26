import React from 'react';
import theme from '../../../theme';
import PlanStatusIcon from '../../home/components/PlanStatusIcon';
import { css } from '@emotion/core';
import {
    Grid,
    GridItem,
} from '@patternfly/react-core';

const MigrationStatusComponent = ({ dataList, ...props }) => {
    const notStartedList = dataList.filter((item) => item.status.state === 'Not Started');
    const stagedSuccessList = dataList.filter((item) => item.status.state === 'Staged Successfully');
    const migSuccessList = dataList.filter((item) => item.status.state === 'Migrated Successfully');
    const stagingList = dataList.filter((item) => item.status.state === 'Staging');
    const migratingList = dataList.filter((item) => item.status.state === 'Migrating');
    const inProgressLength = [migratingList.length, stagingList.length].reduce(add);
    const notStartedLength = 0;

    function add(accumulator, a) {
        return accumulator + a;
    }

    return (
        <React.Fragment>
            <Grid>
                <GridItem span={2} style={{ fontSize: "28px" }}>
                    <div style={{ marginLeft: "1em" }}>
                        {notStartedLength}
                    </div>
                </GridItem>
                <GridItem span={10} style={{ margin: "auto 0 auto 0" }}>
                    Not started
                </GridItem>
            </Grid>
            <Grid>
                <GridItem span={2} style={{ fontSize: "28px", }}>
                    <div style={{ marginLeft: "1em" }}>
                        {inProgressLength}
                    </div>
                </GridItem>
                <GridItem span={10} style={{ margin: "auto 0 auto 0" }}>
                    In progress
                </GridItem>
            </Grid>
            <Grid>
                <GridItem span={2} style={{ fontSize: "28px", }}>
                    <div style={{ marginLeft: "1em" }}>
                        {migSuccessList.length}
                    </div>
                </GridItem>
                <GridItem span={10} style={{ margin: "auto 0 auto 0" }}>
                    Complete
                </GridItem>
            </Grid>
        </React.Fragment >

    );
};

export default MigrationStatusComponent;


