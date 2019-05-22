/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import theme from '../../../../../theme';
import PlanStatusIcon from './PlanStatusIcon';
import { css } from '@emotion/core';
import {
    Grid,
    GridItem,
} from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';

const MigrationStatus = ({ dataList, ...props }) => {
    const notStartedList = dataList.filter((item) => item.planState.status.state === 'Not Started');
    const stagedSuccessList = dataList.filter((item) => item.planState.status.state === 'Staged Successfully');
    const migSuccessList = dataList.filter((item) => item.planState.status.state === 'Migrated Successfully');
    const stagingList = dataList.filter((item) => item.planState.status.state === 'Staging');
    const migratingList = dataList.filter((item) => item.planState.status.state === 'Migrating');
    const inProgressLength = [migratingList.length, stagingList.length].reduce(add);

    function add(accumulator, a) {
        return accumulator + a;
    }

    return (
        <React.Fragment>
            <Flex>
                <Box
                    m="0 .5em 0 0"
                    style={{ fontSize: '28px' }}
                >
                    <div style={{ marginLeft: '1em' }}>
                        {notStartedList.length}
                    </div>
                </Box>
                <Box style={{ margin: 'auto 0 auto 0' }}>
                    Not started
                </Box>
            </Flex>
            <Flex>
                <Box
                    m="0 .5em 0 0"
                    style={{ fontSize: '28px' }}
                >
                    <div style={{ marginLeft: '1em' }}>
                        {inProgressLength}
                    </div>
                </Box>
                <Box span={10} style={{ margin: 'auto 0 auto 0' }}>
                    In progress
                </Box>
            </Flex>
            <Flex>
                <Box
                    m="0 .5em 0 0"
                    style={{ fontSize: '28px' }}
                >
                    <div style={{ marginLeft: '1em' }}>
                        {migSuccessList.length}
                    </div>
                </Box>
                <Box span={10} style={{ margin: 'auto 0 auto 0' }}>
                    Complete
                </Box >
            </Flex>
        </React.Fragment >

    );
};
export default MigrationStatus;
