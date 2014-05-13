var _referenceList = new Array();
var _doubleList = new Array();

function changeReferences() {
	_referenceList = new Array();
	_doubleList = new Array();
	console.log('changeReferences');
	var refs = $(mcdObject).find('c\\:Packages o\\:Package c\\:References  o\\:Reference')/*.filter(function(){
		return  $(this).find('> a\\:Name').text().match(/Reference_/);
	})*/.each(function() {
		renameReference(this);
	}).promise().done(function(){
		downloadFile();
		console.log(_referenceList.length);
		console.log(_doubleList.length);
	});
	console.log($(refs).length);
}
function renameReference(ref){
	var ref_a = $(ref).find('c\\:ParentTable *');
	var ref_b = $(ref).find('c\\:ChildTable *');
	
	var tableid_a = $(ref_a).attr('Ref');
	var tableid_b = $(ref_b).attr('Ref');
	
	var table_a = false;
	var table_b = false;
	if ($(ref_a).get(0).tagName == 'O:SHORTCUT') {
		table_a = $(mcdObject).find('o\\:Package c\\:Tables o\\:Shortcut[Id="'+tableid_a+'"]');
		// console.log($(mcdObject).find('o\\:Package c\\:Tables o\\:Shortcut[Id="'+tableid_a+'"]').length);
	} else {
		table_a = $(mcdObject).find('o\\:Package c\\:Tables o\\:Table[Id="'+tableid_a+'"]');
	}
	if ($(ref_b).get(0).tagName == 'O:SHORTCUT') {
		table_b = $(mcdObject).find('o\\:Package c\\:Tables o\\:Shortcut[Id="'+tableid_b+'"]');
		// console.log($(mcdObject).find('o\\:Package c\\:Tables o\\:Shortcut[Id="'+tableid_b+'"]').length);
	} else {
		table_b = $(mcdObject).find('o\\:Package c\\:Tables o\\:Table[Id="'+tableid_b+'"]');
	}
	
	var newRefA = $(table_a).find('> a\\:Name').text();
	var newRefB = $(table_b).find('> a\\:Name').text();
	
	var oldRef_Name = $(ref).find('a\\:Name').text();
	var oldRef_Code = $(ref).find('a\\:Code').text();
	var oldRef_Constraint = $(ref).find('a\\:ForeignKeyConstraintName').text();
	var newRef = '';
	
	// console.log($(ref_a).get(0).tagName + '-' + tableid_a);
	// console.log($(ref_b).get(0).tagName + '-' + tableid_b);
	// console.log(oldRef);
	// console.log('FK_'+newRefA+'_'+newRefB);
	
	if (newRefA.trim() != '' && newRefA.trim() != '') {
		newRef = 'FK_'+newRefA+'_'+newRefB;
		if ($.inArray(newRef, _referenceList) == -1) {
			_referenceList.push(newRef);
		} else {
			_doubleList.push(newRef);
			console.log(newRef);
		}
		
		//$(ref).find('a\\:Name, a\\:Code, a\\:ForeignKeyConstraintName').text(newRef);
		mcdText = mcdText.replace("<a:Name>"+oldRef_Name+"</a:Name>","<a:Name>"+newRef+"</a:Name>");
		mcdText = mcdText.replace("<a:Code>"+oldRef_Code+"</a:Code>","<a:Code>"+newRef+"</a:Code>");
		mcdText = mcdText.replace("<a:ForeignKeyConstraintName>"+oldRef_Constraint+"</a:ForeignKeyConstraintName>","<a:ForeignKeyConstraintName>"+newRef+"</a:ForeignKeyConstraintName>");
		return true;
	}
	
	return false;
}