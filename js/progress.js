var progress = (function(){

	var id = "progress";
	var style = {
		 "position":"fixed",
		 "bottom":"0",
		 "left":"0",
		 "top":"0",
		 "display":"block",
		 "height":"3px",
		 "width":"10%",
		 "zIndex":"9999",
		 "background":"rgba(255,0,0,1)",
		 "border":"solid 1px rgba(153,0,0,0.75)",
		 "textAlign":"right",
		 "transition":"all 100ms ease-in",
		 "fontSize":"10px"
	}
	var progress = document.createElement('div');
	progress.setAttribute('id', id);
	for(var prop in style)
	{
		 progress.style[prop] = style[prop];
	}
	progress.innerHTML = "checking"

	document.body.appendChild(progress);

	/*
	**
	*/
	var message = ""

	/*
	**
	*/
	function state(type, files)
	{
		switch(type)
		{
			/*
			** Checking for an update. Always the first event fired in the sequence.
			*/
			case 'checking':
				progress.innerHTML = "checking cache";
				message = "ok";
			break;

			/*
			** An update was found. The browser is fetching resources.
			*/
			case 'downloading':
				progress.style.width = "0%";
				progress.innerHTML = "downloading files to cache";
				message = "ok";
			break;

			/*
			** The manifest returns 404 or 410, the download failed,
			** or the manifest changed while the download was in progress.
			*/
			case 'error':

			break;

			/*
			** Fired after the first download of the manifest.
			*/
			case 'noupdate':
				progress.innerHTML = "no updates found";
				progress.style.width = "100%";
				setTimeout(function(){
					 progress.parentNode.removeChild(progress);
				},1000);

				message = "ok";
			break;

			/*
			** Fired if the manifest file returns a 404 or 410.
			** This results in the application cache being deleted.
			*/
			case 'obsolete':
				message = "ok";
			break;

			/*
			** Fired for each resource listed in the manifest as it is being fetched.
			*/
			case 'progress':
				var width = Math.ceil((files.loaded/files.count)*100);
				progress.innerHTML = "caching " + files.loaded + "/" + files.count + " files";
				progress.style.width = width + "%";
				if(width >= 100)
				{
					 setTimeout(function(){
							progress.parentNode.removeChild(progress);
					 },1000);
					 document.getElementById(type).classList.add("success");
				}

				message = files.loaded + "/" + files.count;
			break;

			/*
			** Fired when the manifest resources have been newly redownloaded.
			*/
			case 'cached':
				progress.style.width = "100%";
				progress.innerHTML = files.loaded + "/" + files.count + " files cached";
				setTimeout(function(){
					 progress.parentNode.removeChild(progress);
				},1000);
				message = "ok";
			break;

			case 'updateready':
				message = "ok";
			break;				 
 		}

 		document.getElementById(type).innerHTML = message;
	}

	return{
		state:function(type, files){state(type, files);}
	}
})();