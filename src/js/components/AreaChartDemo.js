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
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onChartResize = this._onChartResize.bind(this);

    window.addEventListener('resize', this._onWindowResize);
    this.state = {
      legend: {
        value: '',
        axisValue: '',
        units: '',
        axisUnits: '',
        top: 0,
        visible: false
      },
      chart: {
        height: 0,
        width: 0
      },
      layout: this._mobileRespond(window.innerWidth)
    };
  }

  _onClick(event) {
    let target = event.target;
    let targetNodeRect = ReactDOM.findDOMNode(target).getBoundingClientRect();
    this._updateLegend(event, targetNodeRect);
  }

  _onMouseOver(event) {
    let target = event.target;
    let targetNodeRect = ReactDOM.findDOMNode(target).getBoundingClientRect();
    this._updateLegend(target, targetNodeRect);
  }

  _onMouseOut(event) {
    this.setState({
      legend: {
        value: this.state.legend.value,
        axisValue: this.state.legend.axisValue,
        units: this.state.legend.units,
        axisUnits: this.state.legend.axisUnits,
        top: this.state.legend.top,
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

  _updateLegend(target, targetRect) {
    let top = (this.state.layout === 'horizontal') 
      ? targetRect.height + 40 // add Axis height.
      : Number(target.getAttribute('y')) + (targetRect.height /2) + 1;

    this.setState({
      legend: {
        value: target.getAttribute('data-value'),
        axisValue: target.getAttribute('data-axis-value'),
        units: target.getAttribute('data-units'),
        axisUnits: target.getAttribute('data-axis-units'),
        top: top,
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
    // Will be converted to Inline Legend(?) component.
    let legendTempRoot = 'infographic-legend';
    let legendClasses = classnames([
      legendTempRoot,
      `${legendTempRoot}--vertical`,
      {
        [`${legendTempRoot}--active`]: this.state.legend.visible
      }
    ]);
    let legendStyle = {
      top: this.state.legend.top
    };

    let legend = (
      <div style={legendStyle} className={legendClasses} ref="legend">
        <Heading strong={true} tag="h5">
          {this.state.legend.axisValue} {this.state.legend.axisUnits}
        </Heading>
        <Heading strong={true} tag="h2">
          {this.state.legend.value}<span className={`infographics-legend__unit`}>{this.state.legend.units}</span>
        </Heading>
      </div>
    );

    let mobileSummary = (this.state.layout === 'horizontal')
      ? null
      : (
          <Box align="center" justify="center" direction="row" pad="small">
            <Summary value={this.props.series[0].values} units="M" title={this.props.series[0].label}
              visible={this.state.legend.visible}/>
          </Box>
        );

    let desktopSummary = (this.state.layout === 'horizontal') 
      ? (
        <Summary value={this.props.series[0].values} units="M" title={this.props.series[0].label}
            visible={this.state.legend.visible}/>
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
      <div className="chart-demo">
        {mobileSummary}
          <Box direction="column">
            <div className="chart-demo__container" style={{position:'relative'}}>
              <div style={{position:'relative'}}>
                {legend}
                <Area series={this.props.series}
                  orientation={this.state.layout}
                  onClick={this._onClick}
                  onMouseOver={this._onMouseOver}
                  onMouseOut={this._onMouseOut}
                  onResize={this._onChartResize}
                  min={2.5}
                  a11yTitleId="lineClickableChartTitle" a11yDescId="lineClickableChartDesc" />
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