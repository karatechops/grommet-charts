import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Responsive from 'grommet/utils/Responsive';
import classnames from 'classnames';

import Legend from 'grommet/components/Legend';
import Box from 'grommet/components/Box';
import BarChartDemo from './BarChartDemo';
import Axis from './chart/Axis';

const CLASS_ROOT = 'chart-demo-bar-multi';

export default class MultiBarChartDemo extends Component {
  constructor() {
    super();

    this._onWindowResize = this._onWindowResize.bind(this);
    this._onResponsive = this._onResponsive.bind(this);
    this._onIndexUpdate = this._onIndexUpdate.bind(this);
    window.addEventListener('resize', this._onWindowResize);

    this.state = {
      chartSize: 192,
      layout: 'vertical',
      activeIndex: null
    };
  }

  componentDidMount() {
    this._responsive = Responsive.start(this._onResponsive);

    this.setState({
      chartSize: this._getChartSize(this.refs.chartContainer.refs.barChart)
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.layout !== this.state.layout) 
      this.setState({chartSize: this._getChartSize(this.refs.chartContainer.refs.barChart) });
  }

  componentWillUnmount() {
    this._responsive.stop();
    window.removeEventListener('resize', this._onWindowResize);
  }

  _onResponsive (small) {
    this.setState({
      layout: (small) ? 'horizontal' : 'vertical'
    });
  }

  _getChartSize(chartRef) {
    let chartRect = ReactDOM.findDOMNode(chartRef).getBoundingClientRect();
    return (this.state.layout === 'vertical') 
      ? chartRect.height - 8 // Subtract padding.
      : chartRect.width;
  }

  _onWindowResize() {
    this.setState({ 
      chartSize: this._getChartSize(this.refs.chartContainer.refs.barChart)
    });
  }

  _onIndexUpdate(index) {
    this.setState({ activeIndex: index });
  }

  render() {
    let axisLabel = (this.state.layout === 'vertical') ? [
      {position: 1, value: '75'},
      {position: 2, value: '50'}
    ] : [
      {position: 4, value: '75'},
      {position: 3, value: '50'}
    ];

    let classes = classnames([
      CLASS_ROOT,
      {
        [`${CLASS_ROOT}--active`] : this.state.activeIndex !== null
      }
    ]);

    return (
      <div className={classes}>
        <Box direction="row" justify="center">
          <Axis label = {axisLabel} layout={this.state.layout} textPadding={30}
            textAlign={{x:"top"}} distance={this.state.chartSize} count={4} />
          <BarChartDemo title="Play Video Games" ref="chartContainer"
            series={[
              {
                colorIndex: 'graph-3',
                label: 'Millennials',
                units: '%',
                value: 48
              }, 
              {
                colorIndex: 'graph-2',
                label: 'Gen X',
                units: '%',
                value: 30
              }, 
              {
                colorIndex: 'graph-1',
                label: 'Baby Boomers',
                units: '%',
                value: 25
              }
            ]} onIndexUpdate={this._onIndexUpdate} />
          <BarChartDemo title="Download Music of Video"
            series={[
              {
                colorIndex: 'graph-3',
                label: 'Millennials',
                units: '%',
                value: 43
              }, 
              {
                colorIndex: 'graph-2',
                label: 'Gen X',
                units: '%',
                value: 35
              }, 
              {
                colorIndex: 'graph-1',
                label: 'Baby Boomers',
                units: '%',
                value: 30
              }
            ]} onIndexUpdate={this._onIndexUpdate} />
          <BarChartDemo title="Use Social Media"
            series={[
              {
                colorIndex: 'graph-3',
                label: 'Millennials',
                units: '%',
                value: 55
              }, 
              {
                colorIndex: 'graph-2',
                label: 'Gen X',
                units: '%',
                value: 45
              }, 
              {
                colorIndex: 'graph-1',
                label: 'Baby Boomers',
                units: '%',
                value: 40
              }
            ]} onIndexUpdate={this._onIndexUpdate} />
        </Box>
        <Legend series={[
          {
            "label": 'Millennials',
            "colorIndex": "graph-3"
          },
          {
            "label": 'Gen X',
            "colorIndex": "graph-2"
          },
          {
            "label": 'Baby Boomers',
            "colorIndex": "graph-1"
          }
        ]} units="%" />
      </div>
    );
  }
};
