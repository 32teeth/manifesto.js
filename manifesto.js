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
	** @param cbfuncs {object}
	** @description 
	*/	
	var callbacks = {
		checking:false,
		error:false,
		noupdate:false,
		downloading:false,
		progress:false,
		updateready:false,
		cached:false,
		obsolete:false
	};

	/*
	** @param events {array}
	** @description 
	*/	
	var events = ["checking","error","noupdate","downloading","progress","updateready","cached","obsolete"];

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
	** @param redirect {string}
	** @description 
	*/	
	var redirect;

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
	function init(cbfuncs)
	{
		if(cbfuncs)
		{
			for(var cb in cbfuncs)
			{
				callbacks[cb] = cbfuncs[cb];
			}
		}

		if(cache){bind();}
		if(connection){get();}
	}

	/*
	** @method bind
	** @description
	*/
	function bind()
	{
		(events).forEach(function(e)
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
		var online = content.replace(new RegExp("(NETWORK|FALLBACK):((?!(NETWORK|FALLBACK|CACHE):)[\\w\\W]*)","gi"),"");
		var offline = content.match(new RegExp("(FALLBACK):((?!(NETWORK|FALLBACK|CACHE):)[\\w\\W]*)(.|[\r\n])*","gim"))[0];

		/*
		** Strip out all comments.
		*/
		online = online.replace(new RegExp("#[^\\r\\n]*(\\r\\n?|\\n)", "g" ),"");
		offline = offline.replace(new RegExp("#[^\\r\\n]*(\\r\\n?|\\n)", "g" ),"");

		/*
		** Strip out the cache manifest header and
		** trailing slashes.
		*/
		online = online.replace(new RegExp("CACHE MANIFEST\\s*|\\s*$", "g"),"");
		offline = offline.replace(new RegExp("CACHE MANIFEST\\s*|\\s*$", "g"),"");

		/*
		** Strip out extra line breaks and replace with
		** a hash sign that we can break on.
		*/
		online = online.replace(new RegExp("[\\r\\n]+", "g"),"#");
		offline = offline.replace(new RegExp("[\\r\\n]+", "g"),"#");

		redirect = offline.split("#")[1];
		localStorage.setItem("redirect", redirect);

		files.count = online.split("#").length;
	}

	/*
	** @method handler
	** @description handler
	*/			
	function handler(e)	
	{
		var phase = e.eventPhase;
		var type = e.type;

		switch(type)
		{
			/*
			** Checking for an update. Always the first event fired in the sequence.
			*/
			case 'checking':

			break;

			/*
			** An update was found. The browser is fetching resources.
			*/
			case 'downloading':

			break;

			/*
			** The manifest returns 404 or 410, the download failed,
			** or the manifest changed while the download was in progress.
			*/
			case 'error':
				window.location.href = localStorage["redirect"];
			break;

			/*
			** Fired after the first download of the manifest.
			*/
			case 'noupdate':

			break;

			/*
			** Fired if the manifest file returns a 404 or 410.
			** This results in the application cache being deleted.
			*/
			case 'obsolete':

			break;

			/*
			** Fired for each resource listed in the manifest as it is being fetched.
			*/
			case 'progress':
				files.loaded++;
			break;

			/*
			** Fired when the manifest resources have been newly redownloaded.
			*/
			case 'cached':

			break;

			case 'updateready':

			break;			
		}

		if((typeof callbacks[type] === 'function'))
		{
		  callbacks[type](type, files);
		}		
	}


	return {
		init:function(cbfuncs){init(cbfuncs);},
		handler:function(e){handler(e);}
	}
})();

