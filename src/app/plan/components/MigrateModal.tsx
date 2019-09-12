/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Modal } from '@patternfly/react-core';
import { useState, useContext } from 'react';
import { Flex, Box, Text } from '@rebass/emotion';
import { Button, Checkbox } from '@patternfly/react-core';
import { css } from '@emotion/core';
import { PlanContext } from '../../home/duck/context';

interface IProps {
    onHandleClose: () => void;
    id?: string;
    isOpen: boolean;
    plan: any;
}

const MigrateModal: React.FunctionComponent<IProps> = ({ onHandleClose, isOpen, plan }) => {
    const [disableQuiesce, toggleQuiesce] = useState(false);
    const handleChange = (checked, _event) => {
        toggleQuiesce(!!checked);
    };
    const planContext = useContext(PlanContext);

    return (
        <Modal
            isSmall
            isOpen={isOpen}
            onClose={() => onHandleClose()}
            title={`Migrate ${plan.MigPlan.metadata.name}`}
        >
            <Flex>
                <form
                >
                    <Box>
                        Migrating a migration plan means that all transactions on the source cluster will be
                        halted before the migration begins and will remain halted for the duration of the
                        migration. Persistent volumes associated with the projects being migrated will be moved or
                        copied to the target cluster as specified in the migration plan.
                    </Box>
                    <Box
                        css={css`
                            margin-top: 20px;
                        `}
                    >
                        <Checkbox
                            label="Don't halt transactions on the source while migrating"
                            aria-label="don't halt transactions on the source while migrating"
                            id="transaction-halt-checkbox"
                            isChecked={disableQuiesce}
                            onChange={handleChange}
                        />
                    </Box>
                    <Box mt={20}>
                        <Flex>
                            <Box m="10px 10px 10px 0">
                                <Button variant="primary"
                                    onClick={() => {
                                        onHandleClose();
                                        planContext.handleRunMigration(plan, disableQuiesce);
                                    }
                                    }
                                >
                                    Migrate
                                </Button>
                            </Box>
                            <Box m={10}>
                                <Button
                                    key="cancel"
                                    variant="secondary"
                                    onClick={() => onHandleClose()}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Flex>
                    </Box>
                </form>
            </Flex>
        </Modal>
    );
};
export default MigrateModal;