import React, { Component } from 'react';
import Heading from 'grommet/components/Heading';
import Headline from 'grommet/components/Headline';
import Chart from './Chart';
import Axis from './Axis';

const CLASS_ROOT = 'first-digital-natives';

export default class FirstDigitalNatives extends Component {
  constructor(props) {
    super(props);

    this.state = {
      height: 0,
      width: 0,
      legendValue: ' '
    };

    this._onChartClick = this._onChartClick.bind(this);
    this._onLayoutChange = this._onLayoutChange.bind(this);
    this._onChartHover = this._onChartHover.bind(this);
    this._onValueChange = this._onValueChange.bind(this);
  }

  _onChartClick(value) {
    let clickValue = value.target.getAttribute('data-value');
    this.setState({
      legendValue: clickValue
    });
  }

  _onLayoutChange(width, height, bounds) {
    this.setState({
      height: height,
      width: width
    });
  }

  _onChartHover(value) {
    let clickValue = value.target.getAttribute('data-value');
    this.setState({
      legendValue: clickValue
    });
  }

  _onValueChange(value) {
    this.setState({
      legendValue: value
    });
  }

  render() {
    return (
      <div className={CLASS_ROOT}>
        <Heading strong={true} tag="h4">
          Which online activities do you regularly do for fun and entertainment?
        </Heading>
        <Headline size="small" strong={true}>
          Play video games
        </Headline>
        <div className="infographics-chart">
        <Axis label = {[
          {position: 5, value: '100'},
          {position: 3, value: '50'}]}
          layout="horizontal"
          height={50}
          width={this.state.width} />
        </div>
        <div className="infographics-chart">
          <Axis label = {[
            {position: 5, value: '100'},
            {position: 3, value: '50'}]}
            layout="vertical"
            height={this.state.height} />
          <div className="infographics-chart__container">
            <Chart series={[
              {
                label: "Play Video Games",
                values: [
                  {x:3, y:75, onClick:this._onChartClick, onHover:this._handleChartHover}, 
                  {x:2, y:50, onClick:this._onChartClick, onHover:this._handleChartHover}, 
                  {x:1, y:100, onClick:this._onChartClick, onHover:this._handleChartHover}
                ],
                colorIndex: "step"
              }
            ]}
            type="bar"
            a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc"
            dispatchValue={this._onValueChange}
            dispatchBounds={this._onLayoutChange} />
            <div className="infographics-legend">
              {this.state.legendValue} %
            </div>
          </div>
        </div>


      </div>
    );
  }
}
