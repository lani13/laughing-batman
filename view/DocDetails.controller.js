jQuery.sap.require("util.Formatter");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("util.Util");

sap.ui.controller("view.DocDetails", {

	doxUrl: 'http://acuarius.ontc.pl:3000/api/get?method=getWholeDox&uid=',

	doxAttachmentsUrl: 'http://acuarius.ontc.pl:3000/api/get?method=documentAttachments?uid=',
	
	imageUrl: 'http://acuarius.ontc.pl:3000/BP008/ddd/thumbnails/',
	
	attachmentUrl: 'http://acuarius.ontc.pl:3000/BP008/ddd/attachments/',
	
	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		this._router.getRoute("documentDetails").attachPatternMatched(this._routePatternMatched, this);
		
		
		
	},

        _routePatternMatched: function(oEvent) {
		var sSubcategoryId = oEvent.getParameter("arguments").id;
		this.setModelDocument(sSubcategoryId);

	},

	
	onPressBack : function (oEvent) {
		this.getOwnerComponent().myNavBack();
	},

	onDocPress: function(oEvent){
	    
		//if(sap.ui.Device.system.desktop)
	        //window.open(this.attachmentUrl+this.attachmentData[id].fileName);
	},
	
	setModelDocument: function(idString){
		
	var oView = this.getView();
	var oModel = new sap.ui.model.json.JSONModel();

	//var busyIndicator = this.getView().byId("busyIndicator");   
	//busyIndicator.setVisible(true);

	var oImageCarousel = this.getView().byId("docImages");	
	var p = oImageCarousel.getPages();
 	
	for(var i=0; i<p.length; i++){
		p[i].destroy();
	}
	
	var imgUrl = this.imageUrl;
	var pressFunction = this.onDocPress;
	
	var doxAtchUrl = this.doxAttachmentsUrl;
	var atchUrl = this.attachmentUrl;
	var imgUrl = this.imageUrl;
	var pressFunction = this.onDocPress;
	var atch = [];
	var data = {};
	var dwnl = this.downloadDoc;

	$.ajax({
		url: this.doxUrl+idString,
		dataType: 'json',
		async: true
		}).done(function(response){
			data.id = idString;
			data.name = response.DocName;
			data.type = response.DoxName;
			oModel.setData(data);
			oView.setModel(oModel,'attach');
			
			$.ajax({
				url: doxAtchUrl+idString,
				dataType: 'json',
				async: true
				}).done(function(response){
					atch = response.data;

					var modelData = [];
					var oModel1 = oView.getModel('attach');
					var oldData = oModel1.getData();

					if(atch.length==0)
						sap.m.MessageToast.show("Brak załączników"); 
					else
			 			 for(var i=0; i<atch.length; i++){
						modelData.push(atch[i]);
						var button = new sap.m.Button("button_"+i,{text:'Pobierz '+atch[i].name.split('-').pop(), type: 'Accept', press: function(oEvent){
	    									
	    												var id = oEvent.getSource().getId().split('_').pop();
														var data = oView.getModel('attach').getData();
														var docData = data.attachments[id];
													
	    												if(sap.ui.Device.system.desktop)
	         											       window.open(atchUrl+docData.url.split('/').pop());	
														else
															 dwnl(atchUrl+docData.url.split('/').pop(),docData.name.split('-').pop(),docData.ext);

													}			
						});
						var image = new sap.m.Image({src: imgUrl+atch[i].thumbnail.split('/').pop(), alt: 'brak obrazka'});
      		    		image.addStyleClass("doc-image");
 				
						var vLayout = new sap.ui.layout.VerticalLayout({width: '100%'});
						vLayout.addContent(button);				
						vLayout.addContent(image);
						oImageCarousel.insertPage(vLayout, i);

			 		 }
			
					oldData.attachments = modelData;
					oModel1.setData(oldData);
					oView.setModel(oModel1,"attach");
		
					//busyIndicator.setVisible(false);

				}).fail(function() {
					sap.m.MessageToast.show("Brak połączenia z serwerem");
					//busyIndicator.setVisible(false);
				});


			
		}).fail(function() {
			sap.m.MessageToast.show("Brak połączenia z serwerem");
			//busyIndicator.setVisible(false);
		});


	/*$.ajax({
		url: this.doxAttachmentsUrl+idString,
		dataType: 'json',
		async: true
		}).done(function(response){
			atch = response.data;
			
			if(atch.length==0)
				sap.m.MessageToast.show("Brak załączników"); 
			else
			  for(var i=0; i<atch.length; i++){
				
				var button = new sap.m.Button(atch[i].url.split('/').pop(),{text:'Pobierz '+atch[i].name.split('-').pop(), type: 'Accept', press: function(oEvent){
	    									
	    												var id = oEvent.getSource().getId();

	    												if(sap.ui.Device.system.desktop)
	         											       window.open(atchUrl+id);	
														else
															   dwnl(atchUrl+id);
													}
								});
				var image = new sap.m.Image({src: imgUrl+atch[i].thumbnail.split('/').pop(), alt: 'brak obrazka'});
      		    	image.addStyleClass("doc-image");
 				
				var vLayout = new sap.ui.layout.VerticalLayout({width:'100%'});
				vLayout.addContent(button);				
				vLayout.addContent(image);
				oImageCarousel.insertPage(vLayout, i);

			  }

			busyIndicator.setVisible(false);

		}).fail(function() {
			sap.m.MessageToast.show("Brak połączenia z serwerem");
			busyIndicator.setVisible(false);
		});*/

		
	},
	
	
	downloadDoc: function(fileUrl, filename, ext){
		var uri = encodeURI(fileUrl);
		//var openDoc = this.openDocument;
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
             function onFileSystemSuccess(fileSystem) {
				fileSystem.root.getDirectory("DocumentBrowser", {create: true}, 
					function gotDirectory(dirEntry) {
						var fileTransfer = new FileTransfer();

						fileTransfer.download(uri, dirEntry.toURL() + filename,
								function(theFile) {
									console.log("Filename: " + dirEntry.toURL() + filename);
									
									var path = dirEntry.toURL() + filename;
									
									//var ext = path.split('.').pop();
									var mimeType = 'none';
		
		
									if(ext == 'pdf')
										mimeType = 'application/pdf';
									else if(ext == 'doc' || ext == 'docx')
										mimeType = 'application/msword';
									else if(ext == 'ppt' || ext == 'pptx')
										mimeType = 'application/vnd.ms-powerpoint';
									else if(ext == 'xls' || ext == 'xlsx')
										mimeType = 'application/vnd.ms-excel';
									else if(ext == 'rtf')
										mimeType = 'application/rtf';
									else if(ext == 'txt')
										mimeType = 'text/plain';
									else if(ext == 'gif')
										mimeType = 'image/gif';
									else if(ext == 'jpg' || ext == 'jpeg')
										mimeType = 'image/jpeg';
									else if(ext == 'png')
										mimeType = 'image/png';
										
										
									if(mimeType=='none')
										sap.m.MessageToast.show("Nieobsługiwany format pliku"); 
									else
										cordova.plugins.fileOpener2.open(
											path, 
											mimeType, 
											{ 
												error : function(e) { 
													sap.m.MessageToast.show("Błąd otwierania pliku");
												},
												success : function() {
													sap.m.MessageToast.show("Plik został zapisany");                
												}
											}
										);
									
									//openDoc(dirEntry.toURL() + theFile.fullPath);

								},
								function(error) {
									sap.m.MessageToast.show("Błąd pobierania pliku");
								}
						);
					},function fail(error) { sap.m.MessageToast.show("Błąd pliku"); });
			}, function fail(error) { sap.m.MessageToast.show("Błąd systemu plików"); });
		
	}/*,
	
	openDocument: function(path){
		
		var ext = path.split('.').pop();
		var mimeType = 'none';
		
		
		if(ext == 'pdf')
			mimeType = 'application/pdf';
		else if(ext == 'doc' || ext == 'docx')
			mimeType = 'application/msword';
		else if(ext == 'ppt' || ext == 'pptx')
			mimeType = 'application/vnd.ms-powerpoint';
		else if(ext == 'xls' || ext == 'xlsx')
			mimeType = 'application/vnd.ms-excel';
		else if(ext == 'rtf')
			mimeType = 'application/rtf';
		else if(ext == 'txt')
			mimeType = 'text/plain';
		else if(ext == 'gif')
			mimeType = 'image/gif';
		else if(ext == 'jpg' || ext == 'jpeg')
			mimeType = 'image/jpeg';
		else if(ext == 'png')
			mimeType = 'image/png';
			
			
		if(mimeType=='none')
			sap.m.MessageToast.show("Nieobsługiwany format pliku"); 
		else
		    cordova.plugins.fileOpener2.open(
				path, 
				mimeType, 
				{ 
					error : function(e) { 
						sap.m.MessageToast.show("Błąd otwierania pliku: " + e.message);
					},
					success : function() {
						sap.m.MessageToast.show("Plik został zapisany");                
					}
				}
			);
	}*/
	
	
});