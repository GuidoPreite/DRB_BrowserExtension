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
			<br/><br/>
			<div id="div_recentenvironments"></div>
			</div>`);
}

DRB.RequestAccessTokenGrantTypeImplicit = function() {
	// get the recent URLs
	chrome.storage.local.get('drb_be_recenturls', function (result) {
		// recreate the recent URLs making sure there are no duplicates with the current URL
		let current_resource_url = $("#" + DRB.DOM.AccessToken.InstanceUrlInput.Id).val();
		let recent_urls = [current_resource_url];
		if (DRB.Utilities.HasValue(result.drb_be_recenturls)) { result.drb_be_recenturls.forEach(function (url) { if (url !== current_resource_url) { recent_urls.push(url); } }); }
		
		// set the recent URLs and call the authorization page
		chrome.storage.local.set({drb_be_recenturls: recent_urls}, function() {
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
		});
	});
}

$(function() {
	// Main Body
	DRB.InsertMainBodyContentForExtension();
	
	// Dropdown for recent URLs
	$("#" + DRB.DOM.AccessToken.RecentEnvironmentsDiv.Id).append(DRB.UI.CreateSpan(DRB.DOM.AccessToken.RecentEnvironmentsSpan.Id, DRB.DOM.AccessToken.RecentEnvironmentsSpan.Name));
	$("#" + DRB.DOM.AccessToken.RecentEnvironmentsDiv.Id).append(DRB.UI.CreateDropdown(DRB.DOM.AccessToken.RecentEnvironmentsDropdown.Id));
			
	// Functions
	// Fill the recent URLs dropdown with the URLs inside storage
	DRB.GetRecentURLsFromStorageToDropdown = function () {
		chrome.storage.local.get('drb_be_recenturls', function (result) {
			DRB.Settings.RecentEnvironmentURLs = [];
			if (DRB.Utilities.HasValue(result.drb_be_recenturls)) { result.drb_be_recenturls.forEach(function (url) { DRB.Settings.RecentEnvironmentURLs.push(new DRB.Models.IdValue(url, url)); }); }
			DRB.Settings.RecentEnvironmentURLs.sort(DRB.Utilities.CustomSort("Value"));
			DRB.UI.FillDropdown(DRB.DOM.AccessToken.RecentEnvironmentsDropdown.Id, DRB.DOM.AccessToken.RecentEnvironmentsDropdown.Name, new DRB.Models.Records(DRB.Settings.RecentEnvironmentURLs).ToDropdown());
		});
	}
	
	// Enable/Disable the Get Access Token button if there is a value inside the main textbox and starts with https://
	$("#" + DRB.DOM.AccessToken.InstanceUrlInput.Id).on('input', function () {
		let instanceUrl = $(this).val();
		let btnDisabled = "true";
		if (DRB.Utilities.HasValue(instanceUrl) && instanceUrl.indexOf("https://") === 0) { btnDisabled = ""; }			
		$("#" + DRB.DOM.AccessToken.GetButton.Id).prop("disabled", btnDisabled);
	});
	
	DRB.RemoveRecentEnvironmentURL = function (id, value) {
		DRB.Settings.RecentEnvironmentURLs.splice(value, 1);
		let updated_recent_urls = [];
		DRB.Settings.RecentEnvironmentURLs.forEach(function (url) { updated_recent_urls.push(url.Id); });
		chrome.storage.local.set({drb_be_recenturls: updated_recent_urls}, function() {	DRB.GetRecentURLsFromStorageToDropdown(); });
	}
	
	// Fill the main textbox from the recent URL selected from the dropdown
	DRB.SelectRecentEnvironmentURL = function (id) {
		$("#" + id).on("change", function (e) {
			let selected_url = $(this).val();
			if (DRB.Utilities.HasValue(selected_url)) {
				DRB.UI.UnselectDropdown(id);
				$("#" + DRB.DOM.AccessToken.InstanceUrlInput.Id).val(selected_url).trigger('input');
			}
		});
	}
	
	// Bindings
	DRB.SelectRecentEnvironmentURL(DRB.DOM.AccessToken.RecentEnvironmentsDropdown.Id);
	
	$("#" + DRB.DOM.AccessToken.RecentEnvironmentsDropdown.Id).on('show.bs.select', function () {
		DRB.UI.RefreshDropdown(DRB.DOM.AccessToken.RecentEnvironmentsDropdown.Id);
	});
	
	$("#" + DRB.DOM.AccessToken.RecentEnvironmentsDropdown.Id).on('refreshed.bs.select', function () {
		$(".dropdown-item").each(function (idx) { $(this).prepend(DRB.UI.CreateRemoveButton(DRB.RemoveRecentEnvironmentURL, DRB.DOM.AccessToken.RecentEnvironmentsDropdown.Id, idx)); });
	});
	
	$("#" + DRB.DOM.AccessToken.GetButton.Id).click(DRB.RequestAccessTokenGrantTypeImplicit);
	
	// Get the recent URLs list
	DRB.GetRecentURLsFromStorageToDropdown();
});