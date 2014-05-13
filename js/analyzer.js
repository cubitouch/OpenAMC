var mcdText = "";
var mcdObject = false;
var evt = false;

	// <!-- BOOLEAN NOMMAGE -->

function checkUncheck(btn) {
	var checkLabel = "Cocher";
	var uncheckLabel = "Décocher";
	
	// console.log($(btn).parent().parent().parent().parent());
	// console.log($(btn).parent().parent().parent().parent().find('tbody input'));
	if ($(btn).text() == checkLabel)
		$(btn).parent().parent().parent().parent().find('tbody input').prop('checked', true);
	if ($(btn).text() == uncheckLabel)
		$(btn).parent().parent().parent().parent().find('tbody input').prop('checked', false);
}

function analyzeMCD() {
	if (mcdObject !== false)
		loadMCD(mcdObject);
}

function treatMCD() {
	var data = ReadFile();
	
	if (data) {
		treatMCDCallback(data);
	}
}
function treatMCDCallback(data) {
	$('#mcd').val('');
	mcdText = data;
	mcdObject = $(data);
	$('#modalLoadModel').modal('hide');	
	loadDomains();
	downloadFile();
}
function loadDomains() {
	$('#domains').empty();
	$('#filtersList tbody').empty();
	$(mcdObject).find('c\\:Packages o\\:Package').filter(function(){
		return ($(this).find('o\\:Package').length == 0);
	}).each(function(){
		$('#domains').append('<li id="'+$(this).attr('Id')+'" class="dropdown-submenu domain"><a href="#">'+$(this).find('> a\\:Name').text()+'</a><ul class="dropdown-menu"></ul></li>');
		$('#filtersList tbody').append('<tr><td>'+$(this).find('> a\\:Name').text()+'</td><td><input type="checkbox" value="'+$(this).attr('id')+'" checked/></td>');
		
		$(this).find('o\\:PhysicalDiagram').each(function(){
			$('#domains #'+$(this).parent().parent().attr('Id')+' .dropdown-menu').append('<li><a href="#" onclick="loadDiagram(\''+$(this).attr('id')+'\');">'+$(this).find('> a\\:Name').text()+'</a></li>');
		});
	});
}

function findIdNoInt(mcdObject){
	console.log('-- findIdNoInt --');
	var undefinds = $(mcdObject).find("c\\:Tables o\\:Table c\\:Columns o\\:Column a\\:Name").filter(function(){
		return ((/^Id$/i).test($(this).text())) && ($(this).parent().find("> a\\:DataType").text() != 'int');
	}).each(function(){
			var model = $(this).parent().parent().parent().parent().parent().find("> a\\:Name").text();
			var table = $(this).parent().parent().parent().find("> a\\:Name").text();
			var column = $(this).parent().find("> a\\:Name").text();
			console.log(model + ' - ' + table + ' - ' + column);
	});
	console.log('-- findIdNoInt ->' + undefinds.length);
}

function filterAnomalies(){
	$('#listUndefined tbody tr').show();
	$('#listBoolNullable tbody tr').show();
	$('#listIdentity tbody tr').show();
	$('#listFKNoIndex tbody tr').show();
	resetTotalAnomalies();
	
	$('#filtersList input:not(:checked)').each(function(){
		$('.'+$(this).val()).hide();
		resetTotalAnomalies();
	});
	
	$('#modalFilters').modal('hide');
}
function resetTotalAnomalies(){
	$('#totalUndefind').text($('#listUndefined tbody tr').length - $('#listUndefined tbody tr[style="display: none;"]').length);
	$('#totalBoolNullable').text($('#listBoolNullable tbody tr').length - $('#listBoolNullable tbody tr[style="display: none;"]').length);
	$('#totalIdentity').text($('#listIdentity tbody tr').length - $('#listIdentity tbody tr[style="display: none;"]').length);
	$('#totalFKNoIndex').text($('#listFKNoIndex tbody tr').length - $('#listFKNoIndex tbody tr[style="display: none;"]').length);
}

function loadMCD(mcdObject){
	/* ----- ANOMALIES ----- */
	listUndefinds(mcdObject);
	listBoolNullable(mcdObject);
	listIdentity(mcdObject);
	listFKNoIndex(mcdObject);
	
	findIdNoInt(mcdObject);
	$('#anomalies').show();
}

/* ----- ----- ----- ----- ANOMALIES ----- ----- ----- ----- */
function getAnomaliesLine(tableId,id,model,table,column){
	var res = '';
	
	res += '<tr class="'+id+'">';
	res += '<td>'+model+'</td>';
	res += '<td>'+table+'</td>';
	if (column != undefined){
		res += '<td>'+column+'</td>';
	}
	// var diagram = $(mcdObject).find('c\\:Packages o\\:Package[Id="'+id+'"] c\\:PhysicalDiagrams o\\:PhysicalDiagram:has(c\\:Symbols o\\:TableSymbol c\\:Object o\\:Table[Ref="'+tableId+'"])').attr('Id');
	// res += '<td><button class="btn" onclick="loadDiagram(\''+diagram+'\');">Voir</button></td>';
	res += '</tr>';
	
	return res;
}

function listUndefinds(mcdObject){
	$('#listUndefined tbody').empty();
	
	var undefinds = $(mcdObject).find("c\\:Tables o\\:Table c\\:Columns o\\:Column a\\:DataType").filter(function(){
		return (/^<undefined>$/i).test($(this).text());
	}).each(function(){
			var model = $(this).parent().parent().parent().parent().parent();
			var table = $(this).parent().parent().parent();
			var column = $(this).parent().find("> a\\:Name").text();
			$('#listUndefined tbody').append(getAnomaliesLine($(table).attr('Id'),$(model).attr('Id'),$(model).find("> a\\:Name").text(),$(table).find("> a\\:Name").text(),column));
	});
	$('#totalUndefind').text(undefinds.length);
}
function listBoolNullable(mcdObject){
	$('#listBoolNullable tbody').empty();
	
	var undefinds = $(mcdObject).find("c\\:Tables o\\:Table c\\:Columns o\\:Column a\\:DataType").filter(function(){
		return ((/^bit$/i).test($(this).text())) && ($(this).parent().find("> a\\:Column\\.Mandatory").length == 0);
	}).each(function(){
		var model = $(this).parent().parent().parent().parent().parent();
		var table = $(this).parent().parent().parent();
		var column = $(this).parent().find("> a\\:Name").text();
		$('#listBoolNullable tbody').append(getAnomaliesLine($(table).attr('Id'),$(model).attr('Id'),$(model).find("> a\\:Name").text(),$(table).find("> a\\:Name").text(),column));
	});
	$('#totalBoolNullable').text(undefinds.length);
}
function listIdentity(mcdObject){
	$('#listIdentity tbody').empty();
	
	var undefinds = $(mcdObject).find("c\\:Tables o\\:Table c\\:Columns o\\:Column a\\:Name").filter(function(){
		return ((/^Id$/i).test($(this).text())) && ($(this).parent().find("> a\\:Identity").length == 0);
	}).each(function(){
		var model = $(this).parent().parent().parent().parent().parent();
		var table = $(this).parent().parent().parent();
		var column = $(this).parent().find("> a\\:Name").text();
		$('#listIdentity tbody').append(getAnomaliesLine($(table).attr('Id'),$(model).attr('Id'),$(model).find("> a\\:Name").text(),$(table).find("> a\\:Name").text(),column));
	});
	$('#totalIdentity').text(undefinds.length);
}
function listFKNoIndex(mcdObject){
	$('#listFKNoIndex tbody').empty();
	
	var undefinds = $(mcdObject).find("c\\:Tables o\\:Table c\\:Columns o\\:Column a\\:Name").filter(function(){
		if ((/_/i).test($(this).text())) {
			var id = $(this).parent().attr('Id');
			return ($(this).parent().parent().parent().find('c\\:Indexes o\\:Index c\\:IndexColumns o\\:IndexColumn c\\:Column o\\:Column[Ref="'+id+'"]','c\\:Keys o\\:Key c\\:Key.Columns o\\:Column[Ref="'+id+'"]').length == 0);
		}
		return false;
	}).each(function(){
		var model = $(this).parent().parent().parent().parent().parent();
		var table = $(this).parent().parent().parent();
		var column = $(this).parent().find("> a\\:Name").text();
		$('#listFKNoIndex tbody').append(getAnomaliesLine($(table).attr('Id'),$(model).attr('Id'),$(model).find("> a\\:Name").text(),$(table).find("> a\\:Name").text(),column));
	});
	$('#totalFKNoIndex').text(undefinds.length);
}

