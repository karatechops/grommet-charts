import React, { Component } from 'react';
//import ReactDOM from 'react-dom';
//import classnames from 'classnames';
import Box from 'grommet/components/Box';
//import Heading from 'grommet/components/Heading';
import Legend from 'grommet/components/Legend';
import Area from './Chart/Area';
import Axis from './Chart/Axis';

const CHART_SERIES = [
  {
    label: "16 - 24",
    values: [66, 68, 77, 82, 80],
    units: "%",
    axisValues: [15, 16, 17, 18, 19],
    colorIndex: "graph-3",
    axisValuesUnits: "years old"
  },{
    label: "25 - 34",
    values: [60, 60, 62, 68, 70],
    units: "%",
    axisValues: [15, 16, 17, 18, 19, 20],
    colorIndex: "graph-3",
    axisValuesUnits: "years old"
  },{
    label: "35 - 44",
    values: [58, 55, 53, 55, 58],
    units: "%",
    axisValues: [15, 16, 17, 18, 19, 20],
    colorIndex: "graph-3",
    axisValuesUnits: "years old"
  }
];

export default class LayeredAreaChart extends Component {
  constructor(props) {
    super(props);

    this._onClick = this._onClick.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onIndexUpdate = this._onIndexUpdate.bind(this);
    this._onChartResize = this._onChartResize.bind(this);

    window.addEventListener('resize', this._onWindowResize);
    this.state = {
      chartLabel: {
        value: '0',
        axisValue: '0',
        units: ' ',
        axisUnits: ' ',
        top: 0,
        visible: false
      },
      chart: {
        height: 0,
        width: 0
      },
      layout: this._mobileRespond(window.innerWidth),
      activeIndex: null
    };
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onWindowResize);
  }

  _onClick(event) {
    this.setState({ activeIndex: event.target.getAttribute('data-index') });
  }

  _onMouseOver(event) {
    this.setState({ activeIndex: event.target.getAttribute('data-index') });
  }

  _onMouseOut(event) {
    this.setState({ activeIndex: null });
  }

  _onIndexUpdate(index) {
    
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

  _mobileRespond(windowWidth) {
    return (windowWidth >= 720) 
    ? 'horizontal'
    : 'vertical';
  }

  render() {
    let axisXLabels = (this.state.layout === 'horizontal')
      ? [
          {position: 1, value:'2008'},
          {position: 5, value:'2012'}
      ]
      : [
          {position: 5, value:'100%'},
          {position: 3, value:'75'},
          {position: 1, value:'50'}
      ];

    let axisYLabels = (this.state.layout === 'horizontal')
      ? [
          {position: 1, value:'100%'},
          {position: 3, value:'75'},
          {position: 5, value:'50'}
      ]
      : [
          {position: 1, value:'2008'},
          {position: 5, value:'2012'}
      ];

    let axisX = (
      <Axis 
        label={axisXLabels} layout="horizontal" textAlign={{x:'bottom'}}
        textPadding={30} align="top" distance={this.state.chart.width}
        count={5} />
    );

    let axisY = (
      <Axis 
        label={axisYLabels} layout="vertical" textAlign={{y:'left'}}
        textPadding={45} align="top" distance={this.state.chart.height}
        count={5} />
    );

    let series = CHART_SERIES.map((seriesSingle, index) => {
      let seriesPicks = {
        label: seriesSingle.label,
        value: (this.state.activeIndex) 
            ? seriesSingle.values[this.state.activeIndex] 
            : null,
        colorIndex: `${seriesSingle.colorIndex}`
      };
      return(seriesPicks);
    });

    let legend = (
      <Legend series={series} units={(this.state.activeIndex) ? "%" : null} />
    );

    return (
      <div className="chart-demo chart-demo-layered-area">
          <Box direction="column">
            <div className="chart-demo__container" style={{position:'relative'}}>
              <Box direction="row" responsive={false}>
                {axisY}
                <Area series={CHART_SERIES}
                  orientation={this.state.layout}
                  onClick={this._onClick}
                  onMouseOver={this._onMouseOver}
                  onMouseOut={this._onMouseOut}
                  onResize={this._onChartResize}
                  onIndexUpdate={this._onIndexUpdate}
                  min={50} max={100}
                  a11yTitleId="LayeredAreaChart" a11yDescId="LayeredAreaChartDesc" />
              </Box>
              {axisX}
          </div>
          {legend}
        </Box>
      </div>
    );
  }
}
