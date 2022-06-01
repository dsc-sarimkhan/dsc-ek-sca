var startApplication = function() {
	require(["Loggers", "Loggers.Configuration.SCA"], function(Loggers, LoggersConfiguration) {
		Loggers.Loggers.setConfiguration(LoggersConfiguration.configuration);
	});

	require(["{{starterName}}"]);
	{{{afterapplicationstarts}}}
}

if(!window.loadedResourcesPromises){
	startApplication();
} else {
	Deferred.all(window.loadedResourcesPromises)
	.done(function(){
		{{#if is_shopping}}
            	try
            	{
	        {{/if}}
			startApplication();
		{{#if is_shopping}}
            	}catch(e){
                	document.getElementById('main').style.display = "block";
        	}
	        {{/if}}
	});
}
