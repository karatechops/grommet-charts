import React from 'react';
import Box from 'grommet/components/Box';
import Line from './Chart/Line';
import Axis from './Axis';

export default function VerticalLineChart () {
  return (
    <div>
      <Box align="center" justify="center" direction="column">
        <Axis label = {[
            {position: 5, value: '100'},
            {position: 3, value: '50'}]}
            layout="horizontal"
            height={50}
            width={192} />
        <Box direction="column">
          <Line series={[
            {
              label: "first",
              values: [2, 3, 2, 3, 1, 3, 4],
              colorIndex: "graph-2"
            }]}
            points={false}
            labelMarkers={false}
            type="area"
            orientation="vertical"
            a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />
        </Box>
      </Box>

      <Box align="center" justify="center" direction="row">
        <Axis label = {[
            {position: 5, value: '100'},
            {position: 3, value: '50'}]}
            layout="vertical"
            height={192} />

        <Line series={[
          {
            label: "first",
            values: [2, 3, 2, 3, 1, 3, 4],
            colorIndex: "graph-2"
          }]}
          points={false}
          labelMarkers={false}
          type="area"
          orientation="horizontal"
          a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />
      </Box>
    </div>
  );
}
