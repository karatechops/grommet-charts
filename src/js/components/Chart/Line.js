// (C) Copyright 2014 Hewlett Packard Enterprise Development LP

import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import utils from './chart-utils';

const CLASS_ROOT = "chart";

const POINT_RADIUS = 3;

export default class Line extends Component {

  constructor(props) {
    super(props);

    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);
    this._getBoundsGuides = this._getBoundsGuides.bind(this);
    this._stateFromProps = this._stateFromProps.bind(this);

    this.state = this._stateFromProps(props, this.props.defaultWidth, this.props.defaultHeight);
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

    let elem = (this.refs.chart) ? this.refs.chart : null;
    let bounds = utils.bounds(this._getBoundsGuides(elem));

    // normalize size
    let size = props.size ||
      (props.small ? 'small' :
        (props.large ? 'large' : null));
    return {
      bounds: bounds,
      width: width,
      height: height,
      size: size
    };
  }

  _onMouseOver (xIndex, value = -1) {
    // TBD
  }

  _onMouseOut () {
    // TBD
  }

  _onResize () {
    // debounce
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(this._layout, 50);
  }

  // Initial bounds calculations.
  _getBoundsGuides(elem = null) {
    let rect = {
      width: (elem !== null) 
        ? elem.getBoundingClientRect().width : this.props.defaultWidth,
      height: (elem !== null) 
        ? elem.getBoundingClientRect().height : this.props.defaultHeight
    };

    let boundGuides = {
      series: this.props.series,
      width: rect.width,
      height: rect.height,
      min: this.props.min || null,
      max: this.props.max || null,
      orientation: this.props.orientation || 'horizontal',
      points: this.props.points
    };

    return boundGuides;
  }

  // Adjusts layout on re-size.
  _layout () {
    let boundGuides = this._getBoundsGuides(this.refs.chart);

    if (boundGuides.width !== this.state.width || boundGuides.height !== this.state.height) {
      let bounds = utils.bounds(boundGuides);

      this.setState({
        width: boundGuides.width,
        height: boundGuides.height,
        bounds: bounds
      });

      if (this.props.onResize) this.props.onResize(width, boundGuides.height, bounds);
    }
  }

  render () {
    let classes = classnames([
      CLASS_ROOT,
      `${CLASS_ROOT}--${this.props.orientation}`,
      `${CLASS_ROOT}--${this.props.type}`,
      {
        [`${CLASS_ROOT}--${this.state.size}`]: this.state.size
      }
    ]);

    //let lines = utils.getLinePaths(this.state.bounds, this.props);
    // Seperate out Line and Area components when complete.
    let lines = utils.getAreaPaths(this.state.bounds, this.props);
    let lineGroup = (<g>{lines}{points}</g>);

    let points = (this.props.points) 
      ? utils.getPointPaths(this.state.bounds, this.props, POINT_RADIUS)
      : null;

    // Testing circle hotspots over points.
    // This may work for single series charts.
    // Todo: finish rectangle hotspot.
    let hotspots = utils.getPointPaths(this.state.bounds, this.props, 10).map((hotspot) => {
      return hotspot.map((point) => {
        return React.cloneElement(point, {
          onClick: this.props.onClick,
          onMouseOver: this.props.onMouseOver
        });
      });
    });
    let hotspotGroup = (<g>{hotspots}</g>);

    //let rectangleHotpsots = utils.getHotspots(this.state.bounds, this.props, this.props.a11yTitleId);

    let activeDescendant;
    let role = 'img';

    let a11yTitle = utils.getA11YTitle(this.props.a11yTitle, this.context.intl, 'line');
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

    let viewBox = `0 0 ${this.state.width} ${this.state.height}`;

    return (
      <div className={classes}>
        <svg ref="chart" className={`${CLASS_ROOT}__graphic`}
          viewBox={viewBox}
          preserveAspectRatio="none" role={role} tabIndex="0" 
          aria-activedescendant={activeDescendant}
          aria-labelledby={this.props.a11yTitleId + ' ' + this.props.a11yDescId} >
          {a11yTitleNode}
          {a11yDescNode}
          <g className={`${CLASS_ROOT}__values`}>{lineGroup}</g>
          <g className={`${CLASS_ROOT}__hotspots`}>{hotspotGroup}</g>
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
  defaultHeight: PropTypes.number,
  defaultWidth: PropTypes.number,
  important: PropTypes.number,
  onResize: PropTypes.func,
  onMouseOver: PropTypes.func,
  max: PropTypes.number,
  min: PropTypes.number,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  onClick: PropTypes.func,
  points: PropTypes.bool,
  pointsRadius: PropTypes.number,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      colorIndex: PropTypes.string,
      onClick: PropTypes.func,
      label: PropTypes.string,
      units: PropTypes.string,
      values: PropTypes.arrayOf(
        PropTypes.number
      ).isRequired,
      axisValues: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      )
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  smooth: PropTypes.bool
};

Line.contextTypes = {
  intl: PropTypes.object
};

Line.defaultProps = {
  a11yTitleId: 'chart-title',
  a11yDescId: 'chart-desc',
  defaultHeight: 192,
  defaultWidth: 392,
  min: 0,
  orientation: 'horizontal',
  pointsRadius: 3
};
