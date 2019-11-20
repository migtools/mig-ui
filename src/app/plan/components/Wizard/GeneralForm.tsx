import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  Form,
  FormGroup,
  Grid,
  GridItem,
  TextInput
} from '@patternfly/react-core';
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
  isEdit
}) => {
  const onHandleChange = (val, e) => {
    handleChange(e);
  };

  return (
    <Form>
      <Grid lg={10} xl={6}>
        <GridItem>
          <FormGroup
            label="Plan Name"
            isRequired
            fieldId="planName"
          >
            <TextInput
              onChange={(val, e) => onHandleChange(val, e)}
              onInput={() => setFieldTouched('planName', true, true)}
              onBlur={handleBlur}
              value={values.planName}
              name="planName"
              type="text"
              isValid={!errors.planName && touched.planName}
              id="planName"
              isDisabled={isEdit}
            />
          </FormGroup>
        </GridItem>
      </Grid>
    </Form>
  );
};

export default GeneralForm;
