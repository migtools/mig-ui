/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { css } from '@emotion/core';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import theme from '../../../theme';
import { Flex, Box, Text } from '@rebass/emotion';
import StatusIcon from '../../common/components/StatusIcon';
import { Button } from '@patternfly/react-core';

const StyledSpan = styled.span`
    font-weight: 600;
  `;

interface IState {
    page: number;
    perPage: number;
    pageOfItems: any[];
    rows: any;
    selectAll: any;
    checked: any;
}
interface IProps {
    values: any;
}

class ConfirmationStep extends React.Component<any, any> {
    // state = {
    //     isLoading: true,
    // };

    componentDidMount() {
        // this.props.onWizardLoadingToggle(true);

        // setTimeout(() => {
        //     this.setState(() => ({ isLoading: false }));
        //     this.props.onWizardLoadingToggle(false);
        //     // this.props.setFieldValue('connectionStatus', 'success');

        // }, 1500);
    }
    render() {
        return (
            <Flex
                css={css`
                        height: 100%;
                        text-align: center;
                    `}
            >
                <Box flex="1" m="auto">
                    <Text fontSize={[2, 3, 4]}>
                        <StatusIcon status="success" />
                        <StyledSpan >
                            {this.props.values.planName}{' '}
                        </StyledSpan>
                        Text here
                            </Text>
                </Box>
                <Box>
                    <Button onClick={this.props.onAddPlan} variant="primary">
                        Add Plan
                    </Button>
                </Box>
            </Flex>
        );
    }
}
export default ConfirmationStep;

