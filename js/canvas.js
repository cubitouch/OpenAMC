var _diviser = 8.5;
var _diviserTable = 80;
var _offsetX = 500;
var _offsetY = 100;
var b_canvas = false;


function loadDiagram(id) {
	//console.log(id);
	$(mcdObject).find('o\\:PhysicalDiagram[Id="'+id+'"]').each(function(){
		//console.log($(this));
		drawDiagram($(this));
	});
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = false;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}
function getCursorPosition(e) {
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
    } else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
	x -= b_canvas.offsetLeft;
    y -= b_canvas.offsetTop;
	
    return new Array(x,y);
}
function openTableModal(x,y){
	$('.modal').each(function(){
		if (
			x >= $(this).data('x1') &&
			x <= $(this).data('x2') &&
			y >= $(this).data('y1') &&
			y <= $(this).data('y2')
		) {
			$(this).modal();
		}
	});
}
function createTableModal(tableObject,position,columns) {
	var tableName = $(tableObject).find('> a\\:Name').text();
	var tableId = $(tableObject).attr('Id');
	
	var html = '';
	html += '<div id="'+tableId+'" class="modal hide" data-x1="'+position[0]+'" data-x2="'+position[1]+'" data-y1="'+position[2]+'" data-y2="'+position[3]+'">';
	html += '  <div class="modal-header">';
	html += '	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
	html += '	<h3>'+tableName+'</h3>';
	html += '  </div>';
	html += '  <div class="modal-body">';
	html += '	<table class="table table-bordered table-hover table-condensed">';
	html += '	<tr>';
	html += '		<th>Colonne</th>';
	html += '		<th>Type</th>';
	html += '	</tr>';
	
	for (var i = 0; i < $(columns).length; i++) {
		html += '	<tr>';
		html += '		<td>'+$(columns[i]).text()+'</td>';
		html += '		<td>'+$(columns[i]).parent().find('a\\:DataType').text()+'</td>';
		html += '	</tr>';
	}
	
	html += '	</table>';
	html += '  </div>';
	html += '</div>';
	
	$('#modals').append(html);
}

function diagramOnClick(e) {
    var cell = getCursorPosition(e);
    //console.log(cell);
	openTableModal(cell[0],cell[1]);
}

function drawDiagram(diagram) {
	var margin = $(diagram).find('a\\:PageMargins').text();
	
	var papersize = $(diagram).find('a\\:PaperSize').text();
	var papersizeArray = papersize.replace(/\(/g,'').replace(/\)/g,'').replace(/ /g,'').split(',');
	var papersizeX = papersizeArray[0] / _diviser+20;
	var papersizeY = papersizeArray[1] / _diviser+20;
	
	$('#modals').empty();
	$('#container').empty();
	$('#container').append('<fielset><legend>&nbsp;&nbsp;'+$(diagram).parent().parent().find('> a\\:Name').text()+' - '+$(diagram).find('> a\\:Name').text()+'</legend></fieldset>');
	$('#container').append('<canvas id="model" style="border:1px dashed #999;" width="'+papersizeX+'" height="'+papersizeY+'"></canvas>');
	//console.log($('#model'));
	b_canvas = document.getElementById("model");
	var b_context = b_canvas.getContext("2d");
	
	b_context.beginPath();
	var relations = $(diagram).find('c\\:Symbols o\\:ReferenceSymbol a\\:ListOfPoints').each(function(){
		drawRelation(b_context,this, papersizeY, papersizeX);
	});
	b_context.stroke();
	b_context.beginPath();
	var tables = $(diagram).find('c\\:Symbols o\\:TableSymbol a\\:Rect').each(function(){
		drawTable(b_context,this, papersizeY, papersizeX);
	});
	
	b_canvas.addEventListener("click", diagramOnClick, false);
}

function drawTable(b_context, table, papersizeX, papersizeY) {
	var tablesize = $(table).text();
	var tablesizeArray = tablesize.replace(/\(/g,'').replace(/\)/g,'').replace(/ /g,'').split(',');
	
	var tablesizeX1 = tablesizeArray[0] / _diviserTable + papersizeX - _offsetX;
	var tablesizeY1 = tablesizeArray[1] / _diviserTable + papersizeY/3 - _offsetY;
	var tablesizeX2 = tablesizeArray[2] / _diviserTable + papersizeX - _offsetX;
	var tablesizeY2 = tablesizeArray[3] / _diviserTable + papersizeY/3 - _offsetY;
	
	var tableId = $(table).parent().find('o\\:Table, o\\:Shortcut').attr('Ref');
	var tableObject = $(table).parent().parent().parent().parent().parent().find('[Id="'+tableId+'"]');
	var tableName = $(tableObject).find('> a\\:Name').text();
	var columns = $(tableObject).find('c\\:Columns o\\:Column a\\:Name');
	var shortcut = false;
	if ($(columns).length == 0) {
		columns = $(tableObject).parent().parent().parent().parent().parent().find('a\\:ObjectID:contains("'+$(tableObject).find('a\\:TargetID').text()+'")').parent().find('c\\:Columns o\\:Column a\\:Name');
		shortcut = true;
	}
	
	/* DRAW TABLE */
	if (shortcut)
		b_context.fillStyle = '#ccc';
	else
		b_context.fillStyle = '#eee';
	b_context.strokeStyle = '#333';
	b_context.fillRect(tablesizeX1,tablesizeY1,tablesizeX2-tablesizeX1,tablesizeY2-tablesizeY1);
	roundRect(b_context,tablesizeX1,tablesizeY1,tablesizeX2-tablesizeX1,tablesizeY2-tablesizeY1);
	b_context.fillStyle = '#333';
	
	b_context.moveTo(tablesizeX1,tablesizeY1+16);
	b_context.lineTo(tablesizeX2,tablesizeY1+16);
	
	createTableModal(tableObject,new Array(tablesizeX1,tablesizeX2,tablesizeY1,tablesizeY2),columns);
	
	/* DRAW TITLE */
	b_context.font = "bold 10px sans-serif";
	b_context.fillText(tableName, tablesizeX1+2, tablesizeY1+12);
	
	/* DRAW COLUMNS */
	var columnName = '';
	var offset = 30;
	var truncated = false;
	var pk = false;
	for (var i = 0; i < $(columns).length; i++) {
		pk = false;
		b_context.fillStyle = '#333';
		columnName = $(columns[i]).text();
		
		if ($("#modalErrors > .modal > .modal-body > .table > tbody > tr."+$(tableObject).parent().parent().attr('Id')).filter(function(){
			return ( new RegExp("^"+tableName.replace(/\?/g,'')+"$","g").test($(this).find("td").eq(1).text()) && new RegExp("^"+columnName.replace(/\?/g,'')+"$","g").test($(this).find("td").eq(2).text()));
			//return ($(this).find(" > td:contains('<td>"+columnName+"</td>')").length > 0);
		}).length > 0) {
			//console.log(tableName+"-"+columnName);
			b_context.fillStyle = '#A40000';
		}
		
		if (isDisplayColumn(columnName)) {
			if (tablesizeY1-2+offset >= tablesizeY2) {
				truncated = true;
				break;
			}
			
			if ($(table).parent().parent().parent().parent().parent().find('c\\:Keys o\\:Column[Ref="'+$(columns[i]).parent().attr('Id')+'"]').length > 0) {
				pk = true;
				b_context.font = "bold 9px sans-serif";
			}
			else if (columnName.indexOf('_') != -1) {
				b_context.font = "bold 9px sans-serif";
			}
			else {
				b_context.font = "9px sans-serif";
			}
			
			b_context.fillText($(columns[i]).text()+(pk?' *':''), tablesizeX1+2, tablesizeY1-2+offset);
		}
			
		offset+=12;
	}
	if (truncated) {
		b_context.font = "bold 12px sans-serif";
		b_context.fillText('...', tablesizeX1+2, tablesizeY2+6);
	}
	
	b_context.stroke();
	b_context.beginPath();
}

function drawRelation(b_context, relation, papersizeX, papersizeY) {
	var relationsize = $(relation).text(); // ((-44265,-5567), (-11549,-5068))
	var relationsizeArray = relationsize.replace(/\(/g,'').replace(/\)/g,'').replace(/ /g,'').split(',');
	var relationsizeX1 = relationsizeArray[0] / _diviserTable + papersizeX-_offsetX;
	var relationsizeY1 = relationsizeArray[1] / _diviserTable + papersizeY/3-_offsetY;
	var relationsizeX2 = relationsizeArray[2] / _diviserTable + papersizeX-_offsetX;
	var relationsizeY2 = relationsizeArray[3] / _diviserTable + papersizeY/3-_offsetY;
	
	b_context.moveTo(relationsizeX2,relationsizeY2);
	b_context.lineTo(relationsizeX1,relationsizeY1);
}

function isDisplayColumn(columnName) {
	return (
	columnName != 'CreationDate' &&
	columnName != 'CreationUserId' &&
	columnName != 'CreationProgram' &&
	columnName != 'ModificationDate' &&
	columnName != 'ModificationUserId' &&
	columnName != 'ModificationProgram'
	);
}