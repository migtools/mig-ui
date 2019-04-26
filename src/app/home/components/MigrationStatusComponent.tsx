import React from 'react';
import theme from '../../../theme';
import PlanStatusIcon from '../../home/components/PlanStatusIcon';
import { css } from '@emotion/core';

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
            <div>
                <span style={{ fontSize: "28px", marginRight: ".75rem" }}>
                    {notStartedLength}
                </span>
                Not started
            </div>
            <div>
                <span style={{ fontSize: "28px", marginRight: ".75rem" }}>
                    {inProgressLength}
                </span>
                In progress
            </div>
            <div>
                <span style={{ fontSize: "28px", marginRight: ".75rem" }}>
                    {migSuccessList.length}
                </span>
                Complete
            </div>
        </React.Fragment >

    );
};

export default MigrationStatusComponent;


