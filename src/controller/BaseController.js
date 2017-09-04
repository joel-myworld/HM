/*!
 * Copyright 2017 Siemens AG
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, History,Fragment) {
	"use strict";

	/**
	 * Constructor for Base Controller
	 *
	 * @class
	 * This is an abstract base class for all view controllers. View controllers are going to extend it.
	 * All class attributes and methods will be shared.
	 * @abstract
	 *
	 * @extends sap.ui.core.mvc.Controller
	 *
	 * @constructor
	 * @public
	 * @alias com.siemens.hierarchymaintenance.controller.BaseController
	 */
	return Controller.extend("com.siemens.hierarchymaintenance.controller.BaseController", {

		_oContext: null,

		resetContext:function(){
			this._oContext ? this.getModel().deleteCreatedEntry(this._oContext) : null;
			this._oContext = null;
		},
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {String} sName - the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Return EntityName from main configuration table
		 * @returns {String} Entity name from main model
		 */
		getEntityName: function () {
			return "/" + this.getComponentModel().getProperty('/ENTITY_NAME');
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Getter for model instantiated in Component
		 * @param {string} sModelName - model name
		 * @returns {sap.ui.model.Model} - named component model
		 */
		getComponentModel: function (sModelName) {
			return this.getOwnerComponent().getModel(sModelName);
		},

		/**
         *Returns a control from fragment with provided fragment id
         * @param   {string} sFragId - fragment id
         * @param   {string} sControlId - control if to get
         * @returns {sap.ui.core.Control} Control inside fragment
         * @private
         */
        _getFragmentControl: function(sFragId, sControlId) {
            return Fragment.byId(sFragId, sControlId);
        },
		/**
		 * Attaching requests to model to display busy indicator
		 * @public
		 * @param {sap.ui.model.Model} oModel - the model instance
		 * @param {sap.ui.core.Control} oControl - received control instance
		 */
		attachRequestsForControlBusyIndicator: function (oModel, oControl) {
			if (oControl.getBusyIndicatorDelay() === 1000) {
				oControl.setBusyIndicatorDelay(0);
			}
			// table busy dialog on each request.
			oModel.attachEventOnce("requestSent", jQuery.proxy(function () {
				oControl.setBusy(true);
			}), this);
			oModel.attachEventOnce("requestCompleted", jQuery.proxy(function () {
				oControl.setBusy(false);
			}), this);
			oModel.attachEventOnce("requestFailed", jQuery.proxy(function () {
				oControl.setBusy(false);
			}), this);
		}
	});
});