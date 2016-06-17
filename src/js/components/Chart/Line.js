// (C) Copyright 2014 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Intl from 'grommet/utils/Intl';
//import KeyboardAccelerators from 'grommet/utils/KeyboardAccelerators';

const CLASS_ROOT = "chart";

const DEFAULT_WIDTH = 384;
const DEFAULT_HEIGHT = 192;
const POINT_RADIUS = 6;

export default class Line extends Component {

  constructor(props) {
    super(props);

    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);

    this.state = this._stateFromProps(props, DEFAULT_WIDTH, DEFAULT_HEIGHT);
  }

  componentDidMount () {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  componentWillReceiveProps (newProps) {
    let state = this._stateFromProps(newProps,
      this.state.width, this.state.height);
    this.setState(state);
  }

  componentDidUpdate () {
    this._layout();
  }

  componentWillUnmount () {
    clearTimeout(this._resizeTimer);
    window.removeEventListener('resize', this._onResize);
  } 

  // Generates state based on the provided props.
  _stateFromProps (props, width, height) {

    let bounds = this._bounds(props.series, width, height);
    let defaultXIndex = 0;
    if (props.series && props.series.length > 0) {
      defaultXIndex = 0;
    }
    if (props.hasOwnProperty('important')) {
      defaultXIndex = props.important;
    }

    // normalize size
    let size = props.size ||
      (props.small ? 'small' :
        (props.large ? 'large' : null));
    return {
      bounds: bounds,
      defaultXIndex: defaultXIndex,
      // This defaults back to 0, remove this to 
      // persist highlighted state.
      //highlightXIndex: highlightXIndex,
      width: width,
      height: height,
      size: size
    };
  }

  _onMouseOver (xIndex, value = -1) {
    if (value >= 0 && this.props.dispatchValue) this.props.dispatchValue(value);
    this.setState({
      highlightXIndex: xIndex
    });
  }

  _onMouseOut () {
    this.setState({highlightXIndex: this.state.defaultXIndex});
  }

  _onResize () {
    // debounce
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(this._layout, 50);
  }

  // Performs some initial calculations to make subsequent calculations easier.
  _bounds (series, width, height) {

    // analyze series data
    let minX = null;
    let maxX = null;
    let minY = null;
    let maxY = null;

    series.forEach((item) => {

      maxY = (this.props.orientation === 'vertical') 
        ? item.values.length : null;
      maxX = (this.props.orientation === 'horizontal') 
        ? item.values.length : null;

      item.values.forEach((value, valueIndex) => {
        let x = (this.props.orientation === 'horizontal') 
          ? valueIndex : value;

        let y = (this.props.orientation === 'horizontal')
          ? value : valueIndex;

        if (minX === null) {
          minX = x;
          maxX = x;
          minY = y;
          maxY = y;
        } else {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }

      });
    });

    if (this.props.hasOwnProperty('min')) {
      if (this.props.orientation === 'horizontal') {
        minY = this.props.min;
      } else if (this.props.orientation === 'vertical') {
        minX = this.props.min;
      }
    }
    if (this.props.hasOwnProperty('max')) {
      if (this.props.orientation === 'horizontal') {
        maxY = this.props.max;
      } else if (this.props.orientation === 'vertical') {
        maxY = this.props.max;
      }
    }

    let spanX = maxX - minX;
    let spanY = maxY - minY;

    let graphWidth = width;
    let graphHeight = height;

    let graphTop = 0;
    let graphBottom = height;

    let graphLeft = 0;
    let graphRight = graphWidth;

    if (this.props.points) {
      graphLeft += POINT_RADIUS + 2;
      graphRight -= POINT_RADIUS + 2;
    }

    let valueCount = (this.props.orientation === 'horizontal') 
      ? maxX
      : maxY;

    let scaleX = (graphWidth / spanX);
    let stepWidth = (this.props.orientation === 'horizontal') 
      ? Math.round(graphWidth / (valueCount - 1)) 
      : Math.round(graphWidth / (valueCount - 1));

    let scaleY = (graphHeight / spanY);

    let result = {
      minX: minX,
      maxX: maxX,
      minY: minY,
      maxY: maxY,
      spanX: spanX,
      spanY: spanY,
      scaleX: scaleX,
      scaleY: scaleY,
      graphWidth: graphWidth,
      graphHeight: graphHeight,
      graphTop: graphTop,
      graphBottom: graphBottom,
      graphLeft: graphLeft,
      graphRight: graphRight,
      stepWidth: stepWidth,
      maxValues: valueCount
    };

    return result;
  }

  // Aligns the legend with the current position of the cursor, if any.
  // We may use this later.
  _alignLegend () {
    if (this.state.highlightXIndex >= 0 && this.refs.cursor) {
      let bounds = this.state.bounds;
      let cursorElement = this.refs.cursor;
      let cursorRect = cursorElement.getBoundingClientRect();
      let element = this.refs.chart;
      let rect = element.getBoundingClientRect();
      let legendElement = ReactDOM.findDOMNode(this.refs.legend);
      let legendRect = legendElement.getBoundingClientRect();

      let left = cursorRect.left - rect.left - legendRect.width - 1;
      // if the legend would be outside the graphic, orient it to the right.
      if (left < 0) {
        left += legendRect.width + 2;
      }

      legendElement.style.left = '' + left + 'px ';
      legendElement.style.top = '' + (bounds.graphTop) + 'px ';
    }
  }

  // Adjusts the legend position and set the width, height, and
  // redo the bounds calculations.
  // Called whenever the browser resizes or new properties arrive.
  _layout () {
    if (this.props.legend && 'overlay' === this.props.legend.position) {
      this._alignLegend();
    }
    let element = this.refs.chart;
    let rect = element.getBoundingClientRect();

    if (rect.width !== this.state.width || rect.height !== this.state.height) {
      let bounds = this._bounds(this.props.series, rect.width, rect.height);

      let width = rect.width;

      this.setState({
        width: width,
        height: rect.height,
        bounds: bounds
      });

      if (this.props.dispatchBounds) this.props.dispatchBounds(width, rect.height, bounds);
    }
  }

  // Translates X value to X coordinate.
  _translateX (x) {
    let bounds = this.state.bounds;
    let scaledX = Math.min(bounds.graphRight, Math.round((x - bounds.minX) * bounds.scaleX));
    let translatedX = Math.max(bounds.graphLeft, scaledX);
    if (translatedX === 0) {
      console.log(`------- ${this.props.orientation} -----`);
      console.log('x', x, 'translatedX', translatedX);
      console.log('bounds.graphLeft', bounds.graphLeft);
      console.log('bounds.scaleX', bounds.scaleX);
      console.log('bounds.minX', bounds.minX, 'bounds.minY', bounds.minY);
      console.log('min value of:', 'bounds.graphRight', bounds.graphRight, 
        'Math.round((x - bounds.minX) * bounds.scaleX)', Math.round((x - bounds.minX) * bounds.scaleX));
      console.log(`------------`);
    }
    return translatedX;
  }

  _translateWidth(x) {
    let bounds = this.state.bounds;
    let translatedWidth = Math.round((x - bounds.minX) * bounds.scaleX);

    return translatedWidth;
  }

  // Translates Y value to Y coordinate.
  _translateY (y) {
    let bounds = this.state.bounds;
    // leave room for line width since strokes are aligned to the center
    let translatedY = Math.max(1,
      (bounds.graphBottom - Math.max(1, this._translateHeight(y))));

    if (y === 1) {
      console.log(`------ ${this.props.orientation} ------`);
      console.log('y', y, 'translatedY', translatedY);
      console.log('bounds.graphLeft', bounds.graphLeft);
      console.log('bounds.scaleY', bounds.scaleY);
      console.log('bounds.minX', bounds.minX, 'bounds.minY', bounds.minY);
      //console.log('min value of:', 'bounds.graphRight', bounds.graphRight, 
        //'Math.round((x - bounds.minX) * bounds.scaleX)', Math.round((x - bounds.minX) * bounds.scaleX));
      console.log(`------------`);
    }

    //console.log('translatedY', translatedY);
    return translatedY;
  }

  // Translates Y value to graph height.
  _translateHeight (y) {
    let bounds = this.state.bounds;
    let translatedHeight = Math.round((y - bounds.minY) * bounds.scaleY);

    return translatedHeight;
  }

  // Translates X and Y values to X and Y coordinates.
  _coordinates (value, index, orientation = 'horizontal') {
    let x, y;

    x = (orientation === 'horizontal') ? index : value;
    y = (orientation === 'horizontal') ? value : this.state.bounds.maxY - index;

    return [this._translateX(x), this._translateY(y)];
  }

  // Uses the provided colorIndex or provides one based on the seriesIndex.
  _itemColorIndex (item, seriesIndex) {
    return item.colorIndex || ('graph-' + (seriesIndex + 1));
  }

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
  }

  // Converts the series data into paths for line or area types.
  _renderLinesOrAreas () {
    let bounds = this.state.bounds;
    let values = this.props.series.map((item, seriesIndex) => {

      // Get all coordinates up front so they are available
      // if we are drawing a smooth chart.
      if (this.props.orientation === 'vertical') item.values = item.values.reverse();

      let coordinates = item.values.map((value, index) => {
        return this._coordinates(value, index, this.props.orientation);
      });

      let colorIndex = this._itemColorIndex(item, seriesIndex);
      let commands = null;
      let controlCoordinates = null;
      let previousControlCoordinates = null;
      let points = [];

      if (this.props.orientation === 'vertical') coordinates = coordinates.reverse();

      // Build the commands for this set of coordinates.
      coordinates.forEach((coordinate, index) => {
        if (this.props.smooth) {
          controlCoordinates = this._controlCoordinates(coordinates, index);
        }

        // Lower top most coordinates to accommodate points.
        if (this.props.points && coordinate[1] <= 1) coordinate[1] = coordinate[1] + POINT_RADIUS;
        //console.log(coordinate);
        if (0 === index) {
          commands = "M" + coordinate.join(',');
        } else {
          if (this.props.smooth) {
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

        if (this.props.points && ! this.props.sparkline) {
          let x = Math.max(POINT_RADIUS + 1,
            Math.min(bounds.graphWidth - (POINT_RADIUS + 1), coordinate[0]));
          const value = item.values[index];
          points.push(
            <circle key={index}
              className={`${CLASS_ROOT}__values-point color-index-${colorIndex}`}
              cx={x} cy={coordinate[1]} r={POINT_RADIUS} onClick={value.onClick} />
          );
        }

        previousControlCoordinates = controlCoordinates;
      });

      let linePath;
      if ('line' === this.props.type || this.props.points) {
        let classes = [`${CLASS_ROOT}__values-line`,
          `color-index-${colorIndex}`];
        if (item.onClick) {
          classes.push(`${CLASS_ROOT}__values-line--active`);
        }
        linePath = (
          <path fill="none" className={classes.join(' ')} d={commands} />
        );
      }

      let areaPath;
      if ('area' === this.props.type) {
        // For area charts, close the path by drawing down to the bottom
        // and across to the bottom of where we started.
        let bottom = (this.props.labelMarkers)
          ? bounds.graphBottom - 10
          : bounds.graphBottom;
        let close = 'L' + coordinates[coordinates.length - 1][0] +
          ',' + bottom +
          'L' + coordinates[0][0] + ',' + bottom + 'Z';

        if (this.props.orientation === "vertical") close = 'L' + bounds.graphLeft +
          ',' + bounds.graphLeft +
          'L' + bounds.graphLeft + ',' + bottom + 'Z';

        let areaCommands = commands + close;
        let classes = [`${CLASS_ROOT}__values-area`,
          `color-index-${colorIndex}`];
        if (item.onClick) {
          classes.push(`${CLASS_ROOT}__values-area--active`);
        }

        areaPath = (
          <path stroke="none" className={classes.join(' ')} d={areaCommands} />
        );
      }

      return (
        <g key={`line_group_${seriesIndex}`} onClick={item.onClick}>
          {areaPath}
          {linePath}
          {points}
        </g>
      );
    });

    return values;
  }

  // Create vertical rects for each X data point.
  // These are used to track the mouse hover.
  _renderHotspots (layer) {
    let className = `${CLASS_ROOT}__${layer}`;
    let bounds = this.state.bounds;

    let bands = bounds.xAxis.data.map((obj, xIndex) => {
      let classes = [`${className}-xband`];
      if (xIndex === this.state.highlightXIndex) {
        classes.push(`${className}-xband--highlight`);
      }

      // For bar charts, the band is left aligned with the bars.
      let x = this._translateX(obj.value);
      if ('line' === this.props.type || 'area' === this.props.type) {
        // For line and area charts, the band is centered.
        x -= (bounds.stepWidth / 2);
      }

      let onMouseOver;
      let onMouseOut;
      if ('front' === layer) {
        onMouseOver = this._onMouseOver.bind(this, xIndex, obj.label);
        onMouseOut = this._onMouseOut.bind(this, xIndex, obj.label);
      }

      let xBandId = `${this.props.a11yTitleId}_x_band_${xIndex}`;
      let xBandTitleId = `${this.props.a11yTitleId}_x_band_title_${xIndex}`;

      let seriesText = this._highlightSeriesAsString();

      return (
        <g key={xBandId} id={xBandId} className={classes.join(' ')}
          onMouseOver={onMouseOver} onMouseOut={onMouseOut} role="tab"
          aria-labelledby={xBandTitleId}>
          <title id={xBandTitleId}>
            {`${obj.label} ${seriesText}`}
          </title>
          <rect role="presentation" className={`${className}-xband-background`}
            x={x} y={0} width={bounds.stepWidth} height={this.state.height} />
        </g>
      );
    });

    return (
      <g ref={layer} className={className}>
        {bands}
      </g>
    );
  }

  _renderA11YTitle () {
    let a11yTitle = this.props.a11yTitle;
    if (!this.props.a11yTitle) {
      let chartLabel = Intl.getMessage(this.context.intl, 'Chart');
      let typeLabel = Intl.getMessage(this.context.intl, this.props.type);
      a11yTitle = `${typeLabel} ${chartLabel}`;
    }

    return a11yTitle;
  }

  render () {
    let classes = [CLASS_ROOT];
    classes.push(`${CLASS_ROOT}--${this.props.type}`);
    classes.push(`${CLASS_ROOT}--${this.props.orientation}`);
    if (this.state.size) {
      classes.push(`${CLASS_ROOT}--${this.state.size}`);
    }

    let values = [];
    if ('line' === this.props.type || 'area' === this.props.type) {
      values = this._renderLinesOrAreas();
    }

    if (values.length === 0) {
      classes.push(`${CLASS_ROOT}--loading`);
      let valueClasses = [`${CLASS_ROOT}__values`];
      valueClasses.push(`${CLASS_ROOT}__values--loading`);
      valueClasses.push("color-index-loading");
      let commands = "M0," + (this.state.height / 2) +
        " L" + this.state.width + "," + (this.state.height / 2);
      values.push(
        <g key="loading">
          <path stroke="none" className={valueClasses.join(' ')} d={commands} />
        </g>
      );
    }

    let frontBands;
    let activeDescendant;
    let role = 'img';

    let a11yTitle = this._renderA11YTitle();
    let a11yTitleNode;
    if (a11yTitle) {
      a11yTitleNode = (
        <title id={this.props.a11yTitleId}>{a11yTitle}</title>
      );
    }

    let a11yDescNode;
    if (this.props.a11yDesc) {
      a11yDescNode = (
        <desc id={this.props.a11yDescId}>
          {this.props.a11yDesc}
        </desc>
      );
    }

    // Need to adjust this for vertical somehow...
    let viewBox = `0 0 ${this.state.width} ${this.state.height}`;

    return (
      <div className={classes.join(' ')}>
        <svg ref="chart" className={`${CLASS_ROOT}__graphic`}
          viewBox={viewBox}
          preserveAspectRatio="none" role={role} tabIndex="0" 
          aria-activedescendant={activeDescendant}
          aria-labelledby={this.props.a11yTitleId + ' ' + this.props.a11yDescId} >
          {a11yTitleNode}
          {a11yDescNode}
          <g className={`${CLASS_ROOT}__values`}>{values}</g>
          {frontBands}
        </svg>
      </div>
    );
  }

}

Line.propTypes = {
  a11yTitle: PropTypes.string,
  a11yTitleId: PropTypes.string,
  a11yDescId: PropTypes.string,
  a11yDesc: PropTypes.string,
  important: PropTypes.number,
  dispatchBounds: PropTypes.func,
  dispatchValue: PropTypes.func,
  max: PropTypes.number,
  min: PropTypes.number,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  points: PropTypes.bool,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      colorIndex: PropTypes.string,
      onClick: PropTypes.func,
      label: PropTypes.string,
      units: PropTypes.string,
      values: PropTypes.arrayOf(
        PropTypes.number
      ).isRequired
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  smooth: PropTypes.bool,
  type: PropTypes.oneOf(['line', 'area']),
  units: PropTypes.string
};

Line.contextTypes = {
  intl: PropTypes.object
};

Line.defaultProps = {
  a11yTitleId: 'chart-title',
  a11yDescId: 'chart-desc',
  min: 0,
  type: 'line',
  orientation: 'horizontal'
};
