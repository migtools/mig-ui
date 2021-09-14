import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  PageSection,
  CardBody,
  TextContent,
  Text,
  EmptyState,
  EmptyStateIcon,
  Title,
  Button,
  Bullseye,
  Spinner,
  EmptyStateVariant,
  EmptyStateBody,
} from '@patternfly/react-core';
import AddCircleOIcon from '@patternfly/react-icons/dist/js/icons/add-circle-o-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import planSelectors from '../../../plan/duck/selectors';
import clusterSelectors from '../../../cluster/duck/selectors';
import storageSelectors from '../../../storage/duck/selectors';
import { IPlanReducerState } from '../../../plan/duck';
import PlansTable from './components/PlansTable';
import { useOpenModal } from '../../duck';
import WizardContainer from './components/Wizard/WizardContainer';
import AddPlanDisabledTooltip from './components/AddPlanDisabledTooltip';
import { IAddPlanDisabledObjModel } from './types';
import { DefaultRootState } from '../../../../configureStore';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import GlobalPageHeader from '../../../common/components/GlobalPageHeader/GlobalPageHeader';

export const PlansPage: React.FunctionComponent = () => {
  const planList = useSelector((state: DefaultRootState) =>
    planSelectors.getPlansWithStatus(state)
  );
  const clusterList = useSelector((state: DefaultRootState) =>
    clusterSelectors.getAllClusters(state)
  );
  const storageList = useSelector((state: DefaultRootState) =>
    storageSelectors.getAllStorage(state)
  );
  const planState: IPlanReducerState = useSelector((state: DefaultRootState) => state.plan);

  const [isAddWizardOpen, toggleAddWizardOpen] = useOpenModal(false);

  const [addPlanDisabledObj, setAddPlanDisabledObj] = useState<IAddPlanDisabledObjModel>({
    isAddPlanDisabled: true,
    disabledText: '',
  });

  const renderErrorState = () => (
    <EmptyState variant={EmptyStateVariant.small}>
      <EmptyStateIcon icon={ExclamationTriangleIcon} />
      <Title headingLevel="h5" size="lg">
        Failed to fetch plans.
      </Title>
      <EmptyStateBody>Please try your request again.</EmptyStateBody>
    </EmptyState>
  );

  useEffect(() => {
    if (storageList.length < 1) {
      setAddPlanDisabledObj({
        isAddPlanDisabled: true,
        disabledText: 'A minimum of 1 replication repository is required to create a plan.',
      });
      return;
    } else {
      setAddPlanDisabledObj({
        isAddPlanDisabled: false,
        disabledText: 'Click to create a plan.',
      });
    }
  }, [clusterList, storageList]);

  return (
    <>
      <GlobalPageHeader title="Migration plans"></GlobalPageHeader>
      <PageSection>
        {planState.isFetchingInitialPlans && !planState.isError ? (
          <Bullseye>
            <EmptyState variant="large">
              <div className="pf-c-empty-state__icon">
                <Spinner size="xl" />
              </div>
              <Title headingLevel="h2" size="xl">
                Loading...
              </Title>
            </EmptyState>
          </Bullseye>
        ) : (
          <Card>
            <CardBody>
              {!planList ? null : planList.length === 0 ? (
                <EmptyState variant="full">
                  <EmptyStateIcon icon={AddCircleOIcon} />
                  <Title headingLevel="h3" size="lg" className={spacing.mbLg}>
                    No migration plans exist
                  </Title>
                  <AddPlanDisabledTooltip addPlanDisabledObj={addPlanDisabledObj}>
                    <div>
                      <Button
                        isDisabled={addPlanDisabledObj.isAddPlanDisabled}
                        onClick={toggleAddWizardOpen}
                        variant="primary"
                      >
                        Add migration plan
                      </Button>
                    </div>
                  </AddPlanDisabledTooltip>
                </EmptyState>
              ) : planState.isError ? (
                renderErrorState()
              ) : (
                <CardBody>
                  <PlansTable
                    planList={planList}
                    addPlanDisabledObj={addPlanDisabledObj}
                    toggleAddWizardOpen={toggleAddWizardOpen}
                  />
                </CardBody>
              )}
              <WizardContainer
                planList={planList}
                clusterList={clusterList}
                storageList={storageList}
                isEdit={false}
                isOpen={isAddWizardOpen}
                onHandleWizardModalClose={toggleAddWizardOpen}
              />
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};
