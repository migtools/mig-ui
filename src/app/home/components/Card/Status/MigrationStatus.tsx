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


    return (
        <React.Fragment>
            <Flex>
                <Box
                    m="0 .5em 0 0"
                    style={{ fontSize: '28px' }}
                >
                    <div style={{ marginLeft: '1em' }}>
                        {/* {notStartedLength} */}
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
                        {/* {inProgressLength} */}
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
                        {/* {migSuccessList.length} */}
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
