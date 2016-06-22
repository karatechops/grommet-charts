import React, { Component } from 'react';
import Box from 'grommet/components/Box';
import Line from './Chart/Line';
import Axis from './Axis';

export default class VerticalLineChart extends Component {
  constructor() {
    super();

    this._onClick = this._onClick.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);

    this.state = {
      legend: {
        value: 0,
        axisValue: 0,
        units: ''
      }
    };
  }

  _onClick(event) {
    this.setState({
      legend: {
        value: event.target.getAttribute('data-value'),
        axisValue: event.target.getAttribute('data-axis-value'),
        units: event.target.getAttribute('data-units')
      }
    });
  }

  _onMouseOver(event) {
    this.setState({
      legend: {
        value: event.target.getAttribute('data-value'),
        axisValue: event.target.getAttribute('data-axis-value'),
        units: event.target.getAttribute('data-units')
      }
    });
  }

  render() {
    return (
      <div>
        <Box align="center" justify="center" direction="row">
          <Box align="center" justify="center" direction="column">
            <p>Millennials<br/>
              {this.state.legend.axisValue}<br/>
              {this.state.legend.value} {this.state.legend.units}</p>
          </Box>
          <Axis label = {[
              {position: 5, value: '15'},
              {position: 1, value: '35'}]}
              layout="vertical"
              height={192}
              width={50} />
          <Box direction="column">
            <Line series={[
              {
                label: "first",
                values: [2, 3, 2, 3, 1, 3, 4],
                units: "m",
                axisValues: [15, 16 , 17, 18, 19, 20, 21],
                colorIndex: "graph-3",
                axisValuesUnits: "years old"
              }]}
              points={false}
              orientation="vertical"
              size="large"
              onClick={this._onClick}
              onMouseOver={this._onMouseOver}
              a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />
          </Box>
        </Box>
      </div>
    );
  }
}
