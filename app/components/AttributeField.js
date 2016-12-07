import React from 'react';
import _ from 'lodash';
import {
    TEXT_FIELD,
    NUMBER,
    COLOR,
    DROPDOWN,
    attributeFieldset
} from '../base_components.js';
import {actionDispatch} from '../stateManager.js';

var TextInput = React.createClass({
    getInitialState: function() {
        return {
            isEditing: false,
            tempText: ''
        }
    },
    startEdit: function() {
        this.setState({
            isEditing: true,
            tempText: this.props.value
        })
    },
    onChange: function (e) {        
        this.setState({tempText: e.target.value});
    },
    submit: function (e) {
        this.setState({
            isEditing: false,
            tempText: ''
        });
        actionDispatch.setComponentAttribute(this.props.component, this.props.attrKey, e.target.value)        
    },
    render: function() {
        var value = this.state.isEditing ? this.state.tempText : this.props.value;
        
        return <input onFocus={this.startEdit} onBlur={this.submit} onChange={this.onChange} type="text" value={value}/>
    }
});

var Dropdown = React.createClass({
    onChange: function (e) {
        actionDispatch.setComponentAttribute(this.props.component, this.props.attrKey, e.target.value)
        
    },
    render: function() {
        var choices = _.map(this.props.choices, function (choice) {
            var value, text;
            
            if (_.isString(choice)) {
                value = choice;
                text = choice;
            } else {
                value = choice.value;
                text = choice.text;
            }
                
            return <option value={value}>{text}</option>
        });
        
        return (
            <select value={this.value} onChange={this.onChange}>
                {choices}
            </select>
        )
    }
})

var AttributeField = React.createClass({
    render: function() {
        var {attrKey, attrVal, component} = this.props;
        var fieldSet = {
            fieldType: TEXT_FIELD
        }
        
        if (attributeFieldset[attrKey]) {
            fieldSet = attributeFieldset[attrKey];
        }

        if (fieldSet.fieldType === TEXT_FIELD) {
            return <TextInput value={attrVal} attrKey={attrKey} component={component}/>;
        } else if (fieldSet.fieldType === DROPDOWN) {
            return <Dropdown value={attrVal} attrKey={attrKey} choices={fieldSet.fieldSettings.choices} component={component}/>;
        }
    }
});

export default AttributeField;
