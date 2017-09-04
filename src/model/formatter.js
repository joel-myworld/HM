/*!
 * Copyright 2017 Siemens AG
 */
sap.ui.define([], function () {
    "use strict";

    return {
        checkPrivate: function (iValue) {
            if (parseInt(iValue, 10)) {
                return this.getResourceBundle().getText("yes");
            } else {
                return this.getResourceBundle().getText("no");
            }
        },
        checkHierarchy: function (iValue) {
            if (iValue === 1) {
                return this.getResourceBundle().getText("parent_child");
            } else if (iValue === 2) {
                return this.getResourceBundle().getText("level");
            } else {
                return this.getResourceBundle().getText("invalidType");
            }
        }

    };
});