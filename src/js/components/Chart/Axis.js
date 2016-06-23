import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

const CLASS_ROOT = "axis";
const MARKER_SIZE = 4;
// Ideally we could avoid the below constants
// and let css define.
const FONT_SIZE = 14;
const DEFAULT_PADDING = 50;

export default class Axis extends Component {
  constructor(props) {
    super(props);
    this._renderLines = this._renderLines.bind(this);
    this._renderText = this._renderText.bind(this);
  }

  _renderText(labels, count) {
    let text = labels.map((label, index) => {
      // Check if label's position is within our range.
      if (label.position - 1 <= count && label.position >= 1) {
        let labelOffset = 0;
        let labelPosition = label.position - 1;

        // Determine offsets to keep text aligned on markers.
        let textAnchor = "end";
        if (labelPosition === 0) {
          labelOffset = (this.props.layout === 'horizontal') 
          ? labelOffset + (FONT_SIZE) + 3
          : 0;
          if (this.props.layout === 'vertical') textAnchor = "end";
        } else if (labelPosition > 0 && labelPosition < count) {
          labelOffset = 5;
        } else if (labelPosition === count) {
          labelOffset = (this.props.layout === 'vertical') 
            ? FONT_SIZE - 2 : -5;
        }
        
        // Gather distance of label to travel.
        let distance = this.props.distance;

        // Adjust text position based on layout.
        let textPos = (this.props.layout === 'vertical') 
          ? ((distance/(count)) * (count - labelPosition)) + labelOffset
          : ((distance/(count)) * (labelPosition)) + labelOffset;

        // Set x and y coords for text.
        let x = (this.props.layout === 'vertical')
          ? this.props.textPadding - MARKER_SIZE - 10 
          : textPos;
        let y = (this.props.layout === 'vertical') 
          ? textPos 
          : this.props.textPadding - MARKER_SIZE - 10;

        return(
          <text key={`${CLASS_ROOT}__label-text-${index}`}
            x={x}
            y={y} 
            role="presentation" 
            className={`${CLASS_ROOT}__label-text`}
            textAnchor={textAnchor} fontSize={FONT_SIZE}>
            {label.value}
          </text>
        );
      }
      return null;
    });

    return text;
  }

  _renderLines(nodeHeight, nodeWidth, count) {
    let lines = [];
    let stepIncrement = 0;

    // Setup initial SVG line array.
    for (i = 0; i <= count; i++) { 
      let increment = (stepIncrement === 0) ? 1 : stepIncrement;
      let x1 = (this.props.layout === 'vertical') 
        ? this.props.textPadding : increment;
      let x2 = (this.props.layout === 'vertical') 
        ? this.props.textPadding - MARKER_SIZE : increment;
      let y1 = (this.props.layout === 'vertical') 
        //? increment : this.props.textPadding; // Todo: top align
        ? increment : 0;
      let y2 = (this.props.layout === 'vertical') 
        //? increment : this.props.textPadding - MARKER_SIZE; // Todo: top align
        ? increment : 0 + MARKER_SIZE;
      let distance = (this.props.layout === 'vertical') 
        ? nodeHeight : nodeWidth;

      lines.push(
        <line key={`${CLASS_ROOT}__label-marker-${i}`}
        x1={x1} x2={x2} 
        y1={y1} y2={y2}
        className={`${CLASS_ROOT}__label-marker`} />);

      stepIncrement = stepIncrement + distance/(count);
    }

    return lines;
  }

  render() {

    let classes = classnames([
      CLASS_ROOT,
      `${CLASS_ROOT}--${this.props.layout}`
    ]);
    let textPadding = this.props.textPadding;

    let width = (this.props.layout === 'vertical') 
      ? textPadding
      : this.props.distance;
    let height = (this.props.layout === 'vertical') 
      ? this.props.distance
      : textPadding;

    let lines = this._renderLines(height, width, this.props.count - 1);
    let text = this._renderText(this.props.label, this.props.count - 1);

    return (
      <div className={classes}>
        <svg
          style={{height: height, width: width, overflow:'hidden', maxWidth:'100%'}}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none">
          <g>
            {lines}
            {text}
          </g>
        </svg>
      </div>
    );
  }
};

Axis.PropTypes = {
  count: PropTypes.number,
  label: PropTypes.arrayOf(PropTypes.shape({
    position: PropTypes.number.isRequired,
    value: PropTypes.string.isRequired
  })),
  textPadding: PropTypes.number,
  distance: PropTypes.number,
  layout: PropTypes.oneOf(['horizontal', 'vertical'])
};

Axis.defaultProps = {
  count: 5,
  textPadding: DEFAULT_PADDING,
  distance: DEFAULT_PADDING,
  layout: 'vertical'
};
