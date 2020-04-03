import React from 'react';
import {
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';
import { FormikProps } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import StorageClassTable from './StorageClassTable';

interface IStorageClassFormProps
  extends Pick<
    IOtherProps,
    | 'clusterList'
    | 'currentPlan'
    | 'isEdit'
    | 'isFetchingPVList'
    >,
    Pick<FormikProps<IFormValues>, 'setFieldValue' | 'values'> {}

const StorageClassForm: React.FunctionComponent<IStorageClassFormProps> = ({
   clusterList,
   currentPlan,
   isEdit,
   isFetchingPVList,
   setFieldValue,
   values,
}: IStorageClassFormProps) => { 
  return (
    <Grid gutter="md">
      <GridItem>
        <TextContent>
          <Text component={TextVariants.p}>
            Select storage class for copied PVs:
          </Text>
        </TextContent>
      </GridItem>
      <GridItem>
        <StorageClassTable
          isFetchingPVList={isFetchingPVList}
          setFieldValue={setFieldValue}
          values={values}
          currentPlan={currentPlan}
          clusterList={clusterList}
        />
      </GridItem>
    </Grid>
  );
};
export default StorageClassForm;
