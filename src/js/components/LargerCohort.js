import React from 'react';
import Chart from './Chart';
import Heading from 'grommet/components/Heading';

export default function LargerCohort () {
  return (
    <div>
      <Heading strong={true} tag="h4">
        Age in 2015
      </Heading>
      <div className="stacked-chart">
        <Chart series={[
          {
            label: "first",
            values: [[7, 4.1], [6, 3.42], [5, 2.54], [4, 2.65], [3, 1.79], [2, 2.25], [1, 4.25]],
            colorIndex: "graph-3"
          }
        ]} 
        legend={{
          position: 'after'
        }}
        points={true}
        labelMarkers={true}
        type="area"
        units="M"
        xAxis={{
          placement: "bottom",
          data: [
          {"label": "35", "value": 7},
          {"label": "31", "value": 6},
          {"label": "28", "value": 5},
          {"label": "25", "value": 4},
          {"label": "23", "value": 3},
          {"label": "19", "value": 2},
          {"label": "15", "value": 1}
          ]
        }}
        a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />

        <Chart series={[
          {
            label: "first",
            values: [[7, 3.45], [6, 4.15], [5, 4.25], [4, 3.45], [3, 3.25], [2, 2.45], [1, 4.45]],
            colorIndex: "graph-3"
          }
        ]} 
        legend={{position: 'after'}}
        points={true}
        labelMarkers={true}
        type="area"
        units="M"
        xAxis={{
          placement: "bottom",
          data: [
          {"label": "50", "value": 7},
          {"label": "48", "value": 6},
          {"label": "45", "value": 5},
          {"label": "41", "value": 4},
          {"label": "39", "value": 3},
          {"label": "37", "value": 2},
          {"label": "36", "value": 1}
          ]
        }}
        a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />

        <Chart series={[
          {
            label: "first",
            values: [[7, 1.25], [6, 4.35], [5, 4.25], [4, 2.5], [3, 1.2], [2, 2.45], [1, 3.25]],
            colorIndex: "graph-3"
          }
        ]} 
        legend={{position: 'after'}}
        points={true}
        labelMarkers={true}
        type="area"
        units="M"
        xAxis={{
          placement: "bottom",
          data: [
          {"label": "70", "value": 7},
          {"label": "68", "value": 6},
          {"label": "65", "value": 5},
          {"label": "63", "value": 4},
          {"label": "60", "value": 3},
          {"label": "55", "value": 2},
          {"label": "51", "value": 1}
          ]
        }}
        a11yTitleId="areaClickableChartTitle" a11yDescId="areaClickableChartDesc" />

      </div>
    </div>
  );
}
