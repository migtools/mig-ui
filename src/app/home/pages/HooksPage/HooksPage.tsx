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
} from '@patternfly/react-core';
import AddCircleOIcon from '@patternfly/react-icons/dist/js/icons/add-circle-o-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useOpenModal } from '../../duck';
import { IMigMeta } from '../../../auth/duck/types';
import { IReduxState } from '../../../../reducers';
import { IMigHook } from '../../../../client/resources/conversions';
import { IMigPlan, IPlanSpecHook } from '../../../plan/duck/types';
import { IAddEditStatus } from '../../../common/add_edit_state';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
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
  isAddHooksOpen: boolean;
  setIsAddHooksOpen: (val) => void;
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
  isAddHooksOpen,
  setIsAddHooksOpen,
  migMeta,
}: IHooksPageBaseProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);
  const [initialHookValues, setInitialHookValues] = useState<Partial<IMigHook>>({});
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
      <Title headingLevel="h3" size="lg">
        Add source and target Hooks for the migration
      </Title>
      <Button onClick={toggleAddEditModal} variant="primary">
        Add hook
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

const mapStateToProps = (state: IReduxState) => ({});

const mapDispatchToProps = (dispatch) => ({});

export const HooksPage = connect(mapStateToProps, mapDispatchToProps)(HooksPageBase);
