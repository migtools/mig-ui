import React, { useState, useEffect } from 'react';
import { FormGroup, Button, Level, LevelItem, Flex, FlexItem } from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import flexStyles from '@patternfly/react-styles/css/layouts/Flex/flex';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import AddEditTokenModal from '../../../../../common/components/AddEditTokenModal';
import IconWithText from '../../../../../common/components/IconWithText';
import { IToken } from '../../../../../token/duck/types';
import { useOpenModal } from '../../../../duck/hooks';
import { getTokenInfo } from '../../../TokensPage/helpers';
import StatusIcon, { StatusType } from '../../../../../common/components/StatusIcon';
const styles = require('./TokenSelect.module');

interface ITokenSelectProps {
  fieldId: string;
  tokenList: IToken[];
  clusterName: string;
  value: string;
  onChange: (tokenName: string) => void;
  touched: boolean;
  error?: string;
  expiringSoonMessage: string;
  expiredMessage: string;
}

const getTokenOptionsForCluster = (
  tokenList: IToken[],
  clusterName: string,
  onAddTokenClick: () => void
): OptionWithValue[] => {
  const empty: OptionWithValue = {
    toString: () => 'No tokens found for the selected cluster',
    value: null,
    props: {
      component: 'span',
      isDisabled: true,
      children: (
        <>
          <span>No tokens found for the selected cluster.</span>
          <Button
            variant="link"
            isInline
            className={`${styles.addTokenOptionLink} ${spacing.mtSm} ${spacing.mbSm}`}
            onClick={onAddTokenClick}
          >
            Add token
          </Button>
        </>
      ),
    },
  };
  if (!clusterName || !tokenList) return [empty];
  const availableTokens = tokenList.filter(
    (token) => token.MigToken.spec.migClusterRef.name === clusterName
  );
  if (availableTokens.length === 0) return [empty];
  return availableTokens.map((token) => {
    const { statusType } = getTokenInfo(token);
    return {
      toString: () => token.MigToken.metadata.name,
      value: token.MigToken.metadata.name,
      props: {
        children: (
          <Level>
            <LevelItem>{token.MigToken.metadata.name}</LevelItem>
            <LevelItem>
              <StatusIcon status={statusType} className={spacing.mlSm} />
            </LevelItem>
          </Level>
        ),
      },
    };
  });
};

const getSelectedTokenOption = (tokenName: string, tokenOptions: OptionWithValue[]) => {
  if (!tokenName) return null;
  return tokenOptions.find((option) => option.value === tokenName);
};

const TokenSelect: React.FunctionComponent<ITokenSelectProps> = ({
  fieldId,
  tokenList,
  clusterName,
  value,
  onChange,
  touched,
  error,
  expiringSoonMessage,
  expiredMessage,
}: ITokenSelectProps) => {
  const [isAddEditModalOpen, toggleAddEditModal] = useOpenModal(false);
  const [tokenJustCreated, setTokenJustCreated] = useState(false);

  useEffect(() => {
    // Clear token messages if the cluster selection changes
    setTokenJustCreated(false);
  }, [clusterName]);

  const onSelectionChange = (selection: OptionWithValue) => {
    if (selection.value) {
      onChange(selection.value);
      setTokenJustCreated(false);
    }
  };

  const onAddTokenClick = () => {
    setTokenJustCreated(false);
    toggleAddEditModal();
  };

  const onTokenCreated = (tokenName: string) => {
    onChange(tokenName);
    setTokenJustCreated(true);
  };

  const tokenOptions = getTokenOptionsForCluster(tokenList, clusterName, onAddTokenClick);
  const selectedToken = value
    ? tokenList.find((token) => token.MigToken.metadata.name === value)
    : null;
  const selectedTokenInfo = selectedToken && getTokenInfo(selectedToken);

  return (
    <>
      <FormGroup
        className={spacing.mtMd}
        label="Authentication token"
        isRequired
        fieldId={fieldId}
        helperTextInvalid={touched && error}
        isValid={!(touched && error)}
      >
        <SimpleSelect
          id={fieldId}
          onChange={onSelectionChange}
          options={tokenOptions}
          value={getSelectedTokenOption(value, tokenOptions)}
          placeholderText="Select token..."
          isDisabled={!clusterName}
        />
        <AddEditTokenModal
          isOpen={isAddEditModalOpen}
          onClose={toggleAddEditModal}
          onTokenCreated={onTokenCreated}
        />
      </FormGroup>
      {tokenJustCreated && value && (
        <div className={spacing.mSm}>
          <IconWithText
            icon={
              <span className="pf-c-icon pf-m-success">
                <CheckIcon />
              </span>
            }
            text="Token associated"
          />
        </div>
      )}
      {selectedTokenInfo && selectedTokenInfo.statusType === StatusType.WARNING && (
        <Flex className={`${spacing.mSm} ${flexStyles.modifiers.alignItemsCenter}`}>
          <FlexItem>
            <StatusIcon status={StatusType.WARNING} />
          </FlexItem>
          <FlexItem>
            {expiringSoonMessage}
            <br />
            <Button variant="link" isInline onClick={() => alert('NATODO: not yet implemented')}>
              Regenerate
            </Button>
          </FlexItem>
        </Flex>
      )}
      {selectedTokenInfo && selectedTokenInfo.statusType === StatusType.ERROR && (
        <Flex className={`${spacing.mSm} ${flexStyles.modifiers.alignItemsCenter}`}>
          <FlexItem>
            <StatusIcon status={StatusType.ERROR} />
          </FlexItem>
          <FlexItem>
            {expiredMessage}
            <br />
            <Button variant="link" isInline onClick={() => alert('NATODO: not yet implemented')}>
              Regenerate
            </Button>
          </FlexItem>
        </Flex>
      )}
    </>
  );
};

export default TokenSelect;
