// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import Article from 'grommet/components/Article';
import Section from 'grommet/components/Section';
import Headline from 'grommet/components/Headline';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import Box from 'grommet/components/Box';
import AreaChartDemo from './AreaChartDemo';
import LineChartDemo from './LineChartDemo';
import SpiralChartDemo from './SpiralChartDemo';
import MultiBarChartDemo from './MultiBarChartDemo';
import StackedBarChartDemo from './StackedBarChartDemo';
import LayeredAreaChart from './LayeredAreaChart';
import DonutChartDemo from './DonutChartDemo';

class HomeSection extends Component {
  render() {
    return (
      <Section {...this.props}
        appCentered={true} justify="center" align="center" full={true}
        textCentered={true} pad={{vertical: "large"}}>
        {this.props.children}
      </Section>
    );
  }
};

export default class Home extends Component {
  render() {
    return (
      <Article className="home" scrollStep={false} controls={false}>

        <HomeSection primary={true} colorIndex="neutral-1">
          <div className="tabs-container">
            <Tabs>
              <Tab title="Line Chart">
                <Headline>Line Chart</Headline>
                  <LineChartDemo series={[
                    {
                      label: "Less Money to Spend",
                      values: [69, 69, 68, 67, 66, 65, 66, 66, 
                        66, 64, 64, 63, 64],
                      units: "%",
                      axisValues: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 
                        2007, 2008, 2009, 2010, 2011, 2012],
                      colorIndex: "graph-3",
                      pointColorIndex: "graph-2",
                      axisValuesUnits: ""
                    }]}
                  axis={{
                    label: [
                      {position: 1, value: '2000'},
                      {position: 3, value: '2002'},
                      {position: 5, value: '2004'},
                      {position: 7, value: '2006'},
                      {position: 9, value: '2008'},
                      {position: 11, value: '2010'},
                      {position: 13, value: '2012'}
                    ],
                    count: 13
                  }} />
              </Tab>
              <Tab title="Multi Area Chart">
                <Headline>Multi Area Chart</Headline>
                <Box direction="row" justify="between">
                  <AreaChartDemo series={[
                    {
                      label: "Millennials",
                      values: [4.24, 4.18, 4.19, 4.21, 4.25, 4.36, 4.45,
                        4.55, 4.65, 4.73, 4.55, 4.25, 4.36, 4.32, 4.35],
                      units: "M",
                      axisValues: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
                        25, 26, 27, 28, 29, 30],
                      colorIndex: "graph-3",
                      axisValuesUnits: "years old"
                    }]}
                    axis={{
                      label: [
                        {position: 7, value: '35'},
                        {position: 1, value: '15'}]
                    }} /><AreaChartDemo series={[
                      {
                        label: "Generation X",
                        values: [4.12, 4.22, 3.99, 3.88, 3.32, 3.45, 3.55,
                        3.65, 3.75, 3.53, 3.55, 3.25, 3.36, 4.32, 4.35],
                        units: "M",
                        axisValues: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
                          45, 46, 47, 48, 49, 50],
                        colorIndex: "graph-2",
                        axisValuesUnits: "years old"
                      }]}
                    axis={{
                      label: [
                        {position: 7, value: '50'},
                        {position: 1, value: '36'}]
                    }} /><AreaChartDemo series={[
                      {
                        label: "Baby Boomers",
                        values: [4.35, 4.18, 4.19, 4.12, 4.15, 3.95, 3.65,
                        3.55, 3.65, 3.73, 3.55, 3.35, 2.85, 2.65, 2.55],
                        units: "M",
                        axisValues: [55, 56, 57, 58, 59, 60, 61, 62, 63, 64,
                          65, 66, 67, 68, 69, 70],
                        colorIndex: "graph-1",
                        axisValuesUnits: "years old"
                      }]}
                    axis={{
                      label: [
                        {position: 7, value: '70'},
                        {position: 1, value: '51'}]
                    }} />
                </Box>
              </Tab>
              <Tab title="Layered Area Chart">
                <Headline>Layered Area Chart</Headline>
                <LayeredAreaChart />
              </Tab>
              <Tab title="Multi Bar Chart">
                <Headline>Multi Bar Chart</Headline>
                <MultiBarChartDemo />
              </Tab>
              <Tab title="Stacked Bar Chart">
                <Headline>Stacked Bar Chart</Headline>
                <StackedBarChartDemo />
              </Tab>
              <Tab title="Spiral Chart">
                <Headline>Spiral Chart</Headline>
                <SpiralChartDemo />
              </Tab>
              <Tab title="Donut Chart">
                <Headline>Donut Chart</Headline>
                <DonutChartDemo />
              </Tab>
            </Tabs>
          </div>
        </HomeSection>

      </Article>
    );
  }
};
