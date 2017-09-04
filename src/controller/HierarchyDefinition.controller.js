/*!
 * Copyright 2017 Siemens AG
 */
sap.ui.define([
    "com/siemens/hierarchymaintenance/controller/BaseController",
    "com/siemens/hierarchymaintenance/model/models",
    "com/siemens/hierarchymaintenance/model/formatter",
    "com/siemens/hierarchymaintenance/controller/utilities",
    "sap/m/MessageToast"
], function (BaseController, models, formatter, utilities, MessageToast) {
    "use strict";

	/**
	 * Constructor for Main Controller
	 *
	 * @class
	 * This is an controller class for Main view.
	 * @abstract
	 *
	 * @extends com.siemens.tableViewer.controller.BaseController
	 *
	 * @constructor
	 * @public
	 * @alias com.siemens.tableViewer.controller.Main
	 */
    return BaseController.extend("com.siemens.hierarchymaintenance.controller.HierarchyDefinition", {
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */
        onInit: function () {
            var router = this.getOwnerComponent().getRouter();
            router.getRoute("hierarchyDefinition").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function () {
            var filters = [], projects = [];

            this.getModel().read("/USER_HIERARCHY_DEFINITION", {
                success: function (data) {
                    projects = data.results;
                    for (var i in projects) {
                        filters.push(new sap.ui.model.Filter("PROJECT", "EQ", projects[i].PROJECT));
                    }
                    var filterHierarchy = new sap.ui.model.Filter(filters, false);
                    this.getView().byId("idHierarchyTable").getBinding("rows").filter(filterHierarchy);
                    this.getView().setBusy(false);
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                }.bind(this)
            });
        },

		/**
		 * Helper method to return the instance of cell config dialog control
		 * @returns {String} Id of cell config dialog control
		 * @private
		 */
        _getHierConfigFragDiagId: function () {
            return this.createId("hmFragHierConfigDialog");
        },

		/**
		 * Helper method to return the instance of cell config dialog control
		 * @param {String} sOprtnText  name of the current operation
		 * @param {String} sPath -  name of entity to update
		 * @param {object} oContext  binding context with payload
		 * @private
		 */
        _cucOpertion: function (sOprtnText, sPath, oContext) {
            if (sOprtnText === this.getResourceBundle().getText("add") || sOprtnText === this.getResourceBundle().getText("copy")) {
                this.getModel().create(sPath, oContext, {
                    success: function () {
                        MessageToast.show(this.getResourceBundle().getText("updateSuccess"));
                        this.resetContext();
                    }.bind(this),
                    error: function () {
                        MessageToast.show(this.getResourceBundle().getText("updateFailure"));
                        this.resetContext();
                    }.bind(this)
                });
            } else {
                this.getModel().update(sPath, oContext, {
                    success: function () {
                        MessageToast.show(this.getResourceBundle().getText("updateSuccess"));
                        this.resetContext();
                    }.bind(this),
                    error: function () {
                        MessageToast.show(this.getResourceBundle().getText("updateFailure"));
                        this.resetContext();
                    }.bind(this)
                });
            }
        },

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Fiori Launchpad home page.
		 * @returns {void}
		 * @public
		 */
        onNavBack: function () {
            var oHistory = sap.ui.core.routing.History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                // The history contains a previous entry
                history.go(-1);
            } else {
                if (sap.ushell) {
                    sap.ushell.Container.getService("CrossApplicationNavigation").backToPreviousApp();
                } else {
                    history.go(-1);
                }
            }

        },
		/**
		 * navigates to detail page
		 * @param {object} oEvent event object
		 * @public
		 * @returns {void}
		 */
        onHierarchyDetail: function (oEvent) {
            this.getRouter().navTo("hierarchydetail", {
                hierId: oEvent.getSource().data().hid
            });
        },

		/**
		 * Opens dialog to add new Hierarchy
		 *
		 * @public
		 * @returns {void}
		 */
        onPressAdd: function () {
            if (!this._oAddHierConfigDialog) {
                this._oAddHierConfigDialog = sap.ui.xmlfragment(this._getHierConfigFragDiagId() + "--Add",
                    "com.siemens.hierarchymaintenance.view.fragments.HierarchyDefinition", this);
                utilities.attachControl(this.getView(), this._oAddHierConfigDialog);

            }

            // create an entry of the Products collection with the specified properties and values
            this._oContext = this.getModel().createEntry("/HIERARCHY_DEFINITION", {
                properties: models.getHierDefinitionPayload()
            });
            // binding against this entity
            this._oAddHierConfigDialog.setBindingContext(this._oContext);
            this._oAddHierConfigDialog.getBeginButton().setText(this.getResourceBundle().getText("add"));
            this._oAddHierConfigDialog.getBeginButton().setEnabled(false);
            this._oAddHierConfigDialog.open();
        },

		/**
		 * Opens dialog to edit a Hierarchy
		 * @param {object} oEvent event object
		 * @public
		 * @returns {void}
		 */
        onPressEdit: function (oEvent) {
            var oTable = oEvent.getSource().getParent().getParent(),
                oContext = oTable.getContextByIndex(oTable.getSelectedIndex());
            if (!this._oEditHierConfigDialog) {
                this._oEditHierConfigDialog = sap.ui.xmlfragment(this._getHierConfigFragDiagId() + "--Edit",
                    "com.siemens.hierarchymaintenance.view.fragments.HierarchyDefinition", this);
                utilities.attachControl(this.getView(), this._oEditHierConfigDialog);
            }
            if (oContext && oContext.sPath) {
                this._oEditHierConfigDialog.bindElement(oContext.sPath);
                this._oEditHierConfigDialog.getBeginButton().setEnabled(true);
                this._oEditHierConfigDialog.open();
            } else {
                MessageToast.show(this.getResourceBundle().getText("rowSelect"));
            }
        },

		/**
		 * Event handler to close the dialog for table dialog popup
		 * @public
		 */
        onHierConfigPopupClose: function () {
            this._oAddHierConfigDialog ? this._oAddHierConfigDialog.close() : undefined;
            this._oEditHierConfigDialog ? this._oEditHierConfigDialog.close() : undefined;
            this._oCopyHierDefDialog ? this._oCopyHierDefDialog.close() : undefined;
            this.resetContext();
        },

		/**
		 * Function to add new hierarchy/edit a hierarchy or create a new hierarchy with reference
		 * @param {object} oEvent event object
		 * @public
		 * @returns {void}
		 */
        onHierConfigPopupSave: function (oEvent) {
            var oContext, sOprtnText;
            sOprtnText = oEvent.getSource().getText();
            if (sOprtnText === this.getResourceBundle().getText("add")) {
                oContext = this.byId(sap.ui.core.Fragment.createId(this.createId("hmFragHierConfigDialog"), "Add--siemensUiSimpleForm")).getBindingContext();
                this._cucOpertion(sOprtnText, "/HIERARCHY_DEFINITION", oContext.getObject());
            } else if (sOprtnText === this.getResourceBundle().getText("copy")) {
                oContext = this.byId(sap.ui.core.Fragment.createId(this.createId("hmFragHierConfigDialog"), "Copy--siemensUiSimpleForm")).getBindingContext();
                this._cucOpertion(sOprtnText, "/HIERARCHY_DEFINITION", oContext.getObject());
            } else {
                oContext = this.byId(sap.ui.core.Fragment.createId(this.createId("hmFragHierConfigDialog"), "Edit--siemensUiSimpleForm")).getBindingContext();
                delete oContext.getObject()['HIER_DETAILS'];
                this._cucOpertion(sOprtnText, "/HIERARCHY_DEFINITION(" + oContext.getObject().HIERARCHY_ID + ")", oContext.getObject());
            }
            this.onHierConfigPopupClose();
        },

		/**
		 * Function to delete a Hierarchy
		 * @param {object} oEvent event object
		 * @public
		 * @returns {void}
		 */
        onPressDelete: function (oEvent) {
            var oTable = oEvent.getSource().getParent().getParent(),
                oContext = oTable.getContextByIndex(oTable.getSelectedIndex());
            this.getModel().remove(oContext.getPath(), {
                success: function () {
                    // show message
                    MessageToast.show(this.getResourceBundle().getText("rowDeleteSuccess"));
                }.bind(this),
                error: function () {
                    // show message
                    MessageToast.show(this.getResourceBundle().getText("rowDeleteFailure"));
                }.bind(this)
            });
        },

		/**
		 * Function to add new hierarchy with reference
		 *
		 * @public
		 * @returns {void}
		 */
        onPressCopy: function () {
            var oTable = this.getView().byId("idHierarchyTable"),
                index = oTable.getSelectedIndex();
            if (index >= 0) {
                if (!this._oCopyHierDefDialog) {
                    this._oCopyHierDefDialog = sap.ui.xmlfragment(this.createId("hmFragHierConfigDialog") + "--Copy",
                        "com.siemens.hierarchymaintenance.view.fragments.HierarchyDefinition", this);
                    utilities.attachControl(this.getView(), this._oCopyHierDefDialog);
                }
                var oData = oTable.getContextByIndex(index).getObject();

                var oContext = this.getModel().createEntry("/HIERARCHY_DEFINITION", {
                    properties: models.getHierDefinitionPayload(oData)
                });
                //binding against this entity
                this._oCopyHierDefDialog.setBindingContext(oContext);

                this._oCopyHierDefDialog.getBeginButton().setText(this.getResourceBundle().getText("copy"));

                this._oCopyHierDefDialog.open();

            } else {
                MessageToast.show(this.getResourceBundle().getText("rowSelect"));
                return;
            }
        },
        enableOperation: function (oEvent) {
            if (oEvent.getSource().getValue().trim() === "") {
                oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getBeginButton().setEnabled(false);
            } else {
                oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getBeginButton().setEnabled(true);
            }
        },
        disableOperation: function (oEvent) {
            oEvent.getSource().getBeginButton().setEnabled(false);
        },

		/**
		 * Function to clear all appied filters
		 * @param {object} oEvent event object
		 * @public
		 * @returns {void}
		 */
        onPressClear: function (oEvent) {
            utilities.clearFilters(oEvent);
        }

        /* =========================================================== */
        /* end: internal methods                                       */
        /* =========================================================== */
    });
});