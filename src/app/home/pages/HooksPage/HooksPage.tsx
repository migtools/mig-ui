import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  Card,
  PageSection,
  TextContent,
  Text,
  CardBody,
  EmptyState,
  EmptyStateIcon,
  Title,
  Button,
  Bullseye,
  Spinner,
  EmptyStateBody,
  Grid,
  GridItem,
  TextVariants,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';
import AddCircleOIcon from '@patternfly/react-icons/dist/js/icons/add-circle-o-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import planUtils from '../../../plan/duck/utils';
import { IMigMeta } from '../../../auth/duck/types';
import { IReduxState } from '../../../../reducers';
import { IMigPlan, IPlanSpecHook } from '../../../plan/duck/types';
import {
  AddEditMode,
  AddEditState,
  createAddEditStatus,
  IAddEditStatus,
} from '../../../common/add_edit_state';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import { PlanActions, planSelectors } from '../../../plan/duck';
import HooksFormContainer from '../PlansPage/components/Wizard/HooksFormContainer';
import { IMigHook } from './types';

const styles = require('./HooksPage.module');
const classNames = require('classnames');
const fallbackHookRunnerImage = 'quay.io/konveyor/hook-runner:latest';
interface IHooksPageBaseProps {
  migMeta: IMigMeta;
  isFetchingInitialHooks: boolean;
  updateHookRequest: (values) => void;
  addHookRequest: (hook: IMigHook) => void;
  isUpdatingGlobalHookList: boolean;
  allHooks: IMigHook[];
  fetchHooksRequest: (hooks: IPlanSpecHook[]) => void;
  hookAddEditStatus: IAddEditStatus;
  currentPlan: IMigPlan;
  removeHookRequest: (hookName: string, stepName: string) => void;
  watchHookAddEditStatus: (name: string) => void;
}

const HooksPageBase: React.FunctionComponent<IHooksPageBaseProps> = (
  props: IHooksPageBaseProps
) => {
  const {
    updateHookRequest,
    addHookRequest,
    isUpdatingGlobalHookList,
    allHooks,
    fetchHooksRequest,
    hookAddEditStatus,
    currentPlan,
    removeHookRequest,
    watchHookAddEditStatus,
    migMeta,
    isFetchingInitialHooks,
  } = props;

  const defaultHookRunnerImage = migMeta?.hookRunnerImage || fallbackHookRunnerImage;
  const [initialHookValues, setInitialHookValues] = useState({});
  const [isAddHooksOpen, setIsAddHooksOpen] = useState(false);

  const onAddEditHookSubmit = (hookValues) => {
    switch (hookAddEditStatus.mode) {
      case AddEditMode.Edit: {
        updateHookRequest(hookValues);
        setIsAddHooksOpen(false);
        break;
      }
      case AddEditMode.Add: {
        addHookRequest(hookValues);
        setIsAddHooksOpen(false);
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${hookAddEditStatus.mode}. Ignoring.`
        );
      }
    }
  };

  const columns = [
    { title: 'Name' },
    { title: 'Type' },
    { title: 'Definition' },
    { title: 'Plans' },
  ];
  const hooksFormContainerStyles = classNames(
    spacing.mySm,
    spacing.mx_0,
    spacing.pxSm,
    spacing.pySm
  );

  let rows = [];
  let actions = [];
  if (allHooks.length > 0) {
    rows = allHooks.map((migHook, id) => {
      const name = migHook.metadata.name;
      const { image, custom } = migHook.spec;
      const { associatedPlans, associatedPlanCount } = migHook.HookStatus;

      const type = custom ? 'Custom container image' : 'Ansible playbook';
      const listItems = associatedPlans.map((planName) => <Link to={`/plans/`}>{planName}</Link>);
      return {
        cells: [
          name,
          image,
          type,
          {
            title: (
              <>
                <Popover
                  position={PopoverPosition.top}
                  bodyContent={
                    <>
                      <ul>
                        {associatedPlanCount
                          ? listItems
                          : 'No plans are associated with this hook.'}
                      </ul>
                    </>
                  }
                  aria-label="associated-plans"
                  closeBtnAriaLabel="close--details"
                  maxWidth="4rem"
                  className={styles.planCountPopover}
                >
                  <a className={classNames('pf-c-icon', { 'pf-m-info': associatedPlanCount > 0 })}>
                    {associatedPlanCount}
                  </a>
                </Popover>
              </>
            ),
          },
        ],
      };
    });
    actions = [
      {
        title: 'Edit',
        onClick: (event, rowId, rowData, extra) => {
          const matchingHook: IMigHook = allHooks.find(
            (hook) => hook.metadata.name === rowData.name.title
          );
          const currentHook = planUtils.convertMigHookToUIObject(null, matchingHook);
          setInitialHookValues(currentHook);
          setIsAddHooksOpen(true);
          watchHookAddEditStatus(rowData.name.title);
        },
      },
      {
        title: 'Delete',
        onClick: (event, rowId, rowData, extra) => {
          removeHookRequest(rowData.name.title, rowData['migration-step'].title);
        },
      },
    ];
  }

  const renderEmptyState = () => (
    <EmptyState variant="full" className={spacing.my_2xl}>
      <EmptyStateIcon icon={AddCircleOIcon} />
      <Title headingLevel="h4" size="lg">
        No hooks
      </Title>
      <EmptyStateBody>
        Hooks are commands that can be run at various steps in the migration process. They are
        defined in a container image or within an Ansible playbook and can be run on either the
        source or target cluster. Hooks are added to a migration plan during plan creation.
      </EmptyStateBody>
      <Button
        key="add-hook"
        variant="primary"
        isDisabled={isAddHooksOpen}
        onClick={() => {
          setIsAddHooksOpen(true);
          setInitialHookValues({});
        }}
      >
        Create hook
      </Button>
    </EmptyState>
  );
  return (
    <>
      <PageSection variant="light">
        <TextContent>
          <Text component="h1" className={spacing.mbAuto}>
            Hooks
          </Text>
        </TextContent>
      </PageSection>
      <PageSection>
        {/* TODO: isFetchingInitialHooks */}
        {isUpdatingGlobalHookList || isFetchingInitialHooks ? (
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
              {!allHooks ? null : allHooks.length === 0 && !isAddHooksOpen ? (
                renderEmptyState()
              ) : (
                <Grid>
                  <GridItem className={spacing.mtSm}>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        Hooks are commands that can be run at various steps in the migration
                        process. They are defined in a container image or an Ansible playbook and
                        can be run on either the source or target cluster.
                      </Text>
                    </TextContent>
                  </GridItem>
                  {isAddHooksOpen && (
                    <GridItem className={hooksFormContainerStyles}>
                      <HooksFormContainer
                        defaultHookRunnerImage={defaultHookRunnerImage}
                        onAddEditHookSubmit={onAddEditHookSubmit}
                        initialHookValues={initialHookValues}
                        setInitialHookValues={setInitialHookValues}
                        setIsAddHooksOpen={setIsAddHooksOpen}
                        currentPlan={currentPlan}
                        {...props}
                      />
                    </GridItem>
                  )}
                  {!isAddHooksOpen && (
                    <React.Fragment>
                      {isUpdatingGlobalHookList ? (
                        <Bullseye>
                          <EmptyState variant="large">
                            <div className="pf-c-empty-state__icon">
                              <Spinner size="xl" />
                            </div>
                            <Title headingLevel="h2" size="xl">
                              Finding hooks for this migration plan...
                            </Title>
                          </EmptyState>
                        </Bullseye>
                      ) : (
                        <GridItem className={hooksFormContainerStyles}>
                          <Grid hasGutter>
                            <GridItem span={4}>
                              <Button
                                key="add-hook"
                                variant="secondary"
                                isDisabled={isAddHooksOpen}
                                onClick={() => {
                                  setIsAddHooksOpen(true);
                                  setInitialHookValues({});
                                }}
                              >
                                Add hook
                              </Button>
                            </GridItem>
                          </Grid>
                          <Table
                            aria-label="hooks-table"
                            cells={columns}
                            rows={rows}
                            actions={actions}
                          >
                            <TableHeader />
                            <TableBody />
                          </Table>
                        </GridItem>
                      )}
                    </React.Fragment>
                  )}
                </Grid>
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </>
  );
};

const mapStateToProps = (state: IReduxState) => {
  return {
    currentPlan: planSelectors.getCurrentPlanWithStatus(state),
    allHooks: planSelectors.getHooksWithStatus(state),
    isUpdatingGlobalHookList: state.plan.isUpdatingGlobalHookList,
    hookAddEditStatus: state.plan.hookAddEditStatus,
    isFetchingInitialHooks: state.plan.isFetchingInitialHooks,
    migMeta: state.auth.migMeta,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addHookRequest: (migHook) => dispatch(PlanActions.addHookRequest(migHook)),
    fetchPlanHooksRequest: () => dispatch(PlanActions.fetchPlanHooksRequest()),
    watchHookAddEditStatus: (hookName) => {
      // Push the add edit status into watching state, and start watching
      dispatch(
        PlanActions.setHookAddEditStatus(
          createAddEditStatus(AddEditState.Watching, AddEditMode.Edit)
        )
      );
      dispatch(PlanActions.watchHookAddEditStatus(hookName));
    },
    removeHookRequest: (name, migrationStep) =>
      dispatch(PlanActions.removeHookRequest(name, migrationStep)),
    updateHookRequest: (migHook) => dispatch(PlanActions.updateHookRequest(migHook)),
  };
};

export const HooksPage = connect(mapStateToProps, mapDispatchToProps)(HooksPageBase);
