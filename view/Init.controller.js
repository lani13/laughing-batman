jQuery.sap.require("util.Formatter");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("util.Util");

sap.ui.controller("view.Init", {

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		
	},

	onLoginUser : function (oEvent) {
	    var loginInput = this.getView().byId("loginInput");   
	    var passInput = this.getView().byId("passInput"); 

		if(loginInput.getValue()=='admin' && passInput.getValue()=='pleple13')
				this._router.navTo("home", {}, !sap.ui.Device.system.phone);
		else
			sap.m.MessageToast.show("Błędne dane logowania");
	}
	
});