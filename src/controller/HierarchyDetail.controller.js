/*!
 * Copyright 2017 Siemens AG
 */
sap.ui.define([
    "com/siemens/hierarchymaintenance/controller/BaseController",
    "com/siemens/hierarchymaintenance/model/models",
    "com/siemens/hierarchymaintenance/controller/utilities",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (BaseController, models, utilities, Filter, FilterOperator, MessageToast) {
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
    return BaseController.extend("com.siemens.hierarchymaintenance.controller.HierarchyDetail", {
        _hierId: null,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the main view is instantiated.
         * It sets up the event handling and other lifecycle tasks.
         * @public
         */
        onInit: function () {
            this.getRouter().attachRoutePatternMatched(this._onRouteMatched, this);
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Executed when event route "tableviewer" matched.
         * It bind current view with configuration passing Control Id
         * @param {sap.ui.base.Event} evt event object
         * @public
         */
        _onRouteMatched: function (evt) {
            if (evt.getParameter("name") === "hierarchydetail") {
                this._hierId = evt.getParameters("arguments").arguments.hierId;
                var sHierPath = "/HIERARCHY_DEFINITION(" + this._hierId + ")";
                this.getView().bindElement(sHierPath);
                this.getView().byId("idHierarchyDetTable").setTitle(this.getResourceBundle().getText("hierDetPageTitle") + " " + this._hierId.toString());
            }
        },
        /**
         * Navigates back in the browser history, if the entry was created by this app.
         * If not, it navigates to the Fiori Launchpad home page.
         * @param {Boolean} bDeleted - variant to be deleted when navback
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
                this.getRouter().navTo("hierarchydefination", {}, true /*no history*/ );
            }
        },

        /**
          * Function to add new node/edit a node or create a new node with reference
          * @param {object} oEvent event object
          * @public
          * @returns {void}
          */
        onSaveOrCreate: function (oEvent) {
            if (oEvent.getSource().getText() === this.getResourceBundle().getText("Save")) {
                this._onDetailSave();
            } else {
                this._onDetailAdd(oEvent);
            }
            this.onPopupClose();
        },

        /**
          * Function to update a node
          *
          * @public
          * @returns {void}
          */
        _onDetailSave: function () {
            // get the dialog's binding object, create/update the record
            var context = this.byId(sap.ui.core.Fragment.createId(this.createId("detDialog"), "Edit--SimpleForm")).getBindingContext();
            this.getModel().update(context.getPath(), context.getObject(), {
                success: function () {
                    // show message
                    MessageToast.show(this.getResourceBundle().getText("updateSuccess"));
                }.bind(this),
                error: function () {
                    // show message
                    MessageToast.show(this.getResourceBundle().getText("updateFailure"));
                }.bind(this)
            });
        },

        /**
          * Function to add new node or create a new node with reference
          * @param {object} oEvent event object
          * @public
          * @returns {void}
          */
        _onDetailAdd: function (oEvent) {
            // get the dialog's binding object, create/update the record
            var oContext;
            if (oEvent.getSource().getText() === this.getResourceBundle().getText("add")) {
                oContext = this.byId(sap.ui.core.Fragment.createId(this.createId("detDialog"), "Add--SimpleForm")).getBindingContext();
            } else {
                oContext = this.byId(sap.ui.core.Fragment.createId(this.createId("detDialog"), "Copy--SimpleForm")).getBindingContext();
            }

            this.getModel().create("/HIERARCHY", oContext.getObject(), {
                success: function () {
                    // show message
                    MessageToast.show(this.getResourceBundle().getText("createSuccess"));
                    this.resetContext();
                }.bind(this),
                error: function () {
                    // show message
                    MessageToast.show(this.getResourceBundle().getText("createFailure"));
                    this.resetContext();
                }.bind(this)
            });
        },

        /**
          * Function to open a dialog for adding a new node
          *
          * @public
          * @returns {void}
          */
        onPressAdd: function () {
            if (!this._oAddHierDialog) {
                this._oAddHierDialog = sap.ui.xmlfragment(this.createId("detDialog") + "--Add",
                 "com.siemens.hierarchymaintenance.view.fragments.HierarchyDetail", this);
                utilities.attachControl(this.getView(), this._oAddHierDialog);
            }
            var oContext = this.getModel().createEntry("/HIERARCHY", {
                properties: models.getHierDetailPayload()
            });
            //binding against this entity
            this._oAddHierDialog.setBindingContext(oContext);
            this.byId(sap.ui.core.Fragment.createId(this.createId("detDialog"),
             "Add--SimpleForm")).getContent()[1].setValue(this.getView().getBindingContext().getObject().HIERARCHY_ID);
            this._oAddHierDialog.getBeginButton().setText(this.getResourceBundle().getText("add"));
            this._oAddHierDialog.open();
        },

        /**
          * Function to open a dialog to edit a node
          *
          * @public
          * @returns {void}
          */
        onPressEdit: function () {
            var oHierDetTable = this.getView().byId("idHierarchyDetTable"),
                context;

            // open dialog with data in Edit mode
            if (oHierDetTable.getSelectedIndex() >= 0) {
                context = oHierDetTable.getRows()[oHierDetTable.getSelectedIndex()].getBindingContext();
            } else {
                MessageToast.show(this.getResourceBundle().getText("rowSelect"));
                return;
            }
            if (!this._oEditHierDialog) {
                this._oEditHierDialog = sap.ui.xmlfragment(this.createId("detDialog") + "--Edit",
                 "com.siemens.hierarchymaintenance.view.fragments.HierarchyDetail", this);
                utilities.attachControl(this.getView(), this._oEditHierDialog);
            }
            this._oEditHierDialog.bindElement(context.getPath());
            this._oEditHierDialog.open();
            // this.getView().byId("SimpleForm").setEditable(true);
        },

        /**
          * Function to open a dialog to edit a node
          * @param {object} oEvent oEvent object with refernce to row to delete
          * @public
          * @returns {void}
          */
        onPressDelete: function (oEvent) {
            var oTable = oEvent.getSource().getParent().getParent(),
                oContext = oTable.getContextByIndex(oTable.getSelectedIndex());
            if (oTable.getSelectedIndex() < 0) {
                MessageToast.show(this.getResourceBundle().getText("rowSelect"));
                return;
            }
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
          * Function to open a dialog to create a node by reference
          *
          * @public
          * @returns {void}
          */
        onPressCopy: function () {
            var oTable = this.getView().byId("idHierarchyDetTable"),
                index = oTable.getSelectedIndex();
            if (index >= 0) {
                if (!this._oCopyHierDialog) {
                    this._oCopyHierDialog = sap.ui.xmlfragment(this.createId("detDialog") + "--Copy",
                        "com.siemens.hierarchymaintenance.view.fragments.HierarchyDetail", this);
                    utilities.attachControl(this.getView(), this._oCopyHierDialog);
                }

                var oData = oTable.getContextByIndex(index).getObject();

                var oContext = this.getModel().createEntry("/HIERARCHY", {
                    properties: models.getHierDetailPayload(oData)
                });
                //binding against this entity
                this._oCopyHierDialog.setBindingContext(oContext);
                this.byId(sap.ui.core.Fragment.createId(this.createId("detDialog"),
                 "Copy--SimpleForm")).getContent()[1].setValue(this.getView().getBindingContext()
                    .getObject().HIERARCHY_ID);
                this._oCopyHierDialog.getBeginButton().setText(this.getResourceBundle().getText("copy"));

                this._oCopyHierDialog.open();

            } else {
                MessageToast.show(this.getResourceBundle().getText("rowSelect"));
                return;
            }
        },

        /**
          * Function to clear all applied filters
          * @param {object} oEvent filter data
          * @public
          * @returns {void}
          */
        onPressClear: function (oEvent) {
            utilities.clearFilters(oEvent);
        },

        /**
          * Function to close all open dialogs
          *
          * @public
          * @returns {void}
          */
        onPopupClose: function () {
            var closed = this._oAddHierDialog ? this._oAddHierDialog.close() : undefined;
            closed = this._oEditHierDialog ? this._oEditHierDialog.close() : undefined;
            closed = this._oUploadDialog ? this._oUploadDialog.close() : undefined;
            closed = this._oCopyHierDialog ? this._oCopyHierDialog.close() : undefined;
            closed = this._oValueHelpDialog ? this._oValueHelpDialog.getBinding("items").filter([]) : undefined;
            this.resetContext();
            closed;
        },

        /**
          * Function to open a dialog to upload nodes using a csv file
          *
          * @public
          * @returns {void}
          */
        onPressUpload: function () {
            // open dialog to upload files
            if (!this._oUploadDialog) {
                this._oUploadDialog = sap.ui.xmlfragment("com.siemens.hierarchymaintenance.view.fragments.HierarchyUpload", this);
                utilities.attachControl(this.getView(), this._oUploadDialog);
            }
            this._oUploadDialog.open();
        },

        /**
          * Function to upload a csv/xls file
          *
          * @public
          * @returns {void}
          */
        handleUploadPress: function () {
            var oFileUploader = this._oUploadDialog.getAggregation("content")[0];
            if (!oFileUploader.getValue()) {
                MessageToast.show(this.getResourceBundle().getText("fileSelect"));
                return;
            }

            // Header Slug
            var oCustomerHeaderSlug = new sap.ui.unified.FileUploaderParameter({
                name: "slug",
                value: oFileUploader.getValue()
            });
            // Header HIERARCHY_ID
            var oCustomerHeaderHIERID = new sap.ui.unified.FileUploaderParameter({
                name: "HIERARCHY_ID",
                value: this._hierId
            });

            oFileUploader.addHeaderParameter(oCustomerHeaderSlug);
            oFileUploader.addHeaderParameter(oCustomerHeaderHIERID);
            oFileUploader.setSendXHR(true);
            this._oUploadDialog.setBusy(true);
            oFileUploader.upload();
        },

        /**
          * Function to handle response of file upload
          * @param {object} oEvent response from server on upload of file
          * @public
          * @returns {void}
          */
        handleUploadComplete: function (oEvent) {
            var sResponse = oEvent.getParameter("responseRaw");
            if (sResponse) {
                var sMsg = "";
                var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
                if (m && m[1] === "200") {
                    sMsg = this.getResourceBundle().getText("uploadSuccess");
                    oEvent.getSource().setValue("");
                } else {
                    sMsg = this.getResourceBundle().getText("uploadFailure");
                }
                // this.getView().byId("idHierarchyDetTable").getModel().refresh(true);
                this.getView().byId("idHierarchyDetTable").getBinding("rows").filter([]);
                this.onPopupClose();
                this._oUploadDialog.setBusy(false);
                MessageToast.show(sMsg);
            }
        },

        /**
          * Function to open a dialog to edit a node
          * @param {object} oEvent event object for file type mismatch
          * @public
          * @returns {void}
          */
        handleTypeMissmatch: function (oEvent) {
            var aFileTypes = oEvent.getSource().getFileType();
            jQuery.each(aFileTypes, function (key, value) {
                aFileTypes[key] = "*." + value;

            });
            var sSupportedFileTypes = aFileTypes.join(", ");
            MessageToast.show(this.getResourceBundle().getText("fileTypeMismatch", [oEvent.getParameter("fileType"), sSupportedFileTypes]));
        },

        /**
          * Function to open a dialog to search for parent a node
          * @param {object} oEvent provides reference to dialog's custom data
          * @public
          * @returns {void}
          */
        onPressValueHelp: function (oEvent) {
            if (!this._oValueHelpDialog) {
                this._oValueHelpDialog = sap.ui.xmlfragment("com.siemens.hierarchymaintenance.view.fragments.HierarchyValueHelp", this);
                utilities.attachControl(this.getView(), this._oValueHelpDialog);
            }
            this._oValueHelpDialog.data("dialogId",oEvent.getSource().getParent().getParent().getParent().getParent().getId());
            this._oValueHelpDialog.open();
        },

        /**
          * Function to reset filter on value help on close
          * @param {object} oEvent reference to the select dialog
          * @public
          * @returns {void}
          */
        onCloseValueHelp:function(oEvent){
            var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([]);
        },

        /**
          * Function to search for a parent node
          * @param {object} oEvent event object
          * @private
          * @returns {void}
          */
        _handleValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("NODE_NAME", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
        /**
         * function to confirm the selection of the parent node
         * @param {object} oEvent event data
         * @private
         */
        _handleValueHelpClose: function (oEvent) {
            var oForm = this.byId(oEvent.getSource().data().dialogId);
            oForm.getContent()[5].setValue(oEvent.getParameter("selectedItem").getBindingContext().getObject().NODE_ID);
            oForm.getContent()[9].setValue(oEvent.getParameter("selectedItem").getBindingContext().getObject().NODE_NAME);

        }
        /* =========================================================== */
        /* end: internal methods                                       */
        /* =========================================================== */
    });
});