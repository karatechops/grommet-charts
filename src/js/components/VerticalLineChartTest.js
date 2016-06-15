import React from 'react';
import Box from 'grommet/components/Box';
import VerticalChartPrototype from './VerticalChartPrototype';
import Axis from './Axis';

export default function VerticalLineChart () {
  return (
    <div>
      <Box align="center" justify="center" direction="row">
        <Axis label = {[
            {position: 5, value: '100'},
            {position: 3, value: '50'}]}
            layout="vertical"
            height={192}
            width={50} />

        <VerticalChartPrototype series={[
          {
            label: "first",
            values: [[7, 2], [6, 3], [5, 2], [4, 3], [3, 1], [2, 3], [1, 4]],
            colorIndex: "graph-2"
          }]}
          points={false}
          labelMarkers={false}
          type="area"
          orientation="vertical"
          a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />
      </Box>

      <Box align="center" justify="center" direction="row">
        <Axis label = {[
            {position: 5, value: '100'},
            {position: 3, value: '50'}]}
            layout="vertical"
            height={192} />

        <VerticalChartPrototype series={[
          {
            label: "first",
            values: [[7, 2], [6, 3], [5, 2], [4, 3], [3, 1], [2, 3], [1, 4]],
            colorIndex: "graph-2"
          }]}
          points={false}
          labelMarkers={false}
          type="area"
          orientation="horizontal"
          a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />
      </Box>

      <Box align="center" justify="center" direction="column">
        <Axis label = {[
            {position: 5, value: '100'},
            {position: 3, value: '50'}]}
            count={5}
            layout="horizontal"
            width={192} />

        <VerticalChartPrototype series={[
          {
            label: "first",
            values: [[7, 2], [6, 3], [5, 2], [4, 3], [3, 1], [2, 3], [1, 4]],
            colorIndex: "graph-3"
          }]}
          type="line"
          orientation="vertical"
          a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />
      </Box>
    </div>
  );
}
