import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Legend from 'grommet/components/Legend';
import Box from 'grommet/components/Box';
import BarChartDemo from './BarChartDemo';
import Axis from './Chart/Axis';

export default class MultiBarChartDemo extends Component {
  constructor() {
    super();

    this._mobileRespond = this._mobileRespond.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    window.addEventListener('resize', this._onWindowResize);

    this.state = {
      chartSize: 192,
      layout: this._mobileRespond(window.innerWidth)
    };
  }

  componentDidMount() {
    this.setState({
      chartSize: this._getChartSize(this.refs.chartContainer.refs.barChart)
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onWindowResize);
  }

  _getChartSize(chartRef) {
    let chartRect = ReactDOM.findDOMNode(chartRef).getBoundingClientRect();
    return (this.state.layout === 'vertical') 
      ? chartRect.height - 8 // Subtract padding.
      : chartRect.width;
  }

  _mobileRespond(windowWidth) {
    return (windowWidth >= 720) 
    ? 'vertical'
    : 'horizontal';
  }

  _onWindowResize() {
    this.setState({ 
      layout: this._mobileRespond(window.innerWidth),
      chartSize: this._getChartSize(this.refs.chartContainer.refs.barChart)
    });
  }

  render() {
    // This axis rotates differently than the rest
    // of the charts. Todo: define vertical/horizontal
    // label ordering.
    let axisLabel = (this.state.layout === 'vertical') ? [
      {position: 1, value: '75'},
      {position: 2, value: '50'}
    ] : [
      {position: 4, value: '75'},
      {position: 3, value: '50'}
    ];

    return (
      <div className="chart-demo-bar-multi">
        <Box direction="row" justify="center">
          <Axis label = {axisLabel}
            layout={this.state.layout}
            textPadding={30}
            align='top'
            distance={this.state.chartSize}
            count={4} />
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
            ]} />
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
            ]} />
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
            ]} />
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
