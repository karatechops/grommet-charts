import React, { Component } from 'react';
import classnames from 'classnames';
import Meter from './Meter';
import Heading from 'grommet/components/Heading';
import Box from 'grommet/components/Box';

const seriesValues = [25, 50, 75];

export default class SpiralChartDemo extends Component {
  constructor() {
    super();

    this._onIndexUpdate = this._onIndexUpdate.bind(this);
    this.state = {
      legend: {
        visible: false,
        units: '%',
        value: 0
      },
      activeIndex: null
    };
  }

  _onIndexUpdate(index) {
    let value = seriesValues[index];

    if (index !== null) {
      this.setState({
        legend: {
          visible: true,
          units: '%',
          value: value
        },
        activeIndex: index
      });
    } /*else if (index === null) {
      this.setState({
        legend: {
          visible: false,
          units: '%',
          value: this.state.legend.value
        },
        activeIndex: null
      });
    }*/
  }

  render() {
     // Will be converted to Inline Legend(?) component.
    let legendTempRoot = 'infographic-legend';
    let legendClasses = classnames([
      legendTempRoot,
      {
        [`${legendTempRoot}--active`]: this.state.legend.visible
      }
    ]);

    let legend = (
      <div className={legendClasses} ref="legend">
        <Heading strong={true} tag="h2">
          {this.state.legend.value}<span className={`infographic-legend__unit`}>{this.state.legend.units}</span>
        </Heading>
      </div>
    );

    return (
      <div className="chart-demo chart-demo-spiral">
        <Box direction="column">
          <Meter type="spiral" series={[
            {"label": "Boomers", "value": seriesValues[0], 
              "colorIndex": "graph-1"},
            {"label": "Gen X", "value": seriesValues[1], 
              "colorIndex": "graph-2"},
            {"label": "Millennials", "value": seriesValues[2], 
              "colorIndex": "graph-3"}
          ]} max={100} onIndexUpdate={this._onIndexUpdate} important={this.state.activeIndex}
          a11yTitleId="meter-title-17" a11yDescId="meter-desc-17" />
          {legend}
        </Box>
      </div>
    );
  }
};
