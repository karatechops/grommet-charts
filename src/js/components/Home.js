// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React from 'react';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Headline from 'grommet/components/Headline';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import Chart from './Chart';
import LargerCohort from './LargerCohort';
import FirstDigitalNatives from './FirstDigitalNatives';
import VerticalLineChart from './VerticalLineChartTest';

const HomeSection = React.createClass({
  render: function () {
    return (
      <Section {...this.props}
        appCentered={true} justify="center" align="center" full={true}
        textCentered={true} pad={{vertical: "large"}}>
        {this.props.children}
      </Section>
    );
  }
});

const Home = React.createClass({
  contextTypes: {
    routePrefix: React.PropTypes.string.isRequired
  },

  _onClick: function () {
    // no-op
  },

  render: function() {
    return (
      <Article className="home" scrollStep={false} controls={false}>

        <HomeSection primary={true} colorIndex="neutral-1">
          <div className="tabs-container">
            <Tabs>

              <Tab title="Vertical Line Chart">
                <Headline>Vertical Line Chart</Headline>
                <VerticalLineChart />
              </Tab>

              <Tab title="First Digital Natives">
                <Headline>Millennials have grown up with the internet and smartphones in an always-on digital world.</Headline>
                <FirstDigitalNatives />
              </Tab>

              <Tab title="Larger Cohort">
                <Headline>The Millennial generation is the biggest in US history, even bigger than the Baby Boom.</Headline>
                <LargerCohort />
              </Tab>

              <Tab title="Social and Connected">
                <Chart series={[
                  {
                    label: "first",
                    values: [[7, 2], [6, 3], [5, 2], [4, 3], [3, 3], [2, 3], [1, 4]],
                    colorIndex: "graph-1"
                  },
                  {
                    label: "second",
                    values: [[7, 2], [6, 3], [5, 4], [4, 3], [3, 1], [2, 1], [1, 3]],
                    colorIndex: "graph-2"
                  }
                ]}
                legend={{position: 'after'}}
                points={true}
                labelMarkers={true}
                type="line"
                xAxis={{
                  placement: "top",
                  data: [
                  {"label": "100", "value": 7},
                  {"label": "", "value": 6},
                  {"label": "", "value": 5},
                  {"label": "50", "value": 4},
                  {"label": "", "value": 3},
                  {"label": "", "value": 2},
                  {"label": "", "value": 1}
                  ]
                }}  
                a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />
              </Tab>
              
              <Tab title="Less Money to Spend">
                <Chart series={[
                  {
                    "label": "first",
                    "values": [[8, 1], [7, 2], [6, 3], [5, 2], [4, 3], [3, 3], [2, 2], [1, 4]],
                    "colorIndex": "graph-1"
                  },
                  {
                    "label": "second",
                    "values": [[8, 4], [7, 2], [6, 3], [5, 4], [4, 3], [3, 0], [2, 1], [1, 0]],
                    "colorIndex": "graph-2"
                  },
                  {
                    "label": "third",
                    "values": [[8, 1], [7, 3], [6, 4], [5, 5], [4, 6], [3, 2], [2, 2], [1, 1]],
                    "colorIndex": "graph-4"
                  }
                ]} type="bar" 
                legend={{
                  "position": "after"
                }}
                //labelMarkers={true}
                xAxis={[
                  {"label": "Label 8", "value": 8},
                  {"label": "Label 7", "value": 7},
                  {"label": "Label 6", "value": 6},
                  {"label": "Label 5", "value": 5},
                  {"label": "Label 4", "value": 4},
                  {"label": "Label 3", "value": 3},
                  {"label": "Label 2", "value": 2},
                  {"label": "Label 1", "value": 1}
                ]} units="TB" size="large" a11yTitleId="largeChartTitle" a11yDescId="largeChartDesc" />
              </Tab>
            </Tabs>
          </div>
        </HomeSection>

      </Article>
    );
  }

});

export default Home;
