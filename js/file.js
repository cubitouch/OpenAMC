$(function(){
	$("#mcd").change(function(e){
		evt = e;
	});
});

function ReadFile()	{
	var filePath = $('#mcd').val();
	
	if (filePath == '') {
		alert('Veuillez sélectionner le MCD');
		return false;
	}
	var res = false;
	
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
		var files = evt.target.files; // FileList object
		var f = files[0];
		var reader = new FileReader();
		
		// Closure to capture the file information.
		reader.onload = function(e) {
			$('.progress').remove();
			console.log('callback');
			treatMCDCallback(e.currentTarget.result);
		};
		reader.onerror = function errorHandler(evt) {
			console.log('onerror');
			switch(evt.target.error.code) {
				case evt.target.error.NOT_FOUND_ERR:
					alert('File Not Found!');
					break;
				case evt.target.error.NOT_READABLE_ERR:
					alert('File is not readable');
					break;
				case evt.target.error.ABORT_ERR:
					break; // noop
				default:
					alert('An error occurred reading this file.');
			};
		};
		reader.onabort = function(e) {
			console.log('onabort');
		};
		reader.onloadstart = function(e) {
			console.log('onloadstart');
			$('#modalLoadModel .form-inline').append('<div class="progress"><div class="bar" style="width: 0%;"></div></div>');
		};
		reader.onprogress  = function updateProgress(evt) {
			console.log('onprogress');
			// evt is an ProgressEvent.
			if (evt.lengthComputable) {
				var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
				// Increase the progress bar length.
				if (percentLoaded < 100) {
					$('.progress .bar').css('width',percentLoaded+'%');
					//console.log(percentLoaded);
				}
			}
		};


		// Read in the image file as a data URL.
		console.log('read file: ' + f.name);
		reader.readAsText(f);
	} else {
		var FileOpener = new ActiveXObject("Scripting.FileSystemObject");
		var FilePointer = FileOpener.OpenTextFile(filePath, 1, true);
		res = FilePointer.ReadAll(); // we can use FilePointer.ReadAll() to read all the lines
		FilePointer.Close();
	}

	/* CROSS BROWSER : http://www.html5rocks.com/en/tutorials/file/dndfiles/*/
	
	return res;
}

function downloadFile() {
	window.URL = window.URL || window.webkitURL;
	var blob = new Blob([mcdText]);
	var url  = window.URL.createObjectURL(blob);
	
	var li = $('a#download').parent();
	var a = document.createElement('a');//;
	a.download = 'MCD.mpd';
	a.href = url;
	a.innerHTML = '<i class="icon-download-alt"></i> Télécharger le MCD';
	a.id= 'download'

	a.dataset.downloadurl = ['text/xml', a.download, a.href].join(':');
	a.draggable = true; // Don't really need, but good practice.

	console.log('download');
	$('a#download').remove();
	$(li).removeClass('disabled');
	$(li).append(a);
}
