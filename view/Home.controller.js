jQuery.sap.require("util.Formatter");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("util.Util");

sap.ui.controller("view.Home", {

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		// trigger first search to set visibilities right
		//this._search();
		
		this.setModelCategories();
		
	},

	handleSearch : function (oEvent) {
		this._search();
	},

	handleRefresh : function (oEvent) {
		/*var that = this;
		util.Util.updateModel(this.getView());
                 
		
		
		sap.ui.getCore().getEventBus().subscribe("ninja.openui5.cart", "modelRefreshed",
		    function(){
		    	that.getView().byId("pullToRefresh").hide();
		    	sap.m.MessageToast.show("Products refreshed");
		    }
		);*/

			
	sap.m.MessageToast.show("Products refreshed");
        this.getView().byId("pullToRefresh").hide();


	},

	_search : function () {
		var oView = this.getView();
		//var oProductList = oView.byId("productList");
		var oCategoryList = oView.byId("categoryList");
		var oSearchField = oView.byId("searchField");

		// switch visibility of lists
		var bShowSearch = oSearchField.getValue().length !== 0;
		//oProductList.toggleStyleClass("invisible", !bShowSearch);
		//oCategoryList.toggleStyleClass("invisible", bShowSearch);
		
		if (bShowSearch) {
			this._changeNoDataTextToIndicateLoading(oCategoryList);
		}

		// filter product list
		var oBinding = oCategoryList.getBinding("items");
		if (oBinding) {
			if (bShowSearch) {
				var oFilter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, oSearchField.getValue());
				oBinding.filter([oFilter]);
			} else {
				oBinding.filter([]);
			}
		}
	},
	
	_changeNoDataTextToIndicateLoading: function (oList) {
		var sOldNoDataText = oList.getNoDataText();
		oList.setNoDataText("Szukam...");
		oList.attachEventOnce("updateFinished", function() {oList.setNoDataText(sOldNoDataText);});
	},

	handleCategoryListItemPress : function (oEvent) {
		    	//sap.m.MessageToast.show("ItemPress");
		//this._showSubCategories(oEvent);

		var oBindContext = oEvent.getSource().getBindingContext();
		var oModel = oBindContext.getModel();
		var iCategoryIdx = util.Util.parseIndex(oBindContext.getPath());
		var sCategoryId = oModel.getData().docCategories[iCategoryIdx].id;
		this._router.navTo("subcategory", {id: sCategoryId}, !sap.ui.Device.system.phone);
	},

	handleCategoryListSelect: function (oEvent) {
		    	sap.m.MessageToast.show("Select");
                //this._showSubCategories(oEvent);
		var oItem = oEvent.getParameter("listItem");
		oBindContext = oItem.getBindingContext();
		
		var oModel = oBindContext.getModel();
		var iCategoryIdx = util.Util.parseIndex(oBindContext.getPath());
		var sCategoryId = oModel.getData().docCategories[iCategoryIdx].id;
		this._router.navTo("subcategory", {id: sCategoryId}, !sap.ui.Device.system.phone);
        },
	
	
	_showSubCategories: function (oEvent) {
		var oBindContext;
		if (sap.ui.Device.system.phone) {
			oBindContext = oEvent.getSource().getBindingContext();
		} else {
			oBindContext = oEvent.getSource().getBindingContext();
		}
	},
	
	handleCartButtonPress :  function (oEvent) {
		this._router.navTo("cart");
	},
	
	setModelCategories: function(){
		
	var data = {
	"docCategories": [
	{
	"id" : "doc_dir",
	"name": "Kierunek dokumentu"
	},
	{
	"id" : "doc_kind",
	"name": "Rodzaj dokumentu"
	},
	{
	"id" : "proj_phase",
	"name": "Etap projektu"
	},
	{
	"id" : "doc_status",
	"name": "Status dokumentu"
	},
	{
	"id" : "doc_state",
	"name": "Stan dokumentu"
	}
	]
	};



		var oModel = new sap.ui.model.json.JSONModel();
      		oModel.setData(data);
      		this.getView().setModel(oModel);
      				
	}
	
	
});