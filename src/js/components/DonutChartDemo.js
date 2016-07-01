import React, { Component } from 'react';
import Responsive from 'grommet/utils/Responsive';

import Meter from './Meter';

export default class DonutChartDemo extends Component {
  constructor() {
    super();
    this._onResponsive = this._onResponsive.bind(this);

    this.state = {
      layout: 'large'
    };
  }

  componentDidMount() {
    this._responsive = Responsive.start(this._onResponsive);
  }

  componentWillUnmount() {
    this._responsive.stop();
  }

  _onResponsive (small) {
    this.setState({
      layout: (small) ? 'medium' : 'large'
    });
  }

  render() {
    return (
      <div className="chart-demo chart-demo-donut">
        <Meter value={40} type="circle" size={this.state.layout} colorIndex="graph-2"
          units="%" a11yTitleId="meter-title-25" a11yDescId="meter-desc-25" />
      </div>
    );
  }
};
