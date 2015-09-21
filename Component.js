sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/m/routing/Router',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/odata/ODataModel',
	'sap/ui/model/json/JSONModel'
], function (UIComponent,
			Router,
			ResourceModel,
			ODataModel,
			JSONModel) {

	return UIComponent.extend("ontc.DocBrowser.Component", {

		metadata: {
			routing: {
				config: {
					routerClass: Router,
					viewType: "XML",
					viewPath: "view",
					controlId: "splitApp",
					transition: "show",
					bypassed: {
						target: ["home" , "notFound"]
					}
				},
				routes: [
					{
						pattern: "",
						name: "init",
						target: "initView"
					},
					{
						pattern: "home",
						name: "home",
						target: "home"
					},
					{
						pattern: "category/{id}",
						name: "category",
						target: "categoryView"
					},
					{
						pattern: "subcategory/{id}",
						name: "subcategory",
						target: "subcategoryView"
					},
					{
						pattern: "category/{id}/product/{productId}",
						name: "product",
						target: ["categoryView", "productView"]
					},
					{
						pattern: "cart",
						name: "cart",
						target: "cart"
					},
					{
						pattern: "product/{productId}",
						name: "cartProduct",
						target: ["home" , "productView"]
					},
					{
						pattern: "doclist/{catid}/{id}",
						name: "documentList",
						target: ["documentListView"]
					},
					{
						pattern: "document/{id}",
						name: "documentDetails",
						target: ["documentListView", "documentDetailsView"]
					}
				],
				targets: {
					initView: {
						viewName: "Init",
						controlAggregation: "masterPages"
					},
					productView: {
						viewName: "Product",
						controlAggregation: "detailPages"
					},
					categoryView: {
						viewName: "Category",
						controlAggregation: "masterPages"
					},
					subcategoryView: {
						viewName: "Subcategory",
						transition: "show",
						controlAggregation: "masterPages"
					},
					notFound: {
						viewName: "NotFound",
						transition: "show",
						controlAggregation: "detailPages"
					},
					welcome: {
						viewName: "Welcome",
						transition: "show",
						controlAggregation: "detailPages"
					},
					home: {
						viewName: "Home",
						transition: "show",
						controlAggregation: "masterPages"
					},
					cart: {
						viewName: "Cart",
						controlAggregation: "masterPages"
					},
					documentListView: {
						viewName: "DocList",
						transition: "show",
						controlAggregation: "masterPages"
					},
					documentDetailsView: {
						viewName: "DocDetails",
						transition: "show",
						controlAggregation: "detailPages"
					}
				}
			}
		},

		init: function () {
			// call overwritten init (calls createContent)
			UIComponent.prototype.init.apply(this, arguments);

			//extend the router
			this._router = this.getRouter();

			//navigate to initial page for !phone
			if (!sap.ui.Device.system.phone) {
				this._router.getTargets().display("welcome");
			}

			// initialize the router
			this._router.initialize();

		},

		myNavBack : function () {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
				this._router.getTargets().display("welcome");
			} else {
				this._router.navTo("home", {}, true);
			}
		},

		createContent: function () {

			// set i18n model
			var oI18nModel = new ResourceModel({
				bundleUrl: "i18n/appTexts.properties"
			});
			sap.ui.getCore().setModel(oI18nModel, "i18n");

			// create root view
			var oView = sap.ui.view({
				viewName: "view.App",
				type: "XML"
			});

			oView.setModel(oI18nModel, "i18n");

			jQuery.sap.require("util.Util");
			util.Util.updateModel(oView);

			//create and set cart model
			var oCartModel = new JSONModel({
				entries: [],
				totalPrice: "0",
				showEditAndProceedButton: false
			});
			oView.setModel(oCartModel, "cartProducts");


			// set device model
			var oDeviceModel = new JSONModel({
				isTouch: sap.ui.Device.support.touch,
				isNoTouch: !sap.ui.Device.support.touch,
				isPhone: sap.ui.Device.system.phone,
				isNoPhone: !sap.ui.Device.system.phone,
				listMode: (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType: (sap.ui.Device.system.phone) ? "Active" : "Inactive"
			});
			oDeviceModel.setDefaultBindingMode("OneWay");
			oView.setModel(oDeviceModel, "device");


			// done
			return oView;
		}
	});

});
