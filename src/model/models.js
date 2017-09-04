sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/odata/v2/ODataModel"
], function (JSONModel, Device, ResourceModel, ODataModel) {
    "use strict";

    function extendMetadataUrlParameters(aUrlParametersToAdd, oMetadataUrlParams, sServiceUrl) {
        var oExtensionObject = {},
            oServiceUri = new URI(sServiceUrl);

        aUrlParametersToAdd.forEach(function (sUrlParam) {
            var oUrlParameters,
                sParameterValue;

            if (sUrlParam === "sap-language") {
                var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser");

                if (fnGetuser) {
                    // for sap-language we check if the launchpad can provide it.
                    oMetadataUrlParams["sap-language"] = fnGetuser().getLanguage();
                }
            } else {
                oUrlParameters = jQuery.sap.getUriParameters();
                sParameterValue = oUrlParameters.get(sUrlParam);
                if (sParameterValue) {
                    oMetadataUrlParams[sUrlParam] = sParameterValue;
                    oServiceUri.addSearch(sUrlParam, sParameterValue);
                }
            }
        });

        jQuery.extend(oMetadataUrlParams, oExtensionObject);
        return oServiceUri.toString();
    }

    /**
     * Table Viewer model utilities
     * com.siemens.tableViewer.model.models
     */
    return {

        /**
         * Create device model for Component
         * @returns {sap.ui.model.json.JSONModel} Device Model
         * @private
         */
        createDeviceModel: function () {
            return new JSONModel(Device).setDefaultBindingMode("OneWay");
        },

        /**
         * Create resource model using name of Resource specified in Component's metadata
         * @param {string} sBundleName - name of Resource Bundle
         * @returns {sap.ui.model.resource.ResourceModel} Resource Bundle
         * @public
         */
        createResourceModel: function (sBundleName) {
            return new ResourceModel({
                "bundleName": sBundleName
            });
        },

        /**
         * Create OData Model with parameters
         * @param {string} sServiceUrl - Service Url
         * @returns {*|sap.ui.model.odata.v2.ODataModel} New OData model
         * @public
         */
        createODataModelWithParameters: function (sServiceUrl) {
            var oModel = this.createODataModel({
                urlParametersForEveryRequest: [
                    "sap-server",
                    "sap-client",
                    "sap-language"
                ],
                url: sServiceUrl,
                config: {
                    metadataUrlParams: {
                        "sap-documentation": "heading"
                    },
                    json: true,
                    defaultBindingMode: "TwoWay",
                    defaultCountMode: "Inline",
                    useBatch: false
                }
            });

            return oModel;
        },

        /*
         * @param [oOptions.config] {object} see {@link sap.ui.model.odata.v2.ODataModel#constructor.mParameters}
         * it is the exact same object, the metadataUrlParams are enrichted by the oOptions.urlParametersToPassOn
         * @returns {sap.ui.model.odata.v2.ODataModel}
         * @public
         */
        createODataModel: function (oOptions) {
            var aUrlParametersForEveryRequest,
                sUrl,
                oConfig = {};

            oOptions = oOptions || {};

            if (!oOptions.url) {
                jQuery.sap.log.error("Please provide a url when you want to create an ODataModel", "com.siemens.tableViewer.models.createODataModel");
                return null;
            }

            // create a copied instance since we modify the config
            oConfig = jQuery.extend(true, {}, oOptions.config);

            aUrlParametersForEveryRequest = oOptions.urlParametersForEveryRequest || [];
            oConfig.metadataUrlParams = oConfig.metadataUrlParams || {};

            sUrl = extendMetadataUrlParameters(aUrlParametersForEveryRequest, oConfig.metadataUrlParams, oOptions.url);

            return this._createODataModel(sUrl, oConfig);

        },

        /**
         * Create OData Model
         * @param {string} sUrl - Service URL
         * @param {object} oConfig - OData Configuration
         * @returns {sap.ui.model.odata.v2.ODataModel} OData v2 model
         * @private
         */
        _createODataModel: function (sUrl, oConfig) {
            var oModel = new ODataModel(sUrl, oConfig);
            return oModel;
        },

        /**
         * To create input parameters model
         * @param {object} oData - OData Configuration
         * @returns {Object} JSONModel - Json model for input parameters
         */
        getHierDefinitionPayload: function (oData) {
            var syst, mandt, are, htype, isPrivate, isGlobal, project;
            if (oData) {
                syst = oData.SYST ? oData.SYST : "";
                mandt = oData.MANDT ? oData.MANDT : "";
                are = oData.ARE ? oData.ARE : "";
                htype = oData.HIERARCHY_TYPE_ID ? oData.HIERARCHY_TYPE_ID : 1;
                isPrivate = oData.IS_PRIVATE ? oData.IS_PRIVATE : 1;
                isGlobal = oData.GLOBAL ? oData.GLOBAL : 1;
                project = oData.PROJECT ? oData.PROJECT : 1;
            }
            return {
                "HIERARCHY_ID": 0,
                "HIERARCHY_NAME": "",
                "SYST": syst || "",
                "MANDT": mandt || "",
                "ARE": are || "",
                "HIERARCHY_TYPE_ID": htype || 1,
                "IS_PRIVATE": isPrivate || 1,
                "GLOBAL": isGlobal || 1,
                "PROJECT": project || ""
            };
        },

        getHierDetailPayload: function (oData) {
            var pId, pName;
            if (oData) {
                pId = oData.PARENT_NODE_ID ? oData.PARENT_NODE_ID : 0;
                pName = oData.PARENT_NODE_NAME ? oData.PARENT_NODE_NAME : "";
            }

            return {
                "HIERARCHY_ID": 0,
                "NODE_ID": 0,
                "PARENT_NODE_ID": pId || 0,
                "NODE_NAME": "",
                "PARENT_NODE_NAME": pName || ""
            };
        }


    };
});