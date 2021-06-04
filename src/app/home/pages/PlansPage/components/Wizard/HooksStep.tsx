import React, { useEffect, useState, useContext } from 'react';
import { cellWidth, Table, TableBody, TableHeader, truncate } from '@patternfly/react-table';
import { Spinner } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { connect } from 'react-redux';

import {
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants,
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  Title,
  Button,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { AddEditMode, IAddEditStatus } from '../../../../../common/add_edit_state';
import HooksFormContainer from './HooksFormContainer';
import { IMigMeta } from '../../../../../auth/duck/types';
import { IMigPlan } from '../../../../../plan/duck/types';
import { IMigHook } from '../../../HooksPage/types';
import { IHook } from '../../../../../../client/resources/conversions';
import { usePausedPollingEffect } from '../../../../../common/context';
import { DefaultRootState } from '../../../../../../configureStore';

const classNames = require('classnames');

const fallbackHookRunnerImage = 'quay.io/konveyor/hook-runner:latest';
interface IHooksStepBaseProps {
  migMeta: IMigMeta;
  updateHookRequest: (values) => void;
  addHookRequest: (hook: IMigHook | IHook) => void;
  isFetchingHookList: boolean;
  isUpdatingGlobalHookList: boolean;
  isAssociatingHookToPlan: boolean;
  fetchPlanHooksRequest: () => void;
  hookAddEditStatus: IAddEditStatus;
  currentPlan: IMigPlan;
  removeHookFromPlanRequest: (hookName: string, stepName: string) => void;
  watchHookAddEditStatus: (name: string) => void;
  isAddHooksOpen: boolean;
  setIsAddHooksOpen: (val) => void;
  currentPlanHooks: any[];
  allHooks: IMigHook[];
  associateHookToPlan: (hookValues, migHook) => void;
}

const HooksStep: React.FunctionComponent<IHooksStepBaseProps> = (props) => {
  usePausedPollingEffect();

  const {
    updateHookRequest,
    addHookRequest,
    isFetchingHookList,
    isUpdatingGlobalHookList,
    isAssociatingHookToPlan,
    currentPlanHooks,
    hookAddEditStatus,
    removeHookFromPlanRequest,
    watchHookAddEditStatus,
    isAddHooksOpen,
    setIsAddHooksOpen,
    migMeta,
    allHooks,
    associateHookToPlan,
  } = props;

  const defaultHookRunnerImage = migMeta.hookRunnerImage || fallbackHookRunnerImage;
  const [initialHookValues, setInitialHookValues] = useState({});
  const [selectedExistingHook, setSelectedExistingHook] = useState(null);
  const [isCreateHookSelected, setIsCreateHookSelected] = useState(false);

  const onAddEditHookSubmit = (hookValues, isExistingHook) => {
    switch (hookAddEditStatus.mode) {
      case AddEditMode.Edit: {
        updateHookRequest(hookValues);
        setIsAddHooksOpen(false);
        break;
      }
      case AddEditMode.Add: {
        if (selectedExistingHook) {
          associateHookToPlan(hookValues, selectedExistingHook);
          setIsAddHooksOpen(false);
          //only associate to plan, dont create new hook
          break;
        } else {
          addHookRequest(hookValues);
          setIsAddHooksOpen(false);
          break;
        }
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${hookAddEditStatus.mode}. Ignoring.`
        );
      }
    }
  };

  const columns = [
    { title: 'Name', transforms: [cellWidth(15)], cellTransforms: [truncate] },
    {
      title: 'Image',
      transforms: [cellWidth(20)],
      cellTransforms: [truncate],
    },
    { title: 'Destination' },
    { title: 'Type' },
    { title: 'Migration step' },
  ];

  let rows = [];
  let actions = [];
  if (currentPlanHooks.length > 0) {
    rows = currentPlanHooks.map((migHook, id) => {
      const type = migHook.custom ? 'Custom container image' : 'Ansible playbook';

      return {
        cells: [migHook.hookName, migHook.image, migHook.clusterTypeText, type, migHook.phase],
      };
    });
    actions = [
      {
        title: 'Edit',
        onClick: (event, rowId, rowData, extra) => {
          const currentHook = currentPlanHooks.find((hook) => hook.hookName === rowData.name.title);
          setInitialHookValues(currentHook);
          setIsAddHooksOpen(true);
          watchHookAddEditStatus(rowData.name.title);
        },
      },
      {
        title: 'Delete',
        onClick: (event, rowId, rowData, extra) => {
          removeHookFromPlanRequest(rowData.name.title, rowData['migration-step'].title);
        },
      },
    ];
  }
  if (rows.length === 0) {
    rows = [
      {
        heightAuto: true,
        cells: [
          {
            props: { colSpan: 8 },
            title: (
              <Bullseye>
                <EmptyState variant={EmptyStateVariant.full}>
                  <EmptyStateIcon icon={PlusCircleIcon} />
                  <Title headingLevel="h4" size="lg">
                    No hooks have been added to this migration plan.
                  </Title>
                </EmptyState>
              </Bullseye>
            ),
          },
        ],
      },
    ];
  }

  const hooksFormContainerStyles = classNames(
    spacing.mySm,
    spacing.mx_0,
    spacing.pxSm,
    spacing.pySm
  );
  return (
    <Grid>
      <GridItem className={spacing.mtSm}>
        <TextContent>
          <Text component={TextVariants.p}>
            Hooks are commands that can be run at various steps in the migration process. They are
            defined in a container image or an Ansible playbook and can be run on either the source
            or target cluster.
          </Text>
        </TextContent>
      </GridItem>
      {!isAddHooksOpen ? (
        <React.Fragment>
          {isFetchingHookList || isUpdatingGlobalHookList || isAssociatingHookToPlan ? (
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
              <Table aria-label="hooks-table" cells={columns} rows={rows} actions={actions}>
                <TableHeader />
                <TableBody />
              </Table>
            </GridItem>
          )}
        </React.Fragment>
      ) : (
        <GridItem className={hooksFormContainerStyles}>
          <HooksFormContainer
            defaultHookRunnerImage={defaultHookRunnerImage}
            onAddEditHookSubmit={onAddEditHookSubmit}
            initialHookValues={initialHookValues}
            setInitialHookValues={setInitialHookValues}
            setIsAddHooksOpen={setIsAddHooksOpen}
            isAddHooksOpen={isAddHooksOpen}
            allHooks={allHooks}
            currentPlanHooks={currentPlanHooks}
            selectedExistingHook={selectedExistingHook}
            setSelectedExistingHook={setSelectedExistingHook}
            isCreateHookSelected={isCreateHookSelected}
            setIsCreateHookSelected={setIsCreateHookSelected}
            {...props}
          />
        </GridItem>
      )}
    </Grid>
  );
};

export default connect((state: DefaultRootState) => ({
  migMeta: state.auth.migMeta,
}))(HooksStep);
