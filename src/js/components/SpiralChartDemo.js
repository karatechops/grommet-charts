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
    this._onMouseLeave = this._onMouseLeave.bind(this);

    this.state = {
      chartLabel: {
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
        chartLabel: {
          visible: true,
          units: '%',
          value: value
        },
        activeIndex: index
      });
    }
  }

  _onMouseLeave() {
    this.setState({
      chartLabel: {
        visible: false,
        units: '%',
        value: this.state.chartLabel.value
      },
      activeIndex: null
    });
  }

  render() {
     // Will be converted to Inline chartLabel(?) component.
    let chartLabelTempRoot = 'charts-label';
    let chartLabelClasses = classnames([
      chartLabelTempRoot,
      {
        [`${chartLabelTempRoot}--active`]: this.state.chartLabel.visible
      }
    ]);

    let chartLabel = (
      <div className={chartLabelClasses} ref="chartLabel">
        <Heading strong={true} tag="h2">
          {this.state.chartLabel.value}<span className={`charts-label__unit`}>{this.state.chartLabel.units}</span>
        </Heading>
      </div>
    );

    return (
      <div className="chart-demo chart-demo-spiral">
        <Box direction="column" onMouseLeave={this._onMouseLeave}>
          <Meter type="spiral" series={[
            {"label": "Boomers", "value": seriesValues[0],
              "colorIndex": "graph-1"},
            {"label": "Gen X", "value": seriesValues[1],
              "colorIndex": "graph-2"},
            {"label": "Millennials", "value": seriesValues[2],
              "colorIndex": "graph-3"}
          ]} max={100} onIndexUpdate={this._onIndexUpdate} important={this.state.activeIndex}
          a11yTitleId="meter-title-17" a11yDescId="meter-desc-17" />
          {chartLabel}
        </Box>
      </div>
    );
  }
};
