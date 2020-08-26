import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  FormGroup,
  Button,
  Level,
  LevelItem,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import flexStyles from '@patternfly/react-styles/css/layouts/Flex/flex';
import SimpleSelect, {
  OptionWithValue,
  ISimpleSelectProps,
} from '../../../../../common/components/SimpleSelect';
import AddEditTokenModal from '../../../../../common/components/AddEditTokenModal';
import IconWithText from '../../../../../common/components/IconWithText';
import { IToken } from '../../../../../token/duck/types';
import { useOpenModal } from '../../../../duck/hooks';
import { getTokenInfo } from '../../../TokensPage/helpers';
import StatusIcon, { StatusType } from '../../../../../common/components/StatusIcon';
import { INameNamespaceRef } from '../../../../../common/duck/types';
import { FormikTouched, FormikErrors } from 'formik';
import { IReduxState } from '../../../../../../reducers';
import { isSameResource, validatedState } from '../../../../../common/helpers';
import { IMigMeta } from '../../../../../auth/duck/types';
import { TokenActions } from '../../../../../token/duck/actions';

const styles = require('./TokenSelect.module');

interface ITokenSelectProps extends ISimpleSelectProps {
  fieldId: string;
  tokenList: IToken[];
  clusterName: string;
  value: INameNamespaceRef;
  onChange: (tokenRef: INameNamespaceRef) => void;
  touched: FormikTouched<INameNamespaceRef>;
  error?: FormikErrors<INameNamespaceRef>;
  expiringSoonMessage: string;
  expiredMessage: string;
  migMeta: IMigMeta;
  isAddEditTokenModalOpen: boolean;
  toggleAddEditTokenModal: () => void;
  setAssociatedCluster: (clusterName: string) => void;
}

const getTokenOptionsForCluster = (
  tokenList: IToken[],
  clusterName: string,
  onAddTokenClick: () => void
): OptionWithValue<IToken>[] => {
  const empty: OptionWithValue<IToken> = {
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
      value: token,
      props: {
        children: (
          <Level>
            <LevelItem>{token.MigToken.metadata.name}</LevelItem>
            <LevelItem>
              {statusType !== StatusType.OK && (
                <StatusIcon status={statusType} className={spacing.mlSm} />
              )}
            </LevelItem>
          </Level>
        ),
      },
    };
  });
};

const getSelectedTokenOption = (
  selectedTokenRef: INameNamespaceRef,
  tokenOptions: OptionWithValue<IToken>[]
) => {
  if (!selectedTokenRef) return null;
  return tokenOptions.find((option) => {
    if (option.value) {
      return isSameResource(option.value.MigToken.metadata, selectedTokenRef);
    }
  });
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
  toggleAddEditTokenModal,
  isAddEditTokenModalOpen,
  setAssociatedCluster,
  ...props
}: ITokenSelectProps) => {
  const [tokenJustAddedRef, setTokenJustAddedRef] = useState<INameNamespaceRef>(null);

  const handleChange = (token: IToken) => {
    const { name, namespace } = token.MigToken.metadata;
    onChange({ name, namespace });
  };

  const onAddTokenClick = () => {
    setTokenJustAddedRef(null);
    toggleAddEditTokenModal();
    setAssociatedCluster(clusterName);
  };

  const tokenOptions = getTokenOptionsForCluster(tokenList, clusterName, onAddTokenClick);

  useEffect(() => {
    // If there's only one token available for the cluster, pre-select it.
    if (!value && tokenOptions.length === 1 && tokenOptions[0].value !== null) {
      handleChange(tokenOptions[0].value);
    }
  }, [tokenList, clusterName]);

  const selectedToken: IToken = value
    ? tokenList.find((token) => isSameResource(token.MigToken.metadata, value))
    : null;
  const selectedTokenInfo = selectedToken && getTokenInfo(selectedToken);

  const newToken: IToken =
    tokenJustAddedRef &&
    tokenList.find((token) => isSameResource(token.MigToken.metadata, tokenJustAddedRef));
  const isLoadingNewToken = !!tokenJustAddedRef && !newToken;

  useEffect(() => {
    if (newToken && !selectedToken) {
      if (newToken.MigToken.spec.migClusterRef.name === clusterName) {
        // The token we just created is in memory now and matches the selected cluster, so select it.
        handleChange(newToken);
      } else {
        // It's not associated with the selected cluster, so give up on selecting it.
        // Might be impossible? Prevents a forever-spinner if that changes.
        setTokenJustAddedRef(null);
      }
    }
  }, [newToken]);

  useEffect(() => {
    // Clear any messages about freshly created tokens if the cluster selection changes
    setTokenJustAddedRef(null);
  }, [clusterName]);

  return (
    <>
      <FormGroup
        className={spacing.mtMd}
        label="Authentication token"
        isRequired
        fieldId={fieldId}
        helperTextInvalid={touched && error}
      >
        <SimpleSelect
          onChange={(selection: OptionWithValue<IToken>) => {
            if (selection.value) {
              handleChange(selection.value);
              setTokenJustAddedRef(null);
            }
          }}
          options={tokenOptions}
          value={getSelectedTokenOption(value, tokenOptions)}
          placeholderText={
            isLoadingNewToken ? (
              <Flex className={`${spacing.mlSm} ${flexStyles.modifiers.alignItemsCenter}`}>
                <Spinner size="md" />
                <FlexItem>Adding token...</FlexItem>
              </Flex>
            ) : (
              'Select token...'
            )
          }
          isDisabled={!clusterName || isLoadingNewToken}
          {...props}
        />
        {isAddEditTokenModalOpen && (
          <AddEditTokenModal
            onClose={toggleAddEditTokenModal}
            onTokenAdded={setTokenJustAddedRef}
          />
        )}
      </FormGroup>
      {newToken && newToken === selectedToken && (
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

const mapStateToProps = (state: IReduxState): Partial<ITokenSelectProps> => ({
  tokenList: state.token.tokenList,
  isAddEditTokenModalOpen: state.token.isAddEditTokenModalOpen,
  migMeta: state.auth.migMeta,
});

const mapDispatchToProps = (dispatch) => ({
  toggleAddEditTokenModal: () => dispatch(TokenActions.toggleAddEditTokenModal()),
  setAssociatedCluster: (associatedCluster: string) =>
    dispatch(TokenActions.setAssociatedCluster(associatedCluster)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TokenSelect);
