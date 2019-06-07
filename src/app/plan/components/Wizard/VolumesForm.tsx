/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import { Flex, Box, Text } from '@rebass/emotion';
import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import Select from 'react-select';
import VolumesTable from './VolumesTable';
import Loader from 'react-loader-spinner';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import theme from '../../../../theme';
import { connect } from 'react-redux';
import StatusIcon from '../../../common/components/StatusIcon';

const PvsDiscoveredType = 'PvsDiscovered';
const StyledBox = styled(Box)`
  text-align: center;
`;
class VolumesForm extends React.Component<any> {
  state = {
    options: [],
    sourceCluster: null,
    isLoading: true,
  };

  componentDidMount() {
    this.props.onWizardLoadingToggle(true);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { plans, values } = this.props;

      if (plans.length === 0) {
        return;
      }

      const currentPlan = plans.find(p => {
        return p.metadata.name === values.planName;
      });
      //TODO: This was done to allow the code to run in local development mode.
      // We need a way to mock out the status in local dev mode

      if (currentPlan) {
        if (!currentPlan.status) {
          return;
        }

        const pvsDiscovered = !!currentPlan.status.conditions.find(c => {
          return c.type === PvsDiscoveredType;
        });

        if (pvsDiscovered) {
          if (this.state.isLoading) {
            this.setState(() => ({ isLoading: false }));
            this.props.onWizardLoadingToggle(false);
          }
        }
      }
    }
  }

  render() {
    const { errors, touched, setFieldValue, setFieldTouched, values, plans } = this.props;
    const StyledTextContent = styled(TextContent)`
      margin: 1em 0 1em 0;
    `;

    const currentPlan = plans.find(p => {
      return p.metadata.name === values.planName;
    });
    //TODO: added this component level error state to handle the case of no PVs
    // showing up after 3 checks of the interval. When the isPVError flag is checked,
    // the volumes form will show this error. Need to add redux actions & state to encapsulate
    // validation so that this error state enables the user to go to next page( that possibly
    // shows a different set of forms catered to stateless apps)

    if (this.props.isPVError) {
      return (
        <Box
          css={css`
            text-align: center;
          `}
        >
          <StyledTextContent>
            <Text color={theme.colors.statusRed} fontSize={[2, 3, 4]}>
              <StatusIcon status="failed" />
              Unable to find PVs
            </Text>
          </StyledTextContent>
        </Box>
      );
    }
    return (
      <React.Fragment>
        {this.state.isLoading ? (
          <Flex
            css={css`
              height: 100%;
              text-align: center;
            `}
          >
            <Box flex="1" m="auto">
              <Loader type="ThreeDots" color={theme.colors.navy} height="100" width="100" />
              <Text fontSize={[2, 3, 4]}>
                {' '}
                Discovering persistent volumes attached to source projects.
              </Text>
            </Box>
          </Flex>
        ) : (
          <Box>
            <StyledTextContent>
              <TextList component="dl">
                <TextListItem component="dt">
                  Choose to move or copy persistent volumes:
                </TextListItem>
              </TextList>
            </StyledTextContent>
            <VolumesTable setFieldValue={setFieldValue} values={values} currentPlan={currentPlan} />
          </Box>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    plans: state.plan.migPlanList.map(p => p.MigPlan),
    isPVError: state.plan.isPVError,
  };
};

export default connect(
  mapStateToProps,
  null
)(VolumesForm);
