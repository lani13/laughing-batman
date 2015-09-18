jQuery.sap.require("util.Formatter");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("util.Util");

sap.ui.controller("view.DocDetails", {

	doxUrl: 'http://acuarius.ontc.pl:3000/api/get?method=getWholeDox&uid=',

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		this._router.getRoute("documentDetails").attachPatternMatched(this._routePatternMatched, this);
		
		
		
	},

        _routePatternMatched: function(oEvent) {
		var sSubcategoryId = oEvent.getParameter("arguments").id;
		this.setModelDocument(sSubcategoryId);

	},


	handleSearch : function (oEvent) {
		//this._search();
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
	},

	_search : function () {
		var oView = this.getView();
		var oProductList = oView.byId("productList");
		var oCategoryList = oView.byId("categoryList");
		var oSearchField = oView.byId("searchField");

		// switch visibility of lists
		var bShowSearch = oSearchField.getValue().length !== 0;
		oProductList.toggleStyleClass("invisible", !bShowSearch);
		oCategoryList.toggleStyleClass("invisible", bShowSearch);
		
		if (bShowSearch) {
			this._changeNoDataTextToIndicateLoading(oProductList);
		}

		// filter product list
		var oBinding = oProductList.getBinding("items");
		if (oBinding) {
			if (bShowSearch) {
				var oFilter = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, oSearchField.getValue());
				oBinding.filter([oFilter]);
			} else {
				oBinding.filter([]);
			}
		}
	},
	
	_changeNoDataTextToIndicateLoading: function (oList) {
		var sOldNoDataText = oList.getNoDataText();
		oList.setNoDataText("Loading...");
		oList.attachEventOnce("updateFinished", function() {oList.setNoDataText(sOldNoDataText);});
	},

	handleSubcategoryListItemPress : function (oEvent) {
		this._showDocument(oEvent);
		
		//var oBindContext = oEvent.getSource().getBindingContext();
		//var oModel = oBindContext.getModel();
		//var iCategoryIdx = util.Util.parseIndex(oBindContext.getPath());
		//var sCategoryId = oModel.getData().subCat[iCategoryIdx].id;
		//alert("Document id: "+sCategoryId);
		//this._router.navTo("category", {id: sCategoryId});
	},
	
	handleSubcategoryListSelect: function (oEvent) {
		//var oItem = oEvent.getParameter("listItem");
		this._showDocument(oEvent);

		//var oBindContext = oItem.getBindingContext();
		//var oModel = oBindContext.getModel();

        //var iCategoryIdx = oBindContext.getPath().split('/').pop();
		//var sCategoryId = oModel.getData().subCat[iCategoryIdx].id;
		//alert("Document id: "+sCategoryId);
		//this._router.navTo("category", {id: sCategoryId});
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
		var sCategoryId = oModel.getData().subCat[iCategoryIdx].id;
		//alert("Document id: "+sCategoryId);

		//this._router.navTo("product", {id: sCategoryId, productId: sProductId}, !sap.ui.Device.system.phone);
	},
	
	handleCartButtonPress :  function (oEvent) {
		this._router.navTo("cart");
	},
	
	onPressBack : function (oEvent) {
		this.getOwnerComponent().myNavBack();
	},

	onDocPress: function(oEvent){
		/*sap.m.MessageToast.show("Pdf ");
	    if(sap.ui.Device.os.android)
		window.open('http://acuarius.ontc.pl:3000/ace/app/kasia.dymarek/projekty.pdf', "_blank", "location=no");
	    if(sap.ui.Device.os.ios)
		window.open('http://acuarius.ontc.pl:3000/ace/app/kasia.dymarek/projekty.pdf', "_blank", "location=no");*/


	    if(sap.ui.Device.system.desktop)
	        window.open('http://acuarius.ontc.pl:3000/ace/app/kasia.dymarek/projekty.pdf');
		else
			this.downloadDoc();
	},
	
	setModelDocument: function(idString){
		
    var oView = this.getView();
	var oModel = new sap.ui.model.json.JSONModel();

	var data = { "data": 
     { 
        "id": "dox1",
       "name": "Dokument 1",
	   "type": "",
	   "imgs":[{"img":"http://acuarius.ontc.pl:3000/ace/app/kasia.dymarek/SearchSAPUI/jv.png"},{"img":"http://acuarius.ontc.pl:3000/ace/app/kasia.dymarek/SearchSAPUI/5q.png"},{"img":"http://acuarius.ontc.pl:3000/ace/app/kasia.dymarek/SearchSAPUI/zt.png"}]
	 }};
		
	$.ajax({
		url: this.doxUrl+idString,
		dataType: 'json',
		async: true
		}).done(function(response){
			//data = response;
			data.data.id = idString;
			data.data.name = response.DocName;
			data.data.type = response.DoxName;
			oModel.setData(data.data);
			oView.setModel(oModel);
		}).fail(function() {
			sap.m.MessageToast.show("Brak połączenia z serwerem");
		});

		var oImageCarousel = this.getView().byId("docImages");	
		oImageCarousel.removeAllPages();

		for(var i=0; i< data.data.imgs.length; i++){
		    var image = new sap.m.Image({src: data.data.imgs[i].img, alt: 'brak obrazka'});
      		    image.addStyleClass("doc-image");
		    oImageCarousel.insertPage(image, i);
		}			
		
	},
	
	
	downloadDoc: function(){
		var uri = encodeURI("http://acuarius.ontc.pl:3000/ace/app/kasia.dymarek/projekty.pdf");
		var openDoc = this.openDocument;

		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
             function onFileSystemSuccess(fileSystem) {
				fileSystem.root.getDirectory("DocumentBrowser", {create: true}, 
					function gotDirectory(dirEntry) {
						var fileTransfer = new FileTransfer();

						fileTransfer.download(uri, dirEntry.toURL() + "projekty.pdf",
								function(theFile) {
									openDoc(dirEntry.toURL() + "projekty.pdf");
								},
								function(error) {
									sap.m.MessageToast.show("Błąd pobierania pliku: "+ error.code);
								}
						);
					},function fail(error) { sap.m.MessageToast.show("Błąd pliku: "+ error.code); });
			}, function fail(error) { sap.m.MessageToast.show("Błąd systemu plików: "+ error.code); });
		
	},
	
	openDocument: function(path){
		
		cordova.plugins.fileOpener2.open(
			path, 
			'application/pdf', 
			{ 
				error : function(e) { 
					sap.m.MessageToast.show("Błąd otwierania pliku: " + e.message);
				},
				success : function() {
					//sap.m.MessageToast.show("Otwarto plik");                
				}
			}
		);
	}
	
	
});