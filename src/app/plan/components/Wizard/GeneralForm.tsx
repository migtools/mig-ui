import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Box, Text } from '@rebass/emotion';
import {
  TextInput,
  TextContent,
  TextList,
  TextListItem,
  TextArea,
} from '@patternfly/react-core';
import FormErrorDiv from '../../../common/components/FormErrorDiv';
interface IProps {
  component: React.ReactNode;
}

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
            <TextInput
              style={{width: '20em'}}
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
