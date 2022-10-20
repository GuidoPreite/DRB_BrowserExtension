DRB.InsertMainBodyContentForExtension = function () {
    $("#" + DRB.DOM.MainBody.Id).html(`<div class="mainlayout col-lg-12">
            <div class="mainheader">
                <h3>Dataverse REST Builder (Browser Extension)</h3>
                Created by Guido Preite <a target="_blank" href="https://www.twitter.com/crmanswers">Twitter</a> - <a target="_blank" href="https://www.linkedin.com/in/guidopreite/">LinkedIn</a> - <a target="_blank" href="https://github.com/GuidoPreite">GitHub</a> - <a target="_blank" href="https://www.crmanswers.net">Blog</a>
            </div>
			<div class="topborder maincontent">
			<br />
			<input type="text" class="form-control" id="` + DRB.DOM.AccessToken.InstanceUrlInput.Id + `" style="width: 540px; height: 28px; display: inline;" autocomplete="off", placeholder="Enviroment URL like https://contoso.crm.dynamics.com" />
			<br /><br />
			<button id="` + DRB.DOM.AccessToken.GetButton.Id + `" type="button" class="` + DRB.DOM.AccessToken.GetButton.Class + `" disabled="disabled">` + DRB.DOM.AccessToken.GetButton.Name + `</button>
			 </div>`);
}

DRB.RequestAccessTokenGrantTypeImplicit = function() {
	let auth_url = 'https://login.microsoftonline.com/common/oauth2/authorize';
	let resource_url = $("#" + DRB.DOM.AccessToken.InstanceUrlInput.Id).val();
	let client_id = '51f81489-12ee-4a9e-aaae-a2591f45987d';
	let redirect_url = 'https://callbackurl';
	
	let auth_params = {
		resource: resource_url,
		client_id: client_id,
		redirect_uri: redirect_url,
		prompt: 'select_account',
		response_type: 'token'
	};
	
	auth_url += '?' + $.param(auth_params);
	window.location.href = auth_url;
}

$(function() {
	DRB.InsertMainBodyContentForExtension();
	$("#" + DRB.DOM.AccessToken.InstanceUrlInput.Id).on('input', function () {
		let instanceUrl = $(this).val();
		let btnDisabled = "true";
		if (DRB.Utilities.HasValue(instanceUrl) && instanceUrl.indexOf("https://") === 0) { btnDisabled = ""; }			
		$("#" + DRB.DOM.AccessToken.GetButton.Id).prop("disabled", btnDisabled);
	});
	$("#" + DRB.DOM.AccessToken.GetButton.Id).click(DRB.RequestAccessTokenGrantTypeImplicit);
});