import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// Todo
//import Responsive from 'grommet/utils/Responsive';

import Legend from 'grommet/components/Legend';
import Heading from 'grommet/components/Heading';
import Box from 'grommet/components/Box';
import BarChartDemo from './BarChartDemo';
import Axis from './Chart/Axis';

const CHART_SERIES = [
  {
    title: '16 - 24',
    series: [
      {
        colorIndex: 'graph-5',
        label: 'Strongly Agree',
        units: '%',
        value: 15
      }, 
      {
        colorIndex: 'graph-4',
        label: 'Tend to Agree',
        units: '%',
        value: 15
      }, 
      {
        colorIndex: 'graph-1',
        label: 'Tend to Disagree',
        units: '%',
        value: 25
      }, 
      {
        colorIndex: 'graph-2',
        label: 'Strongly Disagree',
        units: '%',
        value: 35
      }, 
      {
        colorIndex: 'graph-3',
        label: `Don't Know`,
        units: '%',
        value: 10
      }
    ]
  },
  {
    title: '25 - 34',
    series: [
      {
        colorIndex: 'graph-5',
        label: 'Strongly Agree',
        units: '%',
        value: 5
      }, 
      {
        colorIndex: 'graph-4',
        label: 'Tend to Agree',
        units: '%',
        value: 30
      }, 
      {
        colorIndex: 'graph-1',
        label: 'Tend to Disagree',
        units: '%',
        value: 20
      }, 
      {
        colorIndex: 'graph-2',
        label: 'Strongly Disagree',
        units: '%',
        value: 25
      }, 
      {
        colorIndex: 'graph-3',
        label: `Don't Know`,
        units: '%',
        value: 20
      }
    ]
  },
  {
    title: '35 - 44',
    series: [
      {
        colorIndex: 'graph-5',
        label: 'Strongly Agree',
        units: '%',
        value: 10
      }, 
      {
        colorIndex: 'graph-4',
        label: 'Tend to Agree',
        units: '%',
        value: 20
      }, 
      {
        colorIndex: 'graph-1',
        label: 'Tend to Disagree',
        units: '%',
        value: 30
      }, 
      {
        colorIndex: 'graph-2',
        label: 'Strongly Disagree',
        units: '%',
        value: 30
      }, 
      {
        colorIndex: 'graph-3',
        label: `Don't Know`,
        units: '%',
        value: 10
      }
    ]
  },
  {
    title: '45 - 54',
    series: [
      {
        colorIndex: 'graph-5',
        label: 'Strongly Agree',
        units: '%',
        value: 15
      }, 
      {
        colorIndex: 'graph-4',
        label: 'Tend to Agree',
        units: '%',
        value: 15
      }, 
      {
        colorIndex: 'graph-1',
        label: 'Tend to Disagree',
        units: '%',
        value: 20
      }, 
      {
        colorIndex: 'graph-2',
        label: 'Strongly Disagree',
        units: '%',
        value: 40
      }, 
      {
        colorIndex: 'graph-3',
        label: `Don't Know`,
        units: '%',
        value: 10
      }
    ]
  }
];

export default class StackedBarChartDemo extends Component {
  constructor() {
    super();

    this._mobileRespond = this._mobileRespond.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onIndexUpdate = this._onIndexUpdate.bind(this);
    window.addEventListener('resize', this._onWindowResize);

    this.state = {
      activeIndex: null,
      activeSeries: null,
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

  _onIndexUpdate(index, series) {
    this.setState({ activeSeries: (index !== null) ? series : null });
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
    // This axis rotates differently than the rest of the charts.
    // The labels are updated when the layout out changes. 
    // Todo: define vertical/horizontal label ordering.
    let axisLabel = (this.state.layout === 'vertical') ? [
      {position: 1, value: '100%'},
      {position: 3, value: '50'}
    ] : [
      {position: 5, value: '100%'},
      {position: 3, value: '50'}
    ];

    let charts = CHART_SERIES.map((chart, index) => {
      let ref = (index === 0) ? 'chartContainer' : null;
      return (
        <BarChartDemo title={chart.title} series={chart.series} key={`chart-${index}`}
          ref={ref} stacked={true} onIndexUpdate={this._onIndexUpdate} />
      );
    });

    let legend = (<Legend 
      series={[
        {
          label: 'Strongly Agree',
          value: (this.state.activeSeries !== null) ? this.state.activeSeries[0].value : null,
          colorIndex: 'graph-3'
        },
        {
          label: 'Tend to Agree',
          value: (this.state.activeSeries !== null) ? this.state.activeSeries[1].value : null,
          colorIndex: 'graph-2'
        },
        {
          label: 'Tend to Disagree',
          value: (this.state.activeSeries !== null) ? this.state.activeSeries[2].value : null,
          colorIndex: 'graph-1'
        },
        {
          label: 'Strongly Disagree',
          value: (this.state.activeSeries !== null) ? this.state.activeSeries[3].value : null,
          colorIndex: 'graph-4'
        },
        {
          label: 'Don\'t Know',
          value: (this.state.activeSeries !== null) ? this.state.activeSeries[4].value : null,
          colorIndex: 'graph-5'
        }
      ]}
      units={(this.state.activeSeries !== null) ? '%' : null} />);

    return (
      <div className="chart-demo-bar-multi">
        <Heading tag="h3">Purchased something on the internet in the last 12 months</Heading>
        <Box direction="row" justify="center">
          <Axis label = {axisLabel} layout={this.state.layout} textPadding={45}
            textAlign={{x:"top"}} distance={this.state.chartSize} count={5} />
          {charts}
        </Box>
        {legend}
      </div>
    );
  }
};
