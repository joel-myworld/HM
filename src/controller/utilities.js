/*!
 * Copyright 2017 Siemens AG
 */
sap.ui.define([
	"sap/ui/Device"
], function (Device) {
	"use strict";

	var sCompactCozyClass = Device.support.touch ? "" : "sapUiSizeCompact";

	/**
	 * Table Viewer utilities
	 * com.siemens.hierarchymaintenance.controller.utilities
	 */
	return {
		/**
		 * Get Content Density class based on device.
		 * @returns {string} Compact/Cozy CSS Class name
		 */
		getContentDensityClass: function () {
			return sCompactCozyClass;
		},

		/**
		 * Attach Density class to the control
		 * @param {sap.ui.core.mvc.View} oView - view instance
		 * @param {sap.ui.core.Control} oControl - UI5 control
		 * @return {void}
		 */
		attachControl: function (oView, oControl) {
			if (sCompactCozyClass) {
				jQuery.sap.syncStyleClass(sCompactCozyClass, oView, oControl);
			}
			oView.addDependent(oControl);
		},

		/**
		 * clear filters applied to the table
		 *
		 * @param {object} oEvent - event data
		 * @return {void}
		 */
		clearFilters:function(oEvent){
			var oTable = oEvent.getSource().getParent().getParent(),
				aColumns = oTable.getColumns();
			for (var iCount = 0; iCount < aColumns.length; iCount++) {
				if (aColumns[iCount].getFiltered()){
					oTable.filter(aColumns[iCount], null);
					aColumns[iCount].getMenu().getAggregation("items")[2].setValue("");
				}
			}
		}
	};
});