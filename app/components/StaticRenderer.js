import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { CONTAINER, HEADER, PARAGRAPH, IMAGE } from '../base_components';
import { createDraggableComponent } from '../dragManager';
import { actionDispatch } from '../stateManager';

import HorizontalSelect from './HorizontalSelect';

const dragData = {
  dragType: 'addComponent',
  onDrag(props, pos) {
    actionDispatch.setComponentMoveHighlight(pos);
  },
  onEnd(props) {
    actionDispatch.addComponent(props.mComponentData, true);
  },
};

function makeComponentRefCallback(mComponentData) {
  return function (ref) {
    mComponentData._domElements.pageView = ref;
  };
}

const ContainerClassReact = createDraggableComponent(dragData, React.createClass({
  getInitialState() {
    return {
      isExpanded: false,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (this.shouldExpand() && nextProps.isMouseInRenderer && !this.state.isExpanded) {
      this.setState({ isExpanded: true });
    }

    if (this.state.isExpanded && !nextProps.isMouseInRenderer) {
      this.setState({ isExpanded: false });
    }
  },

  shouldExpand() {
    return this.props.mComponentData.getRect('pageView').h < 10;
  },

  render() {
    const { mComponentData, componentProps, isMouseInRenderer, className } = this.props;
    const sx = {};

    const children = _.map(mComponentData.children, function (child) {
      return (
        <MComponentDataRenderer
            key={child.id}
            mComponentData={child}
            componentProps={componentProps}
            isMouseInRenderer={isMouseInRenderer}
        />);
    });

    return (
      <div
          ref={makeComponentRefCallback(mComponentData)}
          style={Object.assign(this.props.sx, sx)}
          onClick={this.props.onClick}
          className={classnames('node_' + mComponentData.id, 'expandable-element', { expanded: this.state.isExpanded }, className)}
      >
        {children}
      </div>
    );
  },
}));

const HeaderClassReact = createDraggableComponent(dragData, React.createClass({
  render() {
    const { mComponentData, className } = this.props;
    return (
      <h1
          ref={makeComponentRefCallback(mComponentData)}
          style={this.props.sx} className={classnames('node_' + mComponentData.id, className)}
          onClick={this.props.onClick}
      >
        {this.props.htmlProperties.text}
      </h1>
    );
  },
}));

const ParagraphClassReact = createDraggableComponent(dragData, React.createClass({
  render() {
    const { mComponentData, className } = this.props;
    return (
      <p
          ref={makeComponentRefCallback(mComponentData)}
          style={this.props.sx} className={classnames('node_' + mComponentData.id, className)}
          onClick={this.props.onClick}
      >
        {this.props.htmlProperties.text}
      </p>
    );
  },
}));

const ImageClassReact = createDraggableComponent(dragData, React.createClass({
  render() {
    const { mComponentData, className } = this.props;
    return (
      <img
          ref={makeComponentRefCallback(mComponentData)}
          style={this.props.sx}
          className={classnames('node_' + mComponentData.id, className)}
          src={mComponentData.attributes.src}
          onClick={this.props.onClick}
      />
    );
  },
}));

/*
   I have a tree of components as data.
   What do I need to do with the components:
   - render them
   - change their properties
   - Rearrange them
   - Compute data from them (ex. drop points)

   Need to seperate the data and the rendering...
 */

function makeClick(component) {
  return function (e) {
    actionDispatch.selectComponent(component);
    e.stopPropagation();
  };
}

const MComponentDataRenderer = function (props) {
  /* TD: expand for custom components */
  const componentType = props.mComponentData.componentType;
  const { htmlProperties, sx } = props.mComponentData.getRenderableProperties();
  let className, component;

  if (props.componentProps.activeComponent) {
    className = { isActive: props.componentProps.activeComponent.id === props.mComponentData.id };
  }

  if (componentType === CONTAINER) {
    component = (<ContainerClassReact
                     className={className}
                     onClick={makeClick(props.mComponentData)}
                     {...props}
                     htmlProperties={htmlProperties}
                     sx={sx}
                 />);
  } else if (componentType === HEADER) {
    component = <HeaderClassReact className={className} onClick={makeClick(props.mComponentData)} {...props} htmlProperties={htmlProperties} sx={sx} />;
  } else if (componentType === PARAGRAPH) {
    component = <ParagraphClassReact className={className} onClick={makeClick(props.mComponentData)} {...props} htmlProperties={htmlProperties} sx={sx} />;
  } else if (componentType === IMAGE) {
    component = <ImageClassReact className={className} onClick={makeClick(props.mComponentData)} {...props} htmlProperties={htmlProperties} sx={sx} />;
  }

  return component;
};


const StaticRenderer = React.createClass({
  getInitialState() {
    return {
      isMouseInRenderer: false,
    };
  },

  mouseMove(e) {
    /*     actionDispatch.setHoveredNodes(e.clientX, e.clientY);*/
  },

  mouseEnter() {
    this.setState({ isMouseInRenderer: true });
  },

  mouseLeave() {
    this.setState({ isMouseInRenderer: false });
  },

  render() {
    const {
      mComponentData,
      activeView,
      page,
      componentProps,
    } = this.props;
    let renderer;

    if (page) {
      renderer = <MComponentDataRenderer mComponentData={page.componentTree} componentProps={componentProps} isMouseInRenderer={this.state.isMouseInRenderer} />;
    }

    return (
      <div className="h-100">
        <HorizontalSelect
            className="ma2"
            onClick={(name) => { actionDispatch.selectView(name); }}
            hasBorder
            activePanel={activeView}
            options={[
              { text: 'None', name: 'NONE' },
              { text: 'Border', name: 'BORDER' },
              { text: 'Detail', name: 'DETAIL' },
            ]}
        />
        <div
            onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave} onMouseMove={this.mouseove} className={classnames('ma2 h-100 ba c-grab', {
                'static-view-border': activeView === 'BORDER',
                'static-view-detail': activeView === 'DETAIL',
              })}
        >
          {renderer}
        </div>
      </div>
    );
  },
});

export default StaticRenderer;
