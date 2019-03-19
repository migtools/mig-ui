import React, { Component } from 'react';
import './CardComponent.css';
import {
  Dropdown,
  KebabToggle,
  DropdownItem,
  DropdownSeparator,
} from '@patternfly/react-core';

class CardComponent extends Component<any, any> {
  state = {
    isOpen: false,
  };

  onToggle = isOpen => {
    this.setState({
      isOpen,
    });
  }

  onSelect = event => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  render() {
    const { dataList, title } = this.props;
    const { isOpen } = this.state;
    return (
      <div className="flex-item">
        <div className="header-bar">
          <Dropdown
            onSelect={this.onSelect}
            toggle={<KebabToggle onToggle={this.onToggle} />}
            isOpen={isOpen}
            isPlain
            dropdownItems={[]}
          />
        </div>
        <div className="card-content">
          <div className="title">
            {dataList.length} {title}
          </div>
          {/* {dataList.map((listItem, index) => (
        <div key={index}>{listItem.metadata.name}</div>
      ))} */}
        </div>
      </div>
    );
  }
}

export default CardComponent;
