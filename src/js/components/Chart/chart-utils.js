import React from 'react';
import Intl from 'grommet/utils/Intl';

const CLASS_ROOT = 'chart';
const POINT_RADIUS = 3;

export default {
  // Combine multiple data sets.
  combineSeries(arrays) {
    let combinedArray = [];
    arrays.forEach((array) => {
      combinedArray = combinedArray.concat(array.values);
    });
    return combinedArray;
  },

  // Evaluate series array to determine highest value
  getMaxValue(series) {
    let maxValue = Math.max.apply(Math, this.combineSeries(series));
    return maxValue;
  },

  // Get the highest count of an array.
  getMaxCount(series) {
    let maxCount = 0;
    series.forEach((item) =>{
      maxCount = Math.max(item.values.length, maxCount);
    });
    maxCount = maxCount - 1;

    return maxCount;
  },

  // Setup our bounds to plot points.
  bounds ({series, height, width, max, min, orientation, points}) {
    let minX = 0;
    let maxX = (orientation === 'horizontal') 
      ? this.getMaxCount(series) : this.getMaxValue(series);
    let minY = 0;
    let maxY = (orientation === 'horizontal') 
      ? this.getMaxValue(series) : this.getMaxCount(series);

    if (min) {
      if (orientation === 'horizontal') {
        minY = min;
      }

      if (orientation === 'vertical') {
        minX = min;
      }
    }

    if (max) {
      if (orientation === 'horizontal') {
        maxY = max;
      } 

      if (orientation === 'vertical') {
        maxX = max;
      }
    }

    let spanX = maxX - minX;
    let spanY = maxY - minY;

    let graphWidth = width;
    let graphHeight = height;

    let graphTop = 0;
    let graphBottom = (!points) ? height : height - POINT_RADIUS;

    let graphLeft = (!points) ? 0 : POINT_RADIUS + 2;
    let graphRight = (!points) ? graphWidth : graphWidth - POINT_RADIUS + 2;

    let valueCount = (orientation === 'horizontal') 
      ? maxX
      : maxY;

    let scaleX = (graphWidth / spanX);
    let stepWidth = (orientation === 'horizontal') 
      ? Math.round(graphWidth / (valueCount - 1)) 
      : Math.round(graphWidth / (valueCount - 1));

    let scaleY = (graphHeight / spanY);

    let result = {
      graphWidth: graphWidth,
      graphHeight: graphHeight,
      graphTop: graphTop,
      graphBottom: graphBottom,
      graphLeft: graphLeft,
      graphRight: graphRight,
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      spanX: spanX,
      spanY: spanY,
      scaleX: scaleX,
      scaleY: scaleY,
      stepWidth: stepWidth,
      valueCount: valueCount
    };

    return result;
  },

    // Translates X value to X coordinate.
  _translateX (x, bounds) {
    let scaledX = Math.min(bounds.graphRight, this._translateWidth(x, bounds));
    let translatedX = Math.max(bounds.graphLeft, scaledX);

    return translatedX;
  },

  _translateWidth(x, bounds) {
    let translatedWidth = Math.round((x - bounds.minX) * bounds.scaleX);

    return translatedWidth;
  },

  // Translates Y value to Y coordinate.
  _translateY (y, bounds) {
    // leave room for line width since strokes are aligned to the center
    let translatedY = Math.max(1,
      (bounds.graphBottom - Math.max(1, this._translateHeight(y, bounds))));

    return translatedY;
  },

  // Translates Y value to graph height.
  _translateHeight (y, bounds) {
    let translatedHeight = Math.round((y - bounds.minY) * bounds.scaleY);

    return translatedHeight;
  },

  // Translates X and Y values to X and Y coordinates.
  _coordinates (value, index, bounds, orientation = 'horizontal') {
    let x, y;
    x = (orientation === 'horizontal') ? index : value;
    y = (orientation === 'horizontal') ? value : bounds.maxY - index;

    return [this._translateX(x, bounds), this._translateY(y, bounds)];
  },

  // Determines what the appropriate control coordinates are on
  // either side of the coordinate at the specified index.
  // This calculation is a simplified smoothing function that
  // just looks at whether the line through this coordinate is
  // ascending, descending or not. Peaks, valleys, and flats are
  // treated the same.
  _controlCoordinates (coordinates, index) {
    let current = coordinates[index];
    // Use previous and next coordinates when available, otherwise use
    // the current coordinate for them.
    let previous = current;
    if (index > 0) {
      previous = coordinates[index - 1];
    }
    let next = current;
    if (index < coordinates.length - 1) {
      next = coordinates[index + 1];
    }

    // Put the control X coordinates midway between the coordinates.
    let deltaX = (current[0] - previous[0]) / 2;
    let deltaY;

    // Start with a flat slope. This works for peaks, valleys, and flats.
    let first = [current[0] - deltaX, current[1]];
    let second = [current[0] + deltaX, current[1]];

    if (previous[1] < current[1] && current[1] < next[1]) {
      // Ascending, use the minimum positive slope.
      deltaY = Math.min(((current[1] - previous[1]) / 2),
        ((next[1] - current[1]) / 2));
      first[1] = current[1] - deltaY;
      second[1] = current[1] + deltaY;
    } else if (previous[1] > current[1] && current[1] > next[1]) {
      // Descending, use the minimum negative slope.
      deltaY = Math.min(((previous[1] - current[1]) / 2),
        ((current[1] - next[1]) / 2));
      first[1] = current[1] + deltaY;
      second[1] = current[1] - deltaY;
    }
    return [first, second];
  },

  // Uses the provided colorIndex or provides one based on the seriesIndex.
  _itemColorIndex (item, seriesIndex) {
    return item.colorIndex || ('graph-' + (seriesIndex + 1));
  },

  _getLineCommands (coordinates, smooth, points) {
    let commands, controlCoordinates, previousControlCoordinates;

    coordinates.forEach((coordinate, index) => {
      if (smooth) {
        controlCoordinates = this._controlCoordinates(coordinates, index);
      }

      // Lower top most coordinates to accommodate points.
      if (points && coordinate[1] <= 1) coordinate[1] = coordinate[1] + POINT_RADIUS;
      if (0 === index) {
        commands = "M" + coordinate.join(',');
      } else {
        if (smooth) {
          // Use the previous right control coordinate and the current
          // left control coordinate. We do this because we calculate
          // the left and right sides for a particular index together,
          // so the path is smooth but the SVG C command needs the
          // right one from the previous index and the left one from
          // the current index.
          commands += " C" + previousControlCoordinates[1].join(',') + " " +
            controlCoordinates[0].join(',') + " " + coordinate.join(',');
        } else {
          commands += " L" + coordinate.join(',');
        }
      }

      previousControlCoordinates = controlCoordinates;
    });
    return commands;
  },

  getPointPaths (bounds, {series, orientation, smooth, points}, radius) {
    let values = series.map((item, seriesIndex) => {
      let colorIndex = this._itemColorIndex(item, seriesIndex);
      let coordinates = item.values.map((value, index) => {
        return this._coordinates(value, index, bounds, orientation);
      });

      let pointsPaths = [];
      coordinates.forEach((coordinate, index) => {
        let x = Math.max(radius + 1,
          Math.min(bounds.graphWidth - (radius + 1), coordinate[0]));
        let value = item.values[index];
        let axisValue = (item.axisValues !== undefined) ? item.axisValues[index] : index;
        let units = (item.units !== undefined) ? item.units : '';

        if (coordinate[1] <= 1) coordinate[1] = coordinate[1] + radius;
        pointsPaths.push(
          <circle key={`series${seriesIndex}-${index}`}
            className={`${CLASS_ROOT}__values-point color-index-${colorIndex}`}
            cx={x} cy={coordinate[1]} r={radius} 
            data-value={value}
            data-axis-value={axisValue}
            data-units={units} />
        );
      });

      return pointsPaths;
    });

    return values;
  },

  getAreaPaths (bounds, {series, orientation, smooth, points}) {
    let bottom = bounds.graphBottom;
    let area = series.map((item, seriesIndex) => {

      let colorIndex = this._itemColorIndex(item, seriesIndex);
      let coordinates = item.values.map((value, index) => {
        return this._coordinates(value, index, bounds, orientation);
      });

      if (orientation === 'vertical') coordinates = coordinates.reverse();

      let commands = this._getLineCommands(coordinates, smooth, points);

      let close = 'L' + coordinates[coordinates.length - 1][0] +
        ',' + bottom +
        'L' + coordinates[0][0] + ',' + bottom + 'Z';

      if (orientation === "vertical") close = 'L' + bounds.graphLeft +
        ',' + bounds.graphLeft +
        'L' + bounds.graphLeft + ',' + bottom + 'Z';

      let areaCommands = commands + close;
      let classes = [`${CLASS_ROOT}__values-area`,
        `color-index-${colorIndex}`];
      if (item.onClick) {
        classes.push(`${CLASS_ROOT}__values-area--active`);
      }

      let areaPath = (
        <path key={`${seriesIndex}`} stroke="none" className={classes.join(' ')} d={areaCommands} />
      );

      return areaPath;
    });

    return area;
  },

  getLinePaths (bounds, {series, orientation, smooth, points}) {
    let values = series.map((item, seriesIndex) => {

      let coordinates = item.values.map((value, index) => {
        return this._coordinates(value, index, bounds, orientation);
      });

      // Flip vertical coords otherwise chart appears reverse.
      if (orientation === 'vertical') coordinates = coordinates.reverse();

      let colorIndex = this._itemColorIndex(item, seriesIndex);
      let commands = this._getLineCommands(coordinates, smooth, points);

      let classes = [`${CLASS_ROOT}__values-line`,
        `color-index-${colorIndex}`];

      let linePath = (
        <path key={`line-${seriesIndex}`} fill="none" className={classes.join(' ')} d={commands} />
      );

      return linePath;
    });

    return values;
  },

  // Generate rectangles used for hotspots. Todo ---
  getHotspots (bounds, {series, valueCount, orientation}, a11yTitleId, onClick, onMouseOver) {
    let className = `${CLASS_ROOT}__front`;
    let hotspots = series.map((item, index) => {
      // Todo: classes

      let width = (orientation === 'horizontal') 
        ? bounds.stepWidth : bounds.graphWidth;
      let height = (orientation === 'horizontal')
        ? bounds.graphHeight : bounds.stepWidth;

      let values = item.values.map((value, valueIndex) => {
        let y = this._translateY(valueIndex, bounds) - (bounds.stepWidth / 2);
        let hotspotId = `${a11yTitleId}_x_band_${valueIndex}`;
        let hotspotTitleId = `${a11yTitleId}_x_band_title_${valueIndex}`;
        let dataValue = value;
        let axisValue = (item.axisValues !== undefined) ? item.axisValues[valueIndex] : valueIndex;
        let units = (item.units !== undefined) ? item.units : '';
        let axisValuesUnits = (item.axisValuesUnits !== undefined) ? item.axisValuesUnits : '';

        return (
          <g key={hotspotId} id={hotspotId} role="tab"
            aria-labelledby={hotspotTitleId} onClick={onClick}
            onMouseOver={onMouseOver}>
            <title id={hotspotTitleId}></title>
            <rect role="presentation" className={`${className}-xband-background`}
              x={0} y={y} width={width} height={height}
              data-value={dataValue} data-units={units}
              data-axis-value={axisValue} data-axis-units={axisValuesUnits}/>
          </g>
        );
      });
      return values;
    });

    return (
      <g ref="front" className={className}>
        {hotspots}
      </g>
    );
  },

  getA11YTitle (title, context, type) {
    let a11yTitle = title;
    if (!title) {
      let chartLabel = Intl.getMessage(context, 'Chart');
      let typeLabel = Intl.getMessage(context, type);
      a11yTitle = `${typeLabel} ${chartLabel}`;
    }

    return a11yTitle;
  }
};
