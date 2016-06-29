import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import Line from './Chart/Line';
import Axis from './Chart/Axis';

export default class LineChartDemo extends Component {
  constructor(props) {
    super(props);

    this._onClick = this._onClick.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onChartResize = this._onChartResize.bind(this);

    window.addEventListener('resize', this._onWindowResize);
    this.state = {
      chartLabel: {
        value: '0',
        axisValue: '0',
        units: '',
        axisUnits: '',
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

  _onClick(event) {
    let target = event.target;
    let targetNodeRect = ReactDOM.findDOMNode(target).getBoundingClientRect();
    this._updateChartLabel(event, targetNodeRect);
  }

  _onMouseOver(event) {
    let target = event.target;
    let targetNodeRect = ReactDOM.findDOMNode(target).getBoundingClientRect();
    this._updateChartLabel(target, targetNodeRect);
  }

  _onMouseOut(event) {
    this.setState({
      chartLabel: {
        value: this.state.chartLabel.value,
        axisValue: this.state.chartLabel.axisValue,
        units: this.state.chartLabel.units,
        axisUnits: this.state.chartLabel.axisUnits,
        top: this.state.chartLabel.top,
        left: this.state.chartLabel.left,
        visible: false
      }
    });
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

  _updateChartLabel(target, targetRect) {
    let chartLabelRect = this.refs.chartLabel.getBoundingClientRect();

    let top = (this.state.layout === 'horizontal') 
      ? targetRect.height - chartLabelRect.height // add Axis height.
      : Number(target.getAttribute('y')) + (targetRect.height / 2) + 1;

    let left = (this.state.layout === 'horizontal') 
      ? Number(target.getAttribute('x')) + 1 + (targetRect.width / 2)
      : 0;

    // Demo purposes, adjust for dynamic placement.
    if (target.getAttribute('data-index') >= 10 && this.state.layout === 'vertical') 
      top = Number(target.getAttribute('y')) - (chartLabelRect.height - 6);

    if (target.getAttribute('data-index') >= 10 && this.state.layout === 'horizontal') 
      left = Number(target.getAttribute('x') - 2); // Subtract line width of cursor.

    if (target.getAttribute('data-index') == 0) left = 2;
    
    this.setState({
      chartLabel: {
        value: target.getAttribute('data-value'),
        axisValue: target.getAttribute('data-axis-value'),
        units: target.getAttribute('data-units'),
        axisUnits: target.getAttribute('data-axis-units'),
        top: top,
        left: left,
        visible: true
      }
    });
  }

  _mobileRespond(windowWidth) {
    return (windowWidth >= 720) 
    ? 'horizontal'
    : 'vertical';
  }

  render() {
    // Will be converted to Inline chartLabel(?) component.
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
      top: this.state.chartLabel.top,
      left: this.state.chartLabel.left
    };

    let chartLabel = (
      <div style={chartLabelStyle} className={chartLabelClasses} ref="chartLabel">
        <Heading strong={true} tag="h5">
          {this.state.chartLabel.axisValue} {this.state.chartLabel.axisUnits}
        </Heading>
        <Heading strong={true} tag="h2">
          {this.state.chartLabel.value}<span className={`charts-label__unit`}>{this.state.chartLabel.units}</span>
        </Heading>
      </div>
    );

    let axis = (
      <Axis label = {this.props.axis.label}
        layout={this.state.layout}
        textPadding={45}
        align='top'
        distance={(this.state.layout === 'horizontal') 
        ? this.state.chart.width : this.state.chart.height}
        count={this.props.axis.count} />
    );

    return (
      <div className="chart-demo chart-demo-line">
          <Box direction="column">
            <div className="chart-demo__container">
              <div style={{position:'relative', width:'100%'}}>
                <Line series={this.props.series}
                  orientation={this.state.layout}
                  onClick={this._onClick}
                  onMouseOver={this._onMouseOver}
                  onMouseOut={this._onMouseOut}
                  onResize={this._onChartResize}
                  min={62}
                  points={true}
                  a11yTitleId="lineClickableChartTitle" a11yDescId="lineClickableChartDesc" />
                {chartLabel}
              </div>
              {axis}
          </div>
        </Box>
      </div>
    );
  }
}

LineChartDemo.PropTypes = {
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
