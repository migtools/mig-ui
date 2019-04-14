import React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { Flex, Box, Text } from '@rebass/emotion';
import {
  Button,
  TextInput,
  TextContent,
  TextList,
  TextListItem,
  TextArea,
} from '@patternfly/react-core';
import styled from '@emotion/styled';
interface IProps {
  component: React.ReactNode;
}
const PlanNameInput = styled.input`width: 20em;`;
const GeneralForm: React.SFC<IProps & RouteComponentProps> = ({
  handleChange,
  handleBlur,
  values,
  errors,
  touched,
  setFieldTouched,
  ...rest
}) => (
    <React.Fragment>
      <Box>
        <TextContent>
          <TextList component="dl">
            <TextListItem component="dt">Plan Name</TextListItem>
            <PlanNameInput
              onChange={handleChange}
              onInput={() => setFieldTouched('planName', true, true)}
              onBlur={handleBlur}
              value={values.planName}
              name="planName"
              type="text"
            />
            {errors.planName && touched.planName && (
              <div id="feedback">{errors.planName}</div>
            )}
          </TextList>
        </TextContent>
      </Box>
    </React.Fragment>
  );

export default GeneralForm;
