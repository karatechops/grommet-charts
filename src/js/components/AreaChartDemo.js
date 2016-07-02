import React, { Component, PropTypes } from 'react';

import classnames from 'classnames';

import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import Chart from './chart/Chart';
import Summary from './chart/Summary';
import Axis from './chart/Axis';

export default class AreaChartDemo extends Component {
  constructor(props) {
    super(props);

    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);
    this._onIndexUpdate = this._onIndexUpdate.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onChartResize = this._onChartResize.bind(this);

    window.addEventListener('resize', this._onWindowResize);
    this.state = {
      chartLabel: {
        activeIndex: null,
        value: '0',
        axisValue: '0',
        units: ' ',
        axisUnits: ' ',
        top: 0,
        left: 0,
        visible: false
      },
      chart: {
        height: 0,
        width: 0
      },
      layout: this._mobileRespond(window.innerWidth)
    };
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onWindowResize);
  }

  _onMouseOver(event) {
    if (!this.state.chartLabel.visible)
      this.setState({
        chartLabel: {
          ...this.state.chartLabel,
          visible: true
        }
      });
  }

  _onMouseOut(event) {
    this.setState({
      chartLabel: {
        activeIndex: null,
        value: this.state.chartLabel.value,
        axisValue: this.state.chartLabel.axisValue,
        units: this.state.chartLabel.units,
        axisUnits: this.state.chartLabel.axisUnits,
        top: this.state.chartLabel.top,
        visible: false
      }
    });
  }

  _onIndexUpdate(index) {
    if (this.state.chartLabel.visible) {
      let values = {
        activeIndex: index,
        value: this.props.series[0].values[index],
        axisValue: this.props.series[0].axisValues[index],
        units: this.props.series[0].units,
        axisUnits: this.props.series[0].axisValuesUnits
      };

      this._updateLabelPos(index, values);
    }
  }

  _onWindowResize() {
    this.setState({ layout:this._mobileRespond(window.innerWidth) });
  }

  _onChartResize(width, height, bounds) {
    this.setState({
      chart: {
        height: height,
        width: width
      }
    });
  }

  _updateLabelPos(index, values) {
    let chart = this.refs.chartComponent.refs.chart;
    let chartRect =  chart.getBoundingClientRect();
    let valuesLength = this.props.series[0].values.length - 1;

    let top = (this.state.layout === 'horizontal') 
      ? chartRect.height + 40 // add Axis height.
      : Math.round(index * (chartRect.height / valuesLength)) + 1;

    let left = (this.state.layout === 'horizontal')
      ? 0
      : 0;

    // Demo purposes, adjust for dynamic placement.
    let labelRect = this.refs.chartLabel.getBoundingClientRect();

    if (index >= 10 && this.state.layout === 'vertical') 
      top = Math.round(index * (chartRect.height / valuesLength)) - (labelRect.height + 2);

    this.setState({
      chartLabel: {
        top: top,
        left: left,
        visible: true,
        ...values
      }
    });
  }

  _mobileRespond(windowWidth) {
    return (windowWidth >= 720) 
    ? 'horizontal'
    : 'vertical';
  }

  render() {
    // Will be converted to Inline Label(?) component.
    let chartLabelTempRoot = 'charts-label';
    let chartLabelClasses = classnames([
      chartLabelTempRoot,
      `${chartLabelTempRoot}--${this.state.layout}`,
      `${chartLabelTempRoot}--inline`,
      {
        [`${chartLabelTempRoot}--active`]: this.state.chartLabel.visible
      }
    ]);
    let chartLabelStyle = {
      top: this.state.chartLabel.top
    };

    let chartLabel = (
      <div style={chartLabelStyle} className={chartLabelClasses} ref="chartLabel">
        <Heading strong={true} tag="h5">
          {this.state.chartLabel.axisValue} {this.state.chartLabel.axisUnits}
        </Heading>
        <Heading strong={true} tag="h2">
          {this.state.chartLabel.value}
          <span className={`charts-label__unit`}>{this.state.chartLabel.units}</span>
        </Heading>
      </div>
    );

    let mobileSummary = (this.state.layout === 'horizontal')
      ? null
      : (
          <Box className="summary__mobile-container" align="center" justify="center" direction="row" pad="small">
            <Summary value={this.props.series[0].values} units="M" 
              title={this.props.series[0].label} />
          </Box>
        );

    let desktopSummary = (this.state.layout === 'horizontal') 
      ? (
        <Summary value={this.props.series[0].values} units="M" title={this.props.series[0].label}
            visible={!this.state.chartLabel.visible}/>
      ) : null;

    let axis = (
      <Axis label = {this.props.axis.label}
        layout={this.state.layout}
        textPadding={30}
        align='top'
        distance={(this.state.layout === 'horizontal') 
        ? this.state.chart.width : this.state.chart.height}
        count={7} />
    );

    return (
      <div className="chart-demo chart-demo-multi-area">
        {mobileSummary}
          <Box direction="column" responsive={false}>
            <div className="chart-demo__container" style={{position:'relative'}}>
              <div style={{position:'relative'}}>
                {chartLabel}
                <Chart series={this.props.series}
                  orientation={this.state.layout}
                  onMouseOver={this._onMouseOver}
                  onMouseOut={this._onMouseOut}
                  onResize={this._onChartResize}
                  onIndexUpdate={this._onIndexUpdate}
                  min={2.5} type="area" ref="chartComponent"
                  a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />
              </div>
              {axis}
          </div>
          {desktopSummary}
        </Box>
      </div>
    );
  }
}

AreaChartDemo.PropTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      colorIndex: PropTypes.string,
      onClick: PropTypes.func,
      label: PropTypes.string,
      units: PropTypes.string,
      values: PropTypes.arrayOf(
        PropTypes.number
      ).isRequired,
      axisValues: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      )
    })
  ).isRequired,
  axis: PropTypes.shape({
    label: PropTypes.arrayOf(
      PropTypes.shape({
        position: PropTypes.number,
        value: PropTypes.string
      })
    ),
    count: PropTypes.number
  })
};
