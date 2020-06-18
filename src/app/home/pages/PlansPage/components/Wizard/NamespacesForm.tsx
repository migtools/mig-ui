import React, { useEffect } from 'react';
import { FormikProps } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import { Bullseye, EmptyState, Grid, GridItem, Title } from '@patternfly/react-core';
import NamespacesTable from './NamespacesTable';
import { Spinner } from '@patternfly/react-core';

interface INamespacesFormProps
  extends Pick<
      IOtherProps,
      'fetchNamespacesRequest' | 'isFetchingNamespaceList' | 'sourceClusterNamespaces'
    >,
    Pick<FormikProps<IFormValues>, 'setFieldValue' | 'values'> {}

const NamespacesForm: React.FunctionComponent<INamespacesFormProps> = ({
  fetchNamespacesRequest,
  isFetchingNamespaceList,
  sourceClusterNamespaces,
  setFieldValue,
  values,
}: INamespacesFormProps) => {
  useEffect(() => {
    fetchNamespacesRequest(values.sourceCluster);
  }, []);
  return (
    <Grid gutter="md">
      {isFetchingNamespaceList ? (
        <GridItem>
          <Bullseye>
            <EmptyState variant="small">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        </GridItem>
      ) : (
        <NamespacesTable
          setFieldValue={setFieldValue}
          values={values}
          sourceClusterNamespaces={sourceClusterNamespaces}
        />
      )}
    </Grid>
  );
};

export default NamespacesForm;
