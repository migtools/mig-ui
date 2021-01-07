import React, { useState } from 'react';
import { connect } from 'react-redux';
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
} from '@patternfly/react-core';
import AddCircleOIcon from '@patternfly/react-icons/dist/js/icons/add-circle-o-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useOpenModal } from '../../duck';
import { IMigMeta } from '../../../auth/duck/types';
import { IReduxState } from '../../../../reducers';
import { IMigHook } from '../../../../client/resources/conversions';
import { IMigPlan, IPlanSpecHook } from '../../../plan/duck/types';
import {
  AddEditMode,
  AddEditState,
  createAddEditStatus,
  IAddEditStatus,
} from '../../../common/add_edit_state';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
import { PlanActions, planSelectors } from '../../../plan/duck';
interface IHooksPageBaseProps {
  migMeta: IMigMeta;
  isFetchingInitialHooks: boolean;
  updateHookRequest: (values) => void;
  addHookRequest: (hook: IMigHook) => void;
  isFetchingHookList: boolean;
  migHookList: any;
  fetchHooksRequest: (hooks: IPlanSpecHook[]) => void;
  hookAddEditStatus: IAddEditStatus;
  currentPlan: IMigPlan;
  removeHookRequest: (hookName: string, stepName: string) => void;
  watchHookAddEditStatus: (name: string) => void;
}

const HooksPageBase: React.FunctionComponent<IHooksPageBaseProps> = ({
  updateHookRequest,
  addHookRequest,
  isFetchingHookList,
  migHookList,
  fetchHooksRequest,
  hookAddEditStatus,
  currentPlan,
  removeHookRequest,
  watchHookAddEditStatus,
  migMeta,
}: IHooksPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);
  const [initialHookValues, setInitialHookValues] = useState<Partial<IMigHook>>({});
  const [isAddHooksOpen, setIsAddHooksOpen] = useState(false);
  const columns = [
    { title: 'Name' },
    { title: 'Definition' },
    { title: 'Run in' },
    { title: 'Migration step' },
  ];

  let rows = [];
  let actions = [];
  if (migHookList.length > 0) {
    rows = migHookList.map((migHook, id) => {
      return {
        cells: [migHook.hookName, migHook.image, migHook.clusterTypeText, migHook.phase],
      };
    });
    actions = [
      {
        title: 'Edit',
        onClick: (event, rowId, rowData, extra) => {
          const currentHook = migHookList.find((hook) => hook.hookName === rowData.name.title);
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
      <Button onClick={toggleAddEditModal} variant="primary">
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
        {isFetchingHookList ? (
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
              {
                !migHookList ? null : migHookList.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <Table aria-label="hooks-table" cells={columns} rows={rows} actions={actions}>
                    <TableHeader />
                    <TableBody />
                  </Table>
                )

                // <HooksTable />
              }
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
    hookList: planSelectors.getHooks(state),
    isFetchingHookList: state.plan.isFetchingHookList,
    hookAddEditStatus: state.plan.hookAddEditStatus,
    migHookList: state.plan.migHookList,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addHookRequest: (migHook) => dispatch(PlanActions.addHookRequest(migHook)),
    fetchHooksRequest: (currentPlanHooks) =>
      dispatch(PlanActions.hookFetchRequest(currentPlanHooks)),
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
