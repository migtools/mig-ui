import React, { useEffect, useState, useContext } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table';
import { Spinner } from '@patternfly/react-core/dist/esm/experimental';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants,
  Bullseye,
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  Title,
  Button,
  EmptyStateIcon,
  InputGroup,
  TextInput,
  Flex,
  FlexItem,
  FlexModifiers
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import {
  AddEditMode,
} from '../../../common/add_edit_state';
import HooksFormContainer from './HooksFormContainer';

const classNames = require('classnames');
const styles = require('./HooksStep.module')

const HooksStep = (props) => {
  const {
    updateHookRequest,
    addHookRequest,
    isFetchingHookList,
    migHookList,
    fetchHooksRequest,
    hookAddEditStatus,
    currentPlan,
    removeHookRequest,
    watchHookAddEditStatus
  } = props;

  const [isAddHooksOpen, setIsAddHooksOpen] = useState(false);
  const [initialHookValues, setInitialHookValues] = useState({});

  useEffect(() => {
    if (currentPlan) {
      fetchHooksRequest(currentPlan.spec.hooks);

    }
  }, []);

  const onAddEditHookSubmit = (hookValues) => {
    switch (hookAddEditStatus.mode) {
      case AddEditMode.Edit: {
        updateHookRequest(hookValues);
        break;
      }
      case AddEditMode.Add: {
        addHookRequest(hookValues);
        break;
      }
      default: {
        console.warn(
          `onAddEditSubmit, but unknown mode was found: ${hookAddEditStatus.mode}. Ignoring.`);
      }
    }
  };

  const columns = [
    { title: 'Name' },
    { title: 'Definition' },
    { title: 'Run in' },
    { title: 'Migration Step' },
  ];

  let rows = []
  let actions = [];
  if (migHookList.length > 0) {
    rows = migHookList.map((migHook, id) => {
      return {
        cells: [migHook.hookName, migHook.image, migHook.clusterType, migHook.phase],
      }
    });
    actions = [
      {
        title: 'edit',
        onClick: (event, rowId, rowData, extra) => {
          const currentHook = migHookList.find((hook) => hook.hookName === rowData.name.title)
          setInitialHookValues(currentHook)
          setIsAddHooksOpen(true)
          watchHookAddEditStatus(rowData.name.title);

        }
      },
      {
        title: 'delete',
        onClick: (event, rowId, rowData, extra) => {
          removeHookRequest(rowData.name.title, rowData["migration-step"].title)
        }
      }
    ]

  }
  if (rows.length === 0) {
    rows = [{
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.small}>
                <EmptyStateIcon icon={SearchIcon} />
                <Title headingLevel="h2" size="lg">
                  No results found
                </Title>
                <EmptyStateBody>
                  No hooks have been added to this migration plan
                </EmptyStateBody>
                <Button variant="link">Clear all filters</Button>
              </EmptyState>
            </Bullseye >
          )
        },
      ]
    }]
  }

  const hooksFormContainerStyles = classNames(spacing.mtSm, styles.formContainerStyles)
  return (
    <Grid>
      <GridItem className={spacing.mtSm}>
        <TextContent>
          <Text component={TextVariants.h1}>
            Hooks
          </Text>
        </TextContent>
      </GridItem>
      <GridItem className={spacing.mtSm}>
        <TextContent>
          <Text component={TextVariants.p}>
            Hooks are commands that can be run at various steps in the migration process. They are defined in a container image or an Ansible playbook and can be run on either the source or target cluster.
          </Text>
        </TextContent>
      </GridItem>
      {isAddHooksOpen &&
        <GridItem className={hooksFormContainerStyles}>
          <HooksFormContainer
            onAddEditHookSubmit={onAddEditHookSubmit}
            initialHookValues={initialHookValues}
            setInitialHookValues={setInitialHookValues}
            setIsAddHooksOpen={setIsAddHooksOpen}
            isAddHooksOpen={isAddHooksOpen}
            isEditHook={false}
            {...props} />
        </GridItem>
      }
      {(!isAddHooksOpen) &&
        <React.Fragment>
          {isFetchingHookList ?
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
            :
            <GridItem className={hooksFormContainerStyles}>
              <Grid gutter="md">
                <GridItem span={2}>
                  <InputGroup>
                    {/*
                          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
                    <TextInput name="textInput11" id="textInput11" type="search" aria-label="search input example" />
                    <Button variant="control" aria-label="search button for search input">
                      <SearchIcon />
                    </Button>
                  </InputGroup>
                </GridItem>
                <GridItem span={4}>
                  <Button
                    key="add-hook"
                    variant="secondary"
                    isDisabled={isAddHooksOpen}
                    onClick={() => {
                      setIsAddHooksOpen(true);
                      setInitialHookValues({});
                    }
                    }

                  >
                    Add Hook
                  </Button>
                </GridItem>
              </Grid>


              <Table
                className={styles.hooksTableStyles}
                aria-label="hooks-table"
                cells={columns}
                rows={rows}
                actions={actions}
              >
                <TableHeader />
                <TableBody />
              </Table>
            </GridItem>
          }

        </React.Fragment>
      }
    </Grid>
  );
};
export default HooksStep;

