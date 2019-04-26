import React from 'react';
import { css } from '@emotion/core';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import theme from './../../../theme';
import { Flex, Box, Text } from '@rebass/emotion';
import StatusIcon from '../../common/components/StatusIcon';
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

class ResultsStep extends React.Component<any, any> {
    state = {
        isLoading: true,
    };

    componentDidMount() {
        this.props.onWizardLoadingToggle(true);

        setTimeout(() => {
            this.setState(() => ({ isLoading: false }));
            this.props.onWizardLoadingToggle(false);
            this.props.setFieldValue('connectionStatus', 'success');

        }, 1500);
    }

    render() {
        return (
            <React.Fragment>
                {this.state.isLoading ?
                    <Flex
                        css={css`
                        height: 100%;
                        text-align: center;
                    `}
                    >
                        <Box flex="1" m="auto">
                            <Loader
                                type="ThreeDots"
                                color={theme.colors.navy}
                                height="100"
                                width="100"
                            />
                            <Text fontSize={[2, 3, 4]}> Validating migration plan {
                                ' '
                            }
                                <StyledSpan>
                                    {this.props.values.planName}
                                </StyledSpan>
                            </Text>
                            <Text fontSize={[2, 3, 4]}> This might take a few minutes.</Text>
                        </Box>

                    </Flex>

                    :
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
                                has been validated.
                            </Text>
                        </Box>
                    </Flex>
                }
            </React.Fragment>
        );
    }
}
export default ResultsStep;

