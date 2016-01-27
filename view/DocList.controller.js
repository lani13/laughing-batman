jQuery.sap.require("util.Formatter");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("util.Util");

sap.ui.controller("view.DocList", {


	postUrl: 'http://ac001.nachmurze.pl/api/post?method=select_report_l&filter_set=BP008/ddd/sss/DoxSets/byDoxType/doxtype_DOCUMENT&filter_object=DOCUMENT',

	setUrl: 'http://ac001.nachmurze.pl/api/get?method=get_document_list&setname=BP008/ddd/sss/',

	sSubcategoryId: "",

	sCategoryId: "",

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		this._router.getRoute("documentList").attachPatternMatched(this._routePatternMatched, this);
                  
        sap.ui.getCore().getEventBus().subscribe("ontc.DocBrowser", "notloggedChecked",
                                                    function(){
                                                           router.navTo("init", {}, !sap.ui.Device.system.phone);
                                                           
                                                    }
        );
	},

        _routePatternMatched: function(oEvent) {
		this.sSubcategoryId = oEvent.getParameter("arguments").id;
		this.sCategoryId = oEvent.getParameter("arguments").catid;

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({"data":[]});
		this.getView().setModel(oModel);

		this.setModelDocuments(this.sCategoryId, this.sSubcategoryId);

	},


	handleSearch : function (oEvent) {
		this._search();
	},

	handleRefresh : function (oEvent) {
		this.setModelDocuments(this.sCategoryId,this.sSubcategoryId);
		sap.m.MessageToast.show("Pobrano dokumenty");
       		this.getView().byId("pullToRefresh").hide();
	},

	_search : function () {
		var oView = this.getView();

		var oDocList = oView.byId("docList");
		var oSearchField = oView.byId("searchField");

		var bShowSearch = oSearchField.getValue().length !== 0;
		
		if (bShowSearch) {
			this._changeNoDataTextToIndicateLoading(oDocList);
		}

		// filter product list
		var oBinding = oDocList.getBinding("items");
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
		oList.attachEventOnce("updateFinished", function() {oList.setNoDataText("Brak wyników wyszukiwania");});
	},

	handleSubcategoryListItemPress : function (oEvent) {
		//this._showDocument(oEvent);
		
		var oBindContext = oEvent.getSource().getBindingContext();
		var oModel = oBindContext.getModel();
        
		var iCategoryIdx = util.Util.parseIndex(oBindContext.getPath());
		var sCategoryId = oModel.getData().data[iCategoryIdx].uid;
		//alert("Document id: "+sCategoryId);

		this._router.navTo("documentDetails", {id: sCategoryId}, !sap.ui.Device.system.phone);
	},
	
	handleSubcategoryListSelect: function (oEvent) {
		var oItem = oEvent.getParameter("listItem");
		//this._showDocument(oEvent);

		var oBindContext = oItem.getBindingContext();
		var oModel = oBindContext.getModel();

		var iCategoryIdx = util.Util.parseIndex(oBindContext.getPath());
		var sCategoryId = oModel.getData().data[iCategoryIdx].uid;
		//alert("Document id: "+sCategoryId);

		this._router.navTo("documentDetails", {id: sCategoryId}, !sap.ui.Device.system.phone);
	},
	
		
	_showDocument: function (oEvent) {
		var oBindContext;
		if (sap.ui.Device.system.phone) {
			oBindContext = oEvent.getSource().getBindingContext();
		} else {
			oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
		}
		var oModel = oBindContext.getModel();
		
		var iCategoryIdx = util.Util.parseIndex(oBindContext.getPath());
		var sCategoryId = oModel.getData().data[iCategoryIdx].uid;
		//alert("Document id: "+sCategoryId);

		this._router.navTo("documentDetails", {id: sCategoryId}, !sap.ui.Device.system.phone);
	},
	
	handleCartButtonPress :  function (oEvent) {
		this._router.navTo("cart");
	},
	
	onPressBack : function (oEvent) {
		this.getOwnerComponent().myNavBack();
	},
	
	setModelDocuments: function(catString,idString){
		
		var data = {};
		var oModel = new sap.ui.model.json.JSONModel();
		var paramObject = this.getPostParams(catString,idString);
		var setName = "";
		var oView = this.getView();
		var sUrl = this.setUrl;
		
		var oDocList = oView.byId("docList");
		oDocList.setNoDataText("Pobieram dane...");

		$.ajax({
			url: this.postUrl,
			type: 'post',
			dataType: 'json',
			async: true,
			data: paramObject,
			}).done(function(response){
				setName = response.setname;
				console.log(setName);
				if(setName === 'empty_result'){
					sap.m.MessageToast.show("Brak wyników wyszukiwania");
					oDocList.setNoDataText("Brak wyników wyszukiwania");
				}
				else{
					$.ajax({
						url: sUrl+setName,
						dataType: 'json',
						async: true
					}).done(function(response){
						data = response;
      						oModel.setData(data);
      						oView.setModel(oModel);
					}).fail(function() {
						sap.m.MessageToast.show("Brak połączenia z serwerem");
						oDocList.setNoDataText("Brak danych");
 					});

				}
			}).fail(function() {
				sap.m.MessageToast.show("Brak połączenia z serwerem");
				oDocList.setNoDataText("Brak danych");
 			});
      				
	},

        getPostParams: function(catString,idString){

		var obj = {
			"data[DocName]": "",
			"data[Number]": "",
			"data[DocKind]": "",
			"data[DocDirection]": "",
			"data[ProjPhase]": "",
			"data[DocStatus]": "",
			"data[DocState]": ""
		};

		if(catString === 'doc_kind')
			obj["data[DocKind]"]=idString;
		else if(catString === 'doc_dir')
			obj["data[DocDirection]"]=idString;
		else if(catString === 'proj_phase')
			obj["data[ProjPhase]"]=idString;
		else if(catString === 'doc_status')
			obj["data[DocStatus]"]=idString;
		else if(catString === 'doc_state')
			obj["data[DocState]"]=idString;

		return obj;
    
    },
                  
    logoutButtonPress: function(event){
                  
            var that = this;
            util.Util.logout();
                  
            sap.ui.getCore().getEventBus().subscribe("ontc.DocBrowser", "loggedoutChecked",
                                                function(){
                                                           that._router.navTo("init", {}, !sap.ui.Device.system.phone);
                                                           
                                                }
            );
                  
                  
    }
	
	
});