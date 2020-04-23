import React from 'react';

const styles = require('./CustomWarningProgress.module');

const CustomWarningProgress: React.FunctionComponent = () => {
  return (
    <div className="pf-c-progress pf-m-warning" id="progress-failure-example">
      <div className="pf-c-progress__description" id="progress-failure-example-description">
        Title
      </div>
      <div className="pf-c-progress__status" aria-hidden="true">
        <span className="pf-c-progress__measure">33%</span>
        <i
          className="fas fa-exclamation-triangle pf-c-progress__status-icon"
          aria-hidden="true"
        ></i>
      </div>
      <div
        className="pf-c-progress__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={33}
        aria-describedby="progress-failure-example-description"
      >
        <div className="pf-c-progress__indicator" style={{ width: '33%' }}></div>
      </div>
    </div>
  );
};

export default CustomWarningProgress;
