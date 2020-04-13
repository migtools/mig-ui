import React from 'react';
import { FormikProps, FormikActions, FormikState } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
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

interface IGeneralFormProps
  extends Pick<
    IOtherProps, 'isEdit'
    >,
    Pick<FormikProps<IFormValues>, 
    | 'handleBlur'
    | 'handleChange'
    | 'setFieldTouched' 
    | 'values' 
    | 'touched'
    > 
    {
      errors: any;
    }

const GeneralForm: React.FunctionComponent<IGeneralFormProps> = ({
  errors,
  handleBlur,
  handleChange,
  isEdit,
  setFieldTouched,
  touched,
  values,
}: IGeneralFormProps) => {
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
            {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}

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
