import React from 'react';
import { Flex, Box, Text } from '@rebass/emotion';
import {
  Button,
  Checkbox,
} from '@patternfly/react-core';

const MigrateModalForm = props => {
  return (
    <Flex>
      <form onSubmit={(e) => {
        e.preventDefault();
        props.onHandleModalToggle(null);
        props.handleSubmit();
      }}>
        <Box>
          Migrating a migration plan means that all transactions on the source cluster will be halted
          before the migration begins and will remain halted for the duration of the migration.
          Persistent volumes associated with the projects being migrated will be moved or copied
          to the target cluster as specified in the migration plan.
        </Box>
        <Box>
          <Checkbox
            label="Don't halt transactions on the source while migrating"
            aria-label="don't halt transactions on the source while migrating"
            id="transaction-halt-checkbox"
            />
        </Box>
        <Box mt={20}>
          <Flex>
            <Box m="10px 10px 10px 0">
              <Button
                key="cancel"
                variant="secondary"
                onClick={() => props.onHandleModalToggle(null)}
              >
                Cancel
              </Button>
            </Box>
            <Box m={10}>
              <Button variant="secondary" type="submit">
                Migrate
              </Button>
            </Box>
          </Flex>
        </Box>
      </form>
    </Flex>
  );
};

export default MigrateModalForm;
