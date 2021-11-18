import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import { Bullseye, EmptyState, Grid, GridItem, Title } from '@patternfly/react-core';
import { Spinner } from '@patternfly/react-core';
import { usePausedPollingEffect } from '../../../../../common/context';
import NamespacesTable from './NamespacesTable';
import { useDispatch, useSelector } from 'react-redux';
import { PlanActions } from '../../../../../plan/duck/actions';
import { DefaultRootState } from '../../../../../../configureStore';

const NamespacesForm: React.FunctionComponent = () => {
  const { isFetchingNamespaceList } = useSelector((state: DefaultRootState) => state.plan);
  usePausedPollingEffect();

  const { setFieldValue, values } = useFormikContext<IFormValues>();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(PlanActions.namespaceFetchRequest(values.sourceCluster));
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
        <NamespacesTable />
      )}
    </Grid>
  );
};

export default NamespacesForm;
