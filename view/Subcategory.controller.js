jQuery.sap.require("util.Formatter");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("util.Util");

sap.ui.controller("view.Subcategory", {

	subcategoryUrl: 'http://acuarius.ontc.pl:3000/api/get?method=get_dictionary&dict_name=',

	sCategoryId: "",

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		this._router.getRoute("subcategory").attachPatternMatched(this._routePatternMatched, this);;
		
		
		
	},

        _routePatternMatched: function(oEvent) {
		this.sCategoryId = oEvent.getParameter("arguments").id;
		this.setModelSubCategories(this.sCategoryId);

	},


	handleSearch : function (oEvent) {
		this._search();
	},

	handleRefresh : function (oEvent) {

	sap.m.MessageToast.show("Products refreshed");		
        this.getView().byId("pullToRefresh").hide();

	},

	_search : function () {


		var oView = this.getView();

		var oSubCategoryList = oView.byId("subcategoryList");
		var oSearchField = oView.byId("searchField");

		var bShowSearch = oSearchField.getValue().length !== 0;
		
		if (bShowSearch) {
			this._changeNoDataTextToIndicateLoading(oSubCategoryList);
		}

		// filter product list
		var oBinding = oSubCategoryList.getBinding("items");
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
		//var sOldNoDataText = oList.getNoDataText();
		oList.setNoDataText("Szukam...");
		oList.attachEventOnce("updateFinished", function() {oList.setNoDataText("Brak danych");});
	},

	handleSubcategoryListItemPress : function (oEvent) {
		var oBindContext = oEvent.getSource().getBindingContext();
		var oModel = oBindContext.getModel();
		var iCategoryIdx = util.Util.parseIndex(oBindContext.getPath());
		var sSubCategoryId = oModel.getData().data[iCategoryIdx].id;

		//alert("Category id: "+sCategoryId);
		this._router.navTo("documentList", {catid: this.sCategoryId, id: sSubCategoryId});
	},
	
	handleSubcategoryListSelect: function (oEvent) {
		var oItem = oEvent.getParameter("listItem");
		/*this._showProduct(oItem);*/

		var oBindContext = oItem.getBindingContext();
		var oModel = oBindContext.getModel();

       		var iCategoryIdx = oBindContext.getPath().split('/').pop();
		var sSubCategoryId = oModel.getData().data[iCategoryIdx].id;
		//alert("Category id: "+sCategoryId);
		this._router.navTo("documentList", {catid: this.sCategoryId, id: sSubCategoryId});
	},
	
		
	_showProduct: function (oItem) {
		var oBindContext = oItem.getBindingContext();
		var oModel = oBindContext.getModel();
		var sId = oModel.getData(oBindContext.getPath()).ProductId;
		this._router.navTo("cartProduct", {productId: sId}, !sap.ui.Device.system.phone);
	},
	
	handleCartButtonPress :  function (oEvent) {
		this._router.navTo("cart");
	},
	
	onPressBack : function (oEvent) {
		this.getOwnerComponent().myNavBack();
	},
	
	setModelSubCategories: function(idString){
		
	var oView = this.getView();

		var data = {};
		var oModel = new sap.ui.model.json.JSONModel();
		
		var oDocList = oView.byId("subcategoryList");
		oDocList.setNoDataText("Pobieram dane...");

		$.ajax({
			url: this.subcategoryUrl+idString,
			dataType: 'json',
			async: true,
			}).done(function(response){
				data = response;
      				oModel.setData(data);
      				oView.setModel(oModel);
			}).fail(function() {
				sap.m.MessageToast.show("Brak połączenia z serwerem");
				oDocList.setNoDataText("Brak wyników wyszukiwania");
 			});
	
	}

});