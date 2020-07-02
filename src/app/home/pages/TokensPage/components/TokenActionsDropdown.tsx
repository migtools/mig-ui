import React, { useState, useContext } from 'react';
import { Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import AddEditTokenModal from '../../../../common/components/AddEditTokenModal';
import ConfirmModal from '../../../../common/components/ConfirmModal';
import { useOpenModal } from '../../../duck';
// import { tokenContext } from '../../../duck/context';
import { ITokenInfo } from '../helpers';
import { IToken } from '../../../../token/duck/types';

interface ITokenActionsDropdownProps {
  token: IToken;
  removeToken: (tokenName: string) => void;
}

const TokenActionsDropdown: React.FunctionComponent<ITokenActionsDropdownProps> = ({
  token,
  removeToken,
}: ITokenActionsDropdownProps) => {
  const { name } = token.MigToken.metadata;

  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [isAddEditOpen, toggleIsAddEditOpen] = useOpenModal(false);
  const [isConfirmOpen, toggleConfirmOpen] = useOpenModal(false);

  const handleRemoveToken = (isConfirmed) => {
    if (isConfirmed) {
      removeToken(name);
      toggleConfirmOpen();
    } else {
      toggleConfirmOpen();
    }
  };

  // const tokenContext = useContext(tokenContext);

  // const edittoken = () => {
  //   tokenContext.watchtokenAddEditStatus(tokenName);
  //   toggleIsAddEditOpen();
  // };

  return (
    <>
      <Dropdown
        aria-label="Actions"
        toggle={<KebabToggle onToggle={() => setKebabIsOpen(!kebabIsOpen)} />}
        isOpen={kebabIsOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            onClick={() => {
              setKebabIsOpen(false);
              // editToken();
            }}
            isDisabled={true}
            key="editToken"
          >
            Edit
          </DropdownItem>,
          <DropdownItem
            onClick={() => {
              setKebabIsOpen(false);
              toggleConfirmOpen();
            }}
            key="removetoken"
          >
            Remove
          </DropdownItem>,
        ]}
        position={DropdownPosition.right}
      />
      {/* <AddEditTokenModal
        isOpen={isAddEditOpen}
        onHandleClose={toggleIsAddEditOpen}
        token={token}
        initialtokenValues={{
          name,
        }}
      /> */}
      <ConfirmModal
        title="Remove this token?"
        message={`Removing "${name}" will make it unavailable for migration plans`}
        isOpen={isConfirmOpen}
        onHandleClose={handleRemoveToken}
        id="confirm-token-removal"
      />
    </>
  );
};

export default TokenActionsDropdown;
