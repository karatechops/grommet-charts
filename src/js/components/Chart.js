// (C) Copyright 2014 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Legend from 'grommet/components/Legend';
import Intl from 'grommet/utils/Intl';
import KeyboardAccelerators from 'grommet/utils/KeyboardAccelerators';

const CLASS_ROOT = "chart";

const DEFAULT_WIDTH = 384;
const DEFAULT_HEIGHT = 192;
const XAXIS_HEIGHT = 24;
const YAXIS_WIDTH = 12;
const BAR_PADDING = 2;
const MIN_LABEL_WIDTH = 48;
const SPARKLINE_STEP_WIDTH = 6;
const SPARKLINE_BAR_PADDING = 1;
const POINT_RADIUS = 6;
const BAR_SEGMENT_HEIGHT = 18; // 12 + 6 tied to stroke-dashoffset in CSS

export default class Chart extends Component {

  constructor(props) {
    super(props);

    this.state = {
      highlightXindex: 0
    };

    this._onRequestForNextLegend = this._onRequestForNextLegend.bind(this);
    this._onRequestForPreviousLegend = this._onRequestForPreviousLegend.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);

    this.state = this._stateFromProps(props, DEFAULT_WIDTH, DEFAULT_HEIGHT);
  }

  componentDidMount () {
    window.addEventListener('resize', this._onResize);
    this._onResize();

    //only add listerners if graph is interactive
    if (this.props.legend) {
      this._keyboardHandlers = {
        left: this._onRequestForPreviousLegend,
        up: this._onRequestForPreviousLegend,
        right: this._onRequestForNextLegend,
        down: this._onRequestForNextLegend
      };
      KeyboardAccelerators.startListeningToKeyboard(
        this, this._keyboardHandlers
      );
    }
  }

  componentWillReceiveProps (newProps) {
    console.log('newProps', newProps);
    // This overides highlightXIndex. Need to fix this or _stateFromProps
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

    if (this.props.legend) {
      KeyboardAccelerators.stopListeningToKeyboard(
        this, this._keyboardHandlers
      );
    }
  }

  _onRequestForNextLegend (event) {
    if (document.activeElement === this.refs.chart) {
      event.preventDefault();
      let totalBandCount = (
        ReactDOM.findDOMNode(this.refs.front).childNodes.length
      );

      if (this.state.highlightXIndex - 1 < 0) {
        this._onMouseOver(totalBandCount - 1);
      } else {
        this._onMouseOver(this.state.highlightXIndex - 1);
      }

      //stop event propagation
      return true;
    }
    return null;
  }

  _onRequestForPreviousLegend (event) {
    if (document.activeElement === this.refs.chart) {
      event.preventDefault();
      let totalBandCount = (
        ReactDOM.findDOMNode(this.refs.front).childNodes.length
      );

      if (this.state.highlightXIndex + 1 >= totalBandCount) {
        this._onMouseOver(0);
      } else {
        this._onMouseOver(this.state.highlightXIndex + 1);
      }

      //stop event propagation
      return true;
    }
    return null;
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
  _bounds (series, xAxisArg, width, height) {
    // normalize xAxis
    let xAxis;
    if (xAxisArg) {
      if (xAxisArg.data) {
        xAxis = xAxisArg;
      } else {
        xAxis = {
          data: xAxisArg,
          placement: 'top'
        };
      }
    } else {
      xAxis = {data: []};
    }

    // analyze series data
    let minX = null;
    let maxX = null;
    let minY = null;
    let maxY = null;

    series.forEach((item) => {
      item.values.forEach((value, xIndex) => {
        let x, y;
        if (Array.isArray(value)) {
          x = value[0];
          y = value[1];
        } else {
          x = value.x;
          y = value.y;
        }

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
        if (xIndex >= xAxis.data.length) {
          xAxis.data.push({value: x, label: ''});
        }
      });
    });

    if (null === minX) {
      minX = 0;
      maxX = 1;
      minY = 0;
      maxY = 100;
    }

    if ('bar' === this.props.type) {
      xAxis.data.forEach((obj, xIndex) => {
        let sumY = 0;
        series.forEach((item) => {
          const value = item.values[xIndex];
          const y = (Array.isArray(value) ? value[1] : value.y);
          sumY += y;
        });
        maxY = Math.max(maxY, sumY);
      });
    }

    if (this.props.threshold) {
      minY = Math.min(minY, this.props.threshold);
      maxY = Math.max(maxY, this.props.threshold);
    }
    if (this.props.thresholds) {
      this.props.thresholds.forEach((obj) => {
        maxY = Math.max(maxY, obj.value);
      });
    }
    if (this.props.hasOwnProperty('min')) {
      minY = this.props.min;
    }
    if (this.props.hasOwnProperty('max')) {
      maxY = this.props.max;
    }
    let spanX = maxX - minX;
    let spanY = maxY - minY;

    if (this.props.sparkline) {
      width = spanX * (SPARKLINE_STEP_WIDTH + SPARKLINE_BAR_PADDING);
    }

    let graphWidth = width;
    let graphHeight = height;
    if (this.props.legend && 'inline' === this.props.legend.position) {
      // provides a buffer at the top of the graph to ensure
      // none of the labels are cutoff by the bounds
      graphHeight -= XAXIS_HEIGHT;
    }
    if (this.props.thresholds) {
      graphWidth -= YAXIS_WIDTH;
    }
    if (xAxis.placement) {
      graphHeight -= XAXIS_HEIGHT;
    }

    let graphTop = ('top' === xAxis.placement ? XAXIS_HEIGHT : 0);
    // graphBottom is the bottom graph Y value
    let graphBottom = ('bottom' === xAxis.placement ?
      (height - XAXIS_HEIGHT) : height);

    let graphLeft = 0;
    let graphRight = graphWidth;
    if (this.props.points) {
      graphLeft += POINT_RADIUS + 2;
      graphRight -= POINT_RADIUS + 2;
    }

    let scaleX = (graphWidth / spanX);
    let xStepWidth = Math.round(graphWidth / (xAxis.data.length - 1));
    if ('bar' === this.props.type) {
      // allow room for bar width for last bar
      scaleX = (graphWidth / (spanX + (spanX / (xAxis.data.length - 1))));
      xStepWidth = Math.round(graphWidth / xAxis.data.length);
    }
    let scaleY = (graphHeight / spanY);
    let barPadding = Math.max(BAR_PADDING, Math.round(xStepWidth / 8));
    if (this.props.sparkline) {
      xStepWidth = SPARKLINE_STEP_WIDTH;
      barPadding = SPARKLINE_BAR_PADDING;
    }

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
      xStepWidth: xStepWidth,
      barPadding: barPadding,
      xAxis: xAxis
    };

    return result;
  }

  // Aligns the legend with the current position of the cursor, if any.
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
      let bounds = this._bounds(this.props.series, this.props.xAxis,
        rect.width, rect.height);

      let width = rect.width;
      if (this.props.sparkline) {
        width = bounds.graphWidth;
      }

      this.setState({
        width: width,
        height: rect.height,
        bounds: bounds
      });

      if (this.props.dispatchBounds) this.props.dispatchBounds(width, rect.height, bounds);
    }
  }

  // Generates state based on the provided props.
  _stateFromProps (props, width, height) {

    let bounds = this._bounds(props.series, props.xAxis, width, height);
    let defaultXIndex = 0;
    if (props.series && props.series.length > 0) {
      defaultXIndex = 0;
    }
    if (props.hasOwnProperty('important')) {
      defaultXIndex = props.important;
    }
    
    console.log('state', this.state);
    /*let highlightXIndex = (this.state === undefined) 
      ? defaultXIndex : this.state.highlightXIndex;*/
    //let highlightXIndex = (this.state) ? this.state.highlightXIndex : defaultXIndex;
    //let highlightXIndex = defaultXIndex;
    /*if (this.state && this.state.highlightXIndex >= 0) {
    console.log('state from props state highlight index**', this.state.highlightXIndex);
      highlightXIndex = this.state.highlightXIndex;
    }*/

    //if (highlightXIndex === null) highlightXIndex = defaultXindex;

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

  // Translates X value to X coordinate.
  _translateX (x) {
    let bounds = this.state.bounds;
    //console.log('bounds', bounds)
    return Math.max(bounds.graphLeft,
      Math.min(bounds.graphRight, Math.round((x - bounds.minX) * bounds.scaleX)));
  }

  // Translates Y value to Y coordinate.
  _translateY (y) {
    let bounds = this.state.bounds;
    // leave room for line width since strokes are aligned to the center
    return Math.max(1,
      (bounds.graphBottom - Math.max(1, this._translateHeight(y))));
  }

  // Translates Y value to graph height.
  _translateHeight (y) {
    let bounds = this.state.bounds;
    return Math.round((y - bounds.minY) * bounds.scaleY);
  }

  // Translates X and Y values to X and Y coordinates.
  _coordinates (value) {
    let x, y;
    if (Array.isArray(value)) {
      x = value[0];
      y = value[1];
    } else {
      x = value.x;
      y = value.y;
    }
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
      let coordinates = item.values.map((value) => {
        return this._coordinates(value);
      });

      let colorIndex = this._itemColorIndex(item, seriesIndex);
      let commands = null;
      let controlCoordinates = null;
      let previousControlCoordinates = null;
      let points = [];

      // Build the commands for this set of coordinates.
      coordinates.forEach((coordinate, index) => {
        if (this.props.smooth) {
          controlCoordinates = this._controlCoordinates(coordinates, index);
        }

        // Lower top most coordinates to accommodate points.
        if (this.props.points && coordinate[1] <= 1) coordinate[1] = coordinate[1] + POINT_RADIUS;

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

  // Converts the series data into rects for bar types.
  _renderBars () {
    const { segmented } = this.props;
    const { bounds } = this.state;

    let values = bounds.xAxis.data.map((obj, xIndex) => {
      let baseY = bounds.minY;
      let legend = [];
      //console.log(this.props.series);
      let stepBars = this.props.series.map((item, seriesIndex) => {
        let colorIndex;
        if (item.colorIndex === 'step') {
          colorIndex = `graph-${(xIndex + 1)}`;
        } else if (item.colorIndex !== 'step' && item.colorIndex !== undefined) {
          colorIndex = item.colorIndex;
        } else {
          colorIndex = `graph-${(seriesIndex + 1)}`; 
        }

        //const colorIndex = item.colorIndex || `graph-${(seriesIndex + 1)}`;
        const value = item.values[xIndex];
        let valueX, valueY;
        if (Array.isArray(value)) {
          valueX = value[0];
          valueY = value[1];
        } else {
          valueX = value.x;
          valueY = value.y;
        }
        let stepBarHeight = this._translateHeight(valueY);
        let stepBarBase = this._translateHeight(baseY);
        baseY += valueY;

        let itemValue = Array.isArray(item.values[this.state.highlightXIndex]) 
          ? value[1]
          : value.y;

        let classes = [`${CLASS_ROOT}__values-bar`, `color-index-${colorIndex}`];
        /*if (! this.props.legend ||
          'inline' === this.props.legend.position ||
          xIndex === this.state.highlightXIndex) {
          console.log(this.state);
          classes.push(`${CLASS_ROOT}__values-bar--highlight`);
        }*/
        if (xIndex === this.state.highlightXIndex) {
          classes.push(`${CLASS_ROOT}__values-bar--highlight`);
        }
        if (value.onClick) {
          classes.push(`${CLASS_ROOT}__values-bar--active`);
        }

        if ('bottom' === bounds.xAxis.placement) {
          stepBarBase += XAXIS_HEIGHT;
        }

        const width = bounds.xStepWidth - (2 * bounds.barPadding);
        const x = (this._translateX(valueX) + bounds.barPadding) +
          (width / 2);
        if (segmented) {
          stepBarBase =
            Math.floor(stepBarBase / BAR_SEGMENT_HEIGHT) * BAR_SEGMENT_HEIGHT;
          stepBarHeight =
            Math.floor(stepBarHeight / BAR_SEGMENT_HEIGHT) * BAR_SEGMENT_HEIGHT;
        }
        const y = this.state.height - (stepBarHeight + stepBarBase);

        if (this.props.legend && 'inline' === this.props.legend.position) {
          legend.push(
            <text key={'bar-value_' + item.label || seriesIndex}
              x={x} y={y} role="presentation" textAnchor="middle" fontSize={24}>
              {itemValue}
            </text>
          );
        }

        return (
          <line key={'bar_' + item.label || seriesIndex}
            className={classes.join(' ')}
            x1={x} y1={y + stepBarHeight} x2={x} y2={y}
            data-value={itemValue}
            strokeWidth={width} onClick={value.onClick} onMouseOver={this._onMouseOver.bind(this, xIndex, itemValue)}/>
        );
      });

      return (
        <g key={'bar_' + xIndex}>
          {stepBars}
          {legend}
        </g>
      );
    });

    return values;
  }

  // Converts the threshold value into a line.
  _renderThreshold () {
    let y = this._translateY(this.props.threshold);
    let commands = 'M0,' + y + 'L' + this.state.width + ',' + y;
    return (
      <g className={`${CLASS_ROOT}__threshold`} role="presentation">
        <path fill="none" d={commands} />
      </g>
    );
  }

  _labelPosition (valueX, bounds) {
    let x = this._translateX(valueX);
    let startX = x;
    let anchor;
    if ('line' === this.props.type || 'area' === this.props.type) {
      // Place the text in the middle for line and area type charts.
      anchor = 'middle';
      startX = x - (MIN_LABEL_WIDTH / 2);
    }
    if (this.props.points && x <= POINT_RADIUS + 2 || x <= 0) {
      x = 0;
      startX = x;
      anchor = 'start';
    }
    if (x >= (bounds.graphWidth - MIN_LABEL_WIDTH)) {
      // This is the last data point, align the text to the right edge.
      x = bounds.graphWidth;
      startX = x - MIN_LABEL_WIDTH;
      anchor = 'end';
    } else if ('bar' === this.props.type) {
      x += bounds.barPadding;
      startX = x;
    }
    return {x: x, anchor: anchor, startX: startX, endX: startX + MIN_LABEL_WIDTH};
  }

  _labelOverlaps (pos1, pos2) {
    return (pos1 && pos2 && pos1.endX > pos2.startX && pos1.startX < pos2.endX);
  }

  // Converts the xAxis labels into texts.
  _renderXAxis () {
    let bounds = this.state.bounds;
    let labelY;

    // What's happening here?
    if ('bottom' === bounds.xAxis.placement) {
      labelY = this.state.height - Math.round(XAXIS_HEIGHT * 0.3);
    } else {
      labelY = Math.round(XAXIS_HEIGHT * 0.6);
    }

    let priorPosition = null;
    let highlightPosition = null;
    if (this.state.highlightXIndex >= 0 &&
      bounds.xAxis.data.length > this.state.highlightXIndex) {
      highlightPosition =
        this._labelPosition(bounds.xAxis.data[this.state.highlightXIndex].value, bounds);
    }
    let lastPosition = null;
    if (bounds.xAxis.data.length > 0) {
      lastPosition =
        this._labelPosition(bounds.xAxis.data[bounds.xAxis.data.length - 1].value, bounds);
    }
    let labels = bounds.xAxis.data.map((obj, xIndex) => {
      let classes = [`${CLASS_ROOT}__xaxis-index`];
      if (xIndex === this.state.highlightXIndex) {
        classes.push(`${CLASS_ROOT}__xaxis-index--highlight`);
      }
      let position = this._labelPosition(obj.value, bounds);
      // Ensure we don't overlap labels. But, make sure we show the first and
      // last ones.
      if (this._labelOverlaps(position, highlightPosition) ||
        (xIndex !== 0 && xIndex !== (bounds.xAxis.data.length - 1) &&
          (this._labelOverlaps(position, priorPosition) ||
          this._labelOverlaps(position, lastPosition)))) {
        classes.push(`${CLASS_ROOT}__xaxis-index--eclipse`);
      } else {
        priorPosition = position;
      }

      let labelMarker;
      if (this.props.labelMarkers) {
        let markerX = position.x;
        if (xIndex === 0) {
          markerX = markerX - (POINT_RADIUS + 2);
        } else if (xIndex === bounds.xAxis.data.length - 1) {
          markerX = markerX + (POINT_RADIUS + 2);
        }

        labelMarker = (<line 
          x1={markerX} x2={markerX} 
          y1={this.props.xAxis.placement === 'bottom' ? labelY - 16 : labelY + 2}
          y2={this.props.xAxis.placement === 'bottom' ? labelY - 20 : labelY + 6}
          className={`${CLASS_ROOT}__label-marker`} />);
      }

      return (
        <g key={'x_axis_' + xIndex} className={classes.join(' ')}>
          <text x={position.x} y={labelY} role="presentation"
            textAnchor={position.anchor} fontSize={16}>
            {obj.label}
          </text>
          {labelMarker}
        </g>
      );
    });

    return (
      <g ref="xAxis" className={`${CLASS_ROOT}__xaxis`}>
        {labels}
      </g>
    );
  }

  // Vertical bars for thresholds.
  _renderYAxis () {
    let bounds = this.state.bounds;
    let start = bounds.minY;
    let end;
    let width = Math.max(4, YAXIS_WIDTH / 2);

    let bars = this.props.thresholds.map((item, index) => {
      let classes = [`${CLASS_ROOT}__bar`];
      classes.push(`color-index-${(item.colorIndex || ('graph-' + (index + 1)))}`);
      if (index < (this.props.thresholds.length - 1)) {
        end = this.props.thresholds[index + 1].value;
      } else {
        end = bounds.maxY;
      }
      let height = this._translateHeight(end - start);
      let y = this._translateY(end);
      start = end;

      return (
        <rect key={'y_rect_' + index}
          className={classes.join(' ')}
          x={this.state.width - width}
          y={y}
          width={width}
          height={height} />
      );
    });

    return (
      <g ref="yAxis" className={`${CLASS_ROOT}__yaxis`}>
        {bars}
      </g>
    );
  }

  _highlightSeriesAsString () {
    let total = 0;
    let seriesText = this._getHighlightSeries().map((currentSeries) => {
      total += currentSeries.value;

      let stringify = [
        currentSeries.label
      ];

      if (currentSeries.value !== undefined) {
        stringify.push(': ' + currentSeries.value);

        if (currentSeries.units) {
          stringify.push(' ' + currentSeries.units);
        }
      }

      return stringify.join('');
    }).join('; ');

    let totalText = '';
    if (this.props.legend.total) {
      let totalMessage = Intl.getMessage(this.context.intl, 'Total');
      totalText = totalMessage + ': ' + total + this.props.units || '';
      seriesText += ', ' + totalText;
    }

    return seriesText;
  }

  // Create vertical rects for each X data point.
  // These are used to track the mouse hover.
  _renderXBands (layer) {
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
        x -= (bounds.xStepWidth / 2);
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
            x={x} y={0} width={bounds.xStepWidth} height={this.state.height} />
        </g>
      );
    });

    return (
      <g ref={layer} className={className}>
        {bands}
      </g>
    );
  }

  // Converts the highlight X index to a line.
  _renderCursor () {
    let bounds = this.state.bounds;
    let value = this.props.series[0].values[this.state.highlightXIndex];
    let coordinates = this._coordinates(value);
    if ('bar' === this.props.type) {
      coordinates[0] += this.state.bounds.barPadding;
    }
    // Offset it just a little if it is at an edge.
    let x = Math.max(1, Math.min(coordinates[0], this.state.bounds.graphWidth - 1));
    let line = (
      <line fill="none" x1={x} y1={bounds.graphTop} x2={x} y2={bounds.graphBottom} />
    );

    let points;
    if (this.props.points) {
      // for area and line charts, include a dot at the intersection
      if ('line' === this.props.type || 'area' === this.props.type) {
        points = this.props.series.map((item, seriesIndex) => {
          value = item.values[this.state.highlightXIndex];
          coordinates = this._coordinates(value);
          let colorIndex = this._itemColorIndex(item, seriesIndex);

          // Lower top most coordinates to accommodate points.
          if (this.props.points && coordinates[1] <= 1) coordinates[1] = coordinates[1] + POINT_RADIUS;
          
          return (
            <circle key={seriesIndex}
              className={`${CLASS_ROOT}__cursor-point color-index-${colorIndex}`}
              cx={x} cy={coordinates[1]} r={Math.round(POINT_RADIUS * 1.2)} />
          );
        });
      }
    }

    return (
      <g ref="cursor" role="presentation" className={`${CLASS_ROOT}__cursor`}>
        {line}
        {points}
      </g>
    );
  }

  _getHighlightSeries (addColorIndex) {
    return this.props.series.map((item) => {

      let itemValue;
      if (this.state.highlightXindex !== undefined) {
        itemValue = Array.isArray(item.values[this.state.highlightXIndex]) 
          ? item.values[this.state.highlightXIndex][1]
          : item.values[this.state.highlightXIndex].y;
      } else {
        itemValue = 0;
      }

      let datum = {
        value: itemValue,
        units: item.units || this.props.units
      };
      // only show label and swatch if we have more than one series
      if (this.props.series.length > 1) {
        datum.label = item.label;
        if (addColorIndex) {
          datum.colorIndex = item.colorIndex;
        }
      }
      return datum;
    });
  }

  // Builds a Legend appropriate for the currently highlight X index.
  _renderLegend () {
    let highlightSeries = this._getHighlightSeries(true);
    let classes = [
      `${CLASS_ROOT}__legend`,
      `${CLASS_ROOT}__legend--${(this.props.legend.position || 'overlay')}`
    ];

    return (
      <Legend ref="legend" className={classes.join(' ')}
        series={highlightSeries}
        total={this.props.legend.total}
        units={this.props.units} />
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
    if (this.state.size) {
      classes.push(`${CLASS_ROOT}--${this.state.size}`);
    }
    if (this.props.segmented) {
      classes.push(`${CLASS_ROOT}--segmented`);
    }
    if (this.props.sparkline) {
      classes.push(`${CLASS_ROOT}--sparkline`);
    }

    let values = [];
    if ('line' === this.props.type || 'area' === this.props.type) {
      values = this._renderLinesOrAreas();
    } else if ('bar' === this.props.type) {
      values = this._renderBars();
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

    let threshold = null;
    if (this.props.threshold) {
      threshold = this._renderThreshold();
    }

    let cursor = null;
    let legend = null;
    if (this.props.legend && 'inline' !== this.props.legend.position &&
      this.state.highlightXIndex >= 0 &&
      this.props.series[0].values.length > 0) {
      cursor = this._renderCursor();
      legend = this._renderLegend();
    }

    let xAxis = null;
    if (this.props.xAxis) {
      xAxis = this._renderXAxis();
    }

    let yAxis = null;
    if (this.props.thresholds) {
      yAxis = this._renderYAxis();
    }

    let frontBands;
    let activeDescendant;
    let role = 'img';
    if (this.props.legend) {
      frontBands = this._renderXBands('front');
      activeDescendant = (
        `${this.props.a11yTitleId}_x_band_${this.state.highlightXIndex}`
      );
      role = 'tablist';
    }

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

    return (
      <div className={classes.join(' ')}>
        <svg ref="chart" className={`${CLASS_ROOT}__graphic`}
          viewBox={`0 0 ${this.state.width} ${this.state.height}`}
          preserveAspectRatio="none" role={role} tabIndex="0"
          aria-activedescendant={activeDescendant}
          aria-labelledby={this.props.a11yTitleId + ' ' + this.props.a11yDescId}>
          {a11yTitleNode}
          {a11yDescNode}
          {xAxis}
          {yAxis}
          <g className={`${CLASS_ROOT}__values`}>{values}</g>
          {frontBands}
          {threshold}
          {cursor}
        </svg>
        {legend}
      </div>
    );
  }

}

Chart.propTypes = {
  a11yTitle: PropTypes.string,
  a11yTitleId: PropTypes.string,
  a11yDescId: PropTypes.string,
  a11yDesc: PropTypes.string,
  important: PropTypes.number,
  dispatchBounds: PropTypes.func,
  dispatchValue: PropTypes.func,
  legend: PropTypes.shape({
    position: PropTypes.oneOf(['overlay', 'after', 'inline']),
    total: PropTypes.bool
  }),
  max: PropTypes.number,
  min: PropTypes.number,
  points: PropTypes.bool,
  segmented: PropTypes.bool,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      colorIndex: PropTypes.string,
      onClick: PropTypes.func,
      label: PropTypes.string,
      units: PropTypes.string,
      values: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.oneOfType([
              PropTypes.number,
              PropTypes.object // Date
            ])
          ),
          PropTypes.shape({
            onHover: PropTypes.func,
            onClick: PropTypes.func,
            x: PropTypes.oneOfType([
              PropTypes.number,
              PropTypes.object // Date
            ]).isRequired,
            y: PropTypes.number.isRequired
          })
        ])
      ).isRequired
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  smooth: PropTypes.bool,
  sparkline: PropTypes.bool,
  threshold: PropTypes.number,
  thresholds: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.number.isRequired,
    colorIndex: PropTypes.string
  })),
  type: PropTypes.oneOf(['line', 'bar', 'area']),
  units: PropTypes.string,
  labelMarkers: PropTypes.bool,
  xAxis: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.object // Date
      ]).isRequired,
      label: PropTypes.string.isRequired
    })),
    PropTypes.shape({
      placement: PropTypes.oneOf(['top', 'bottom']),
      data: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.object // Date
        ]).isRequired,
        label: PropTypes.string.isRequired
      }).isRequired)
    })
  ])
};

Chart.contextTypes = {
  intl: PropTypes.object
};

Chart.defaultProps = {
  a11yTitleId: 'chart-title',
  a11yDescId: 'chart-desc',
  min: 0,
  type: 'line',
  labelMarkers: false
};
