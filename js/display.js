$('document').ready(function(){




  // ---------- Board display -------------------------------------------
  function displayBoard(boardObject){
    var board = $('#board');
    var row = $('<div>').addClass('row');
    var field = $('<div>').addClass('field');
    for (var i = 0; i < boardObject.size; i++) {
      row.data("row", boardObject.fields[i * boardObject.size][i].y);
      for (var j = 0; j < boardObject.fields.size; j++) {
        field.data('column', boardObject.fields[i][j].x).addClass(boardObject.fields[i][j].content)
        row.append(field);
      }
      board.append(row);
    }
  }

});
