const { React, getModuleByDisplayName } = require('ac/webpack');

module.exports = class SliderItem extends React.Component {
  constructor () {
    super();

    this.state = {
      percentage: 62
    };
  }

  render () {
    const Slider = getModuleByDisplayName('slider');

    return (
      <div class='item-1Yvehc itemSlider-FZeYw0'>
        <div class='label-JWQiNe'>{this.props.item.name}</div>

        <Slider
          mini={true}
          handleSize={16}
          className='slider-3BOep7'
          defaultValue={this.props.item.defaultValue}
          minValue={0}
          maxValue={100}
          disabled={false}
          stickToMarkers={false}
          onValueChange={this.props.item.onValueChange}
        />
      </div>
    );
  }
}