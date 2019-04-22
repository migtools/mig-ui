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
import theme from './../../../theme';
import FormErrorDiv from './../../common/components/FormErrorDiv';
interface IProps {
  component: React.ReactNode;
}
const PlanNameInput = styled(TextInput)`width: 20em !important;`;

const GeneralForm: React.SFC<IProps & RouteComponentProps> = ({
  handleChange,
  handleBlur,
  values,
  errors,
  touched,
  setFieldTouched,
  ...rest
}) => {

  const onHandleChange = (val, e) => {
    handleChange(e);
  };

  return (
    <React.Fragment>
      <Box>
        <TextContent>
          <TextList component="dl">
            <TextListItem component="dt">Plan Name</TextListItem>
            <PlanNameInput
              onChange={(val, e) => onHandleChange(val, e)}
              onInput={() => setFieldTouched('planName', true, true)}
              onBlur={handleBlur}
              value={values.planName}
              name="planName"
              type="text"
              isValid={!errors.planName && touched.planName}
              id="planName"
            />
          </TextList>
          {errors.planName && touched.planName && (
            <FormErrorDiv id="feedback">{errors.planName}</FormErrorDiv>
          )}
        </TextContent>
      </Box>
    </React.Fragment>
  );
};

export default GeneralForm;
