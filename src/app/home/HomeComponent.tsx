import React from "react";
import "./HomeComponent.css";
class HomeComponent extends React.Component<any, any> {
  render() {
    return (
      <div className="home-container">
        <div className="flex-item">
          <div className="title">Namespaces</div>
        </div>
        <div className="flex-item">
          <div className="title">Migration Plans</div>
        </div>
        <div className="flex-item">
          <div className="title">Replication Repositories</div>
        </div>
      </div>
    );
  }
}

export default HomeComponent;
