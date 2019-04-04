import React from 'react';
import { Modal as ModalPf, ModalProps } from '@patternfly/react-core';

interface IProps extends ModalProps {
  trigger: React.ReactElement;
  children: React.ReactElement;
}

interface IState {
  isOpen: boolean;
}

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
    const { trigger, children, ...rest } = this.props;
    const triggerNew = React.cloneElement(
      trigger,
      {
        onClick: () => {
          this.handleOpen();
          if (trigger.props.onClick) {
            trigger.props.onClick();
          }
        },
      },
    );
    const childrenNew = React.cloneElement(
      children,
      {
        onHandleModalToggle: () => {
          this.handleClose();
        },
      },
    );
    return (
      <React.Fragment>
        {triggerNew}
        <ModalPf
          {...rest as any}
          isOpen={this.state.isOpen}
          onClose={this.handleClose}
        >
          {childrenNew}
        </ModalPf>
      </React.Fragment>
    );
  }
}

export default ModalWrapper;
