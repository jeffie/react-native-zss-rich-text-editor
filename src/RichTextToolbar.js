import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ListView, View, TouchableOpacity, Image, StyleSheet, Dimensions} from 'react-native';
import {actions} from './const';
const {height, width} = Dimensions.get('window');

const defaultActions = [
    actions.insertImage,
    actions.setBold,
    actions.setItalic,
    actions.insertBulletsList,
    actions.insertOrderedList,
    actions.insertLink
];

function getDefaultIcon() {
    const texts = {};
    texts[actions.insertImage] = require('../img/photo.png');
    texts[actions.setBold] = require('../img/bold.png');
    texts[actions.setItalic] = require('../img/ital.png');
    texts[actions.insertBulletsList] = require('../img/ul.png');
    texts[actions.insertOrderedList] = require('../img/ol.png');
    texts[actions.insertLink] = require('../img/link.png');
    return texts;
}

function getDefaultSelectedIcon() {
    const texts = {};
    texts[actions.insertImage] = require('../img/photo-in.png');
    texts[actions.setBold] = require('../img/bold-in.png');
    texts[actions.setItalic] = require('../img/ital-in.png');
    texts[actions.insertBulletsList] = require('../img/ul-in.png');
    texts[actions.insertOrderedList] = require('../img/ol-in.png');
    texts[actions.insertLink] = require('../img/link-in.png');
    return texts;
}


export default class RichTextToolbar extends Component {

    static propTypes = {
        getEditor: PropTypes.func.isRequired,
        actions: PropTypes.array,
        onPressAddLink: PropTypes.func,
        onPressAddImage: PropTypes.func,
        selectedButtonStyle: PropTypes.object,
        iconTint: PropTypes.any,
        selectedIconTint: PropTypes.any,
        unselectedButtonStyle: PropTypes.object,
        renderAction: PropTypes.func,
        iconMap: PropTypes.object,
    };

    constructor(props) {
        super(props);
        const actions = this.props.actions ? this.props.actions : defaultActions;
        this.state = {
            editor: undefined,
            selectedItems: [],
            actions,
            ds: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows(this.getRows(actions, []))
        };
    }

    componentDidReceiveProps(newProps) {
        const actions = newProps.actions ? newProps.actions : defaultActions;
        this.setState({
            actions,
            ds: this.state.ds.cloneWithRows(this.getRows(actions, this.state.selectedItems))
        });
    }

    getRows(actions, selectedItems) {
        return actions.map((action) => {
            return {action, selected: selectedItems.includes(action)};
        });
    }

    componentDidMount() {
        const editor = this.props.getEditor();
        if (!editor) {
            throw new Error('Toolbar has no editor!');
        } else {
            editor.registerToolbar((selectedItems) => this.setSelectedItems(selectedItems));
            this.setState({editor});
        }
    }

    setSelectedItems(selectedItems) {
        if (selectedItems !== this.state.selectedItems) {
            this.setState({
                selectedItems,
                ds: this.state.ds.cloneWithRows(this.getRows(this.state.actions, selectedItems))
            });
        }
    }

    _getButtonSelectedStyle() {
        return this.props.selectedButtonStyle ? this.props.selectedButtonStyle : styles.defaultSelectedButton;
    }

    _getButtonUnselectedStyle() {
        return this.props.unselectedButtonStyle ? this.props.unselectedButtonStyle : styles.defaultUnselectedButton;
    }

    _getButtonIcon(action, selected) {
        if (this.props.iconMap && this.props.iconMap[action]) {
            return this.props.iconMap[action];
        } else if (getDefaultIcon()[action]) {
            if (selected) {
                return getDefaultSelectedIcon()[action];
            }
            return getDefaultIcon()[action];
        } else {
            return undefined;
        }
    }

    _defaultRenderAction(action, selected) {
        const icon = this._getButtonIcon(action, selected);
        return (
            <TouchableOpacity
                key={action}
                style={
                    {height: 27, width: width / 6, justifyContent: 'center', alignItems:'center'}}
                onPress={() => this._onPress(action)}
            >
                {icon ? <Image source={icon} style={{height: 27, width: 27,}}/> : null}
            </TouchableOpacity>
        );
    }

    _renderAction(action, selected) {
        return this.props.renderAction ?
            this.props.renderAction(action, selected) :
            this._defaultRenderAction(action, selected);
    }

    render() {
        if (this.props.hideToolbar) {
            return null
        }
        return (
            <View
                style={[{height: 46, backgroundColor: '#f6f6f6'}, this.props.style]}
            >
                <ListView
                    horizontal
                    contentContainerStyle={{
                        flexDirection: 'row',
                        height: 46,
                        backgroundColor: '#f6f6f6',
                        alignItems: 'center'
                    }}
                    dataSource={this.state.ds}
                    renderRow={(row) => this._renderAction(row.action, row.selected)}
                />
            </View>
        );
    }

    _onPress(action) {
        switch (action) {
            case actions.setBold:
            case actions.setItalic:
            case actions.insertBulletsList:
            case actions.insertOrderedList:
            case actions.setUnderline:
            case actions.heading1:
            case actions.heading2:
            case actions.heading3:
            case actions.heading4:
            case actions.heading5:
            case actions.heading6:
            case actions.setParagraph:
            case actions.removeFormat:
            case actions.alignLeft:
            case actions.alignCenter:
            case actions.alignRight:
            case actions.alignFull:
            case actions.setSubscript:
            case actions.setSuperscript:
            case actions.setStrikethrough:
            case actions.setHR:
            case actions.setIndent:
            case actions.setOutdent:
                this.state.editor._sendAction(action);
                break;
            case actions.insertLink:
                this.state.editor.prepareInsert();
                if (this.props.onPressAddLink) {
                    this.props.onPressAddLink();
                } else {
                    this.state.editor.getSelectedText().then(selectedText => {
                        this.state.editor.showLinkDialog(selectedText);
                    });
                }
                break;
            case actions.insertImage:
                this.state.editor.prepareInsert();
                if (this.props.onPressAddImage) {
                    this.props.onPressAddImage();
                }
                break;
                break;
        }
    }
}

const styles = StyleSheet.create({
    defaultSelectedButton: {
        backgroundColor: 'red'
    },
    defaultUnselectedButton: {}
});