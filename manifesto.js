/*
** @author Eugene Andruszczenko
** @version 0.1
** @date May 7th, 2015
** @description 
** manifesto.js is a cache manifest (appchache) manager
*/

/*
** @class manifesto 
** @description revealing module pattern
**
*/
var manifesto = (function(){
	/*
	** @param cache {boolean}
	** @description 
	*/
	var cache = window.applicationCache;	

	/*
	** @param broadcaster {array}
	** @description 
	*/	
	var broadcaster = ["checking","error","noupdate","downloading","progress","updateready","cached","obsolete"];

	/*
	** @param connection {boolean}
	** @description 
	*/
	var connection = window.navigator.onLine;

	/*
	** @param files {object}
	** @description 
	*/		
	var files = {
		count:0,
		loaded:0
	}

	/*
	** @param manifest {string}
	** @description 
	*/	
	var manifest = false;

	/*
	** @param response {string}
	** @description 
	*/	
	var response;	

	/*
	**
	**
	*/
	var progress;
	var message;
	var status;

	/*
	** @param xhr {object}
	** @description 
	*/		
	var xhr = window.XMLHttpRequest ? 
		new XMLHttpRequest() : 
		window.ActiveXObject ? 
			new ActiveXObject('Msxml2.XMLHTTP') : 
			new ActiveXObject("Microsoft.XMLHTTP");

	/*
	** @method init
	** @description init
	*/			
	function init(progress)
	{
		if(progress)
		{
			status = true;
			progressbar();
		}
		if(cache){bind();}
		if(connection){get();}
	}

	/*
	** @method progressbar
	*/
	function progressbar()
	{
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
		progress = document.createElement('div');
		progress.setAttribute('id', id);
		for(var prop in style)
		{
			progress.style[prop] = style[prop];
		}
		progress.innerHTML = "checking"

		document.body.appendChild(progress);
	}

	/*
	** @method bind
	** @description
	*/
	function bind()
	{
		(broadcaster).forEach(function(e)
	    {
	      cache.addEventListener(e,manifesto.handler,false);
	    }
	  );
	}

	/*
	** @method get
	** @description
	*/
	function get()
	{
		var html = document.getElementsByTagName("html")[0];
		if(html.getAttribute("manifest"))
		{
			manifest = html.getAttribute("manifest");

			xhr.onreadystatechange = function()
			{
				if(xhr.readyState === 4 && xhr.status === 200)
				{
					parse(xhr.responseText);
				}
			}
			xhr.open("GET", manifest, false);			
			xhr.send();
		}		
	}

	/*
	** @method parse
	** @description parse
	*/			
	function parse(content)
	{
		/*
		** Strip out the non-cache sections.
		** NOTE: The line break here is only to prevent
		** wrapping in the BLOG.
		*/
		content = content.replace(
			new RegExp(
				"(NETWORK|FALLBACK):" +
				"((?!(NETWORK|FALLBACK|CACHE):)[\\w\\W]*)",
				"gi"
			),
			""
		);

		/*
		** Strip out all comments.
		*/
		content = content.replace(
			new RegExp(
				"#[^\\r\\n]*(\\r\\n?|\\n)", "g" 
			),
			""
		);

		/*
		** Strip out the cache manifest header and
		** trailing slashes.
		*/
		content = content.replace(
			new RegExp(
				"CACHE MANIFEST\\s*|\\s*$", "g"
			),
			""
		);

		/*
		** Strip out extra line breaks and replace with
		** a hash sign that we can break on.
		*/
		content = content.replace(
			new RegExp(
				"[\\r\\n]+", "g"
			),
			"#"
		);

		files.count = content.split("#").length;

		response = content;
	}

	/*
	** @method handler
	** @description handler
	*/			
	function handler(e)	
	{
		var phase = e.eventPhase;
		var type = e.type;
		console.log(type)
		switch(type)
		{
			/*
			** Checking for an update. Always the first event fired in the sequence.
			*/
			case 'checking':
				if(status)
				{
					progress.innerHTML = "checking cache";
				}

				document.getElementById("checking").innerHTML = "ok";
			break;

			/*
			** An update was found. The browser is fetching resources.
			*/
			case 'downloading':
				if(status)
				{
					progress.style.width = "0%";
					progress.innerHTML = "downloading files to cache";
				}

				document.getElementById("downloading").innerHTML = "ok";
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
				if(status)
				{
					progress.innerHTML = "no updates found";
					progress.style.width = "100%";
					setTimeout(function(){
						progress.parentNode.removeChild(progress);
					},1000);
				}

				document.getElementById("noupdate").innerHTML = "ok";
			break;

			/*
			** Fired if the manifest file returns a 404 or 410.
			** This results in the application cache being deleted.
			*/
			case 'obsolete':
				document.getElementById("noupdate").innerHTML = "ok";
			break;

			/*
			** Fired for each resource listed in the manifest as it is being fetched.
			*/
			case 'progress':
				if(status)
				{
					files.loaded++;
					var width = Math.ceil((files.loaded/files.count)*100);
					progress.innerHTML = "caching " + files.loaded + "/" + files.count + " files";
					progress.style.width = width + "%";

					if(width > 100){progress.parentNode.removeChild(progress);}
				}

				document.getElementById("progress").innerHTML = files.loaded + "/" + files.count;
			break;

			/*
			** Fired when the manifest resources have been newly redownloaded.
			*/
			case 'cached':
				if(status)
				{
					progress.style.width = "100%";
					progress.innerHTML = files.loaded + "/" + files.count + " files cached";
					setTimeout(function(){
						progress.parentNode.removeChild(progress);
					},1000);
				}

				document.getElementById("cached").innerHTML = files.loaded + "/" + files.count;
			break;

			case 'updateready':

			break;			
		}		
	}


	return {
		init:function(progress){init(progress);},
		handler:function(e){handler(e);}
	}
})();

manifesto.init(true);

