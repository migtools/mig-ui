import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import { Bullseye, EmptyState, Grid, GridItem, Title } from '@patternfly/react-core';
import { Spinner } from '@patternfly/react-core';
import { usePausedPollingEffect } from '../../../../../common/context';
import NamespacesTable from './NamespacesTable';

type INamespacesFormProps = Pick<
  IOtherProps,
  'fetchNamespacesRequest' | 'isFetchingNamespaceList' | 'sourceClusterNamespaces'
>;

const NamespacesForm: React.FunctionComponent<INamespacesFormProps> = ({
  fetchNamespacesRequest,
  isFetchingNamespaceList,
  sourceClusterNamespaces,
}: INamespacesFormProps) => {
  usePausedPollingEffect();

  const { setFieldValue, values } = useFormikContext<IFormValues>();

  useEffect(() => {
    fetchNamespacesRequest(values.sourceCluster);
  }, []);
  return (
    <Grid hasGutter>
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
        <NamespacesTable sourceClusterNamespaces={sourceClusterNamespaces} />
      )}
    </Grid>
  );
};

export default NamespacesForm;
