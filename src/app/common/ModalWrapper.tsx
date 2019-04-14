import React from 'react';
import { Modal as ModalPf, ModalProps } from '@patternfly/react-core';
import styled from '@emotion/styled';
import theme from '../../theme';
interface IProps {
  title: any;
  trigger: React.ReactElement;
  children?: any;
  form?: any;
  header?: any;
  onClose: () => void;
}

interface IState {
  isOpen: boolean;
}
const StyledHeader = styled.div`
height: 1px;
width: 75%;
margin: .5em 5em 2em 0;
background: ${theme.colors.lightGray3};
color: ${theme.colors.lightGray3};
`;
const StyledModal = styled(ModalPf)`
  .pf-c-modal-box__body{
    margin-top: 0 !important;
  }
  `;
class ModalWrapper extends React.Component<IProps, IState> {
  state = {
    isOpen: false,
  };

  handleOpen = () => {
    this.setState({ isOpen: true });
  }

  handleClose = () => {
    this.setState({ isOpen: false });
    if (this.props.trigger.props.onClose) {
      this.props.trigger.props.onClose();
    }
  }

  render() {
    const trigger = React.cloneElement(
      this.props.trigger,
      {
        onClick: () => {
          this.handleOpen();
          if (this.props.trigger.props.onClick) {
            this.props.trigger.props.onClick();
          }
        },
      },
    );
    const form = React.cloneElement(
      this.props.form,
      {
        onHandleModalToggle: () => {
          this.handleClose();
        },
      },
    );
    return (
      <React.Fragment>
        {trigger}
        <StyledModal
          {...this.props as any}
          isOpen={this.state.isOpen}
          onClose={this.handleClose}
        >
          <StyledHeader />
          {form}
        </StyledModal>
      </React.Fragment>
    );
  }
}

export default ModalWrapper;
