import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import Box from 'grommet/components/Box';
import Heading from 'grommet/components/Heading';
import Area from './Chart/Area';
import Summary from './Chart/Summary';
import Axis from './Chart/Axis';

export default class AreaChartDemo extends Component {
  constructor(props) {
    super(props);

    this._onClick = this._onClick.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);
    this._onIndexUpdate = this._onIndexUpdate.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onChartResize = this._onChartResize.bind(this);

    window.addEventListener('resize', this._onWindowResize);
    this.state = {
      chartLabel: {
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
        visible: false
      }
    });
  }

  _onIndexUpdate(index) {
    // Todo: adjust text here, remove from _updateChartLabel.
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
    let top = (this.state.layout === 'horizontal') 
      ?  targetRect.height + 40 // add Axis height.
      : Number(target.getAttribute('y')) + (targetRect.height /2) + 1;

    let left = (this.state.layout === 'horizontal')
      ? Number(target.getAttribute('x')) + 1
      : 0;

    // Demo purposes, adjust for dynamic placement.
    let labelRect = this.refs.chartLabel.getBoundingClientRect();

    if (target.getAttribute('data-index') >= 10 && this.state.layout === 'vertical') 
      top = Number(target.getAttribute('y')) - (labelRect.height - 6);

    let targetIndex = Number(target.getAttribute('data-index'));
    let value = this.props.series[0].values[targetIndex];
    let axisValue = this.props.series[0].axisValues[targetIndex];
    let units = this.props.series[0].units;
    let axisUnits = this.props.series[0].axisValuesUnits;

    this.setState({
      chartLabel: {
        value: value,
        axisValue: axisValue,
        units: units,
        axisUnits: axisUnits,
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
      // Todo: add left positioning. 
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
                <Area series={this.props.series}
                  orientation={this.state.layout}
                  onClick={this._onClick}
                  onMouseOver={this._onMouseOver}
                  onMouseOut={this._onMouseOut}
                  onResize={this._onChartResize}
                  onIndexUpdate={this._onIndexUpdate}
                  min={2.5}
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
