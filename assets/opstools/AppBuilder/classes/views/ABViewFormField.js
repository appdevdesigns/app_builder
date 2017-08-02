/*
 * ABViewFormField
 * 
 *
 */

import ABView from "./ABView"
import ABPropertyComponent from "../ABPropertyComponent"
import ABViewManager from "../ABViewManager"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABViewFormField extends ABView {
}