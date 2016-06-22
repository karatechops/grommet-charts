// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React from 'react';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Headline from 'grommet/components/Headline';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
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
              
            </Tabs>
          </div>
        </HomeSection>

      </Article>
    );
  }

});

export default Home;
