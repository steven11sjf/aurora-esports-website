var dir = "desc";
var lastCol = -1;

function removeArrows() {
  // remove any arrows
  let q1 = document.getElementsByClassName("headerSortUp");
  console.log(q1);
  for(i=0;i<q1.length;++i) {
	console.log(i);
	q1[i].classList.remove("headerSortUp");
  }

  //for(var el in q1) el.classList.remove("headerSortUp");
  let q2 = document.getElementsByClassName("headerSortDown");
  console.log(q2);
  for(i=0;i<q2.length;++i) {
	console.log(i);
	q2[i].classList.remove("headerSortDown");
  }
}
// sorts a table, using the table's id, the row number, and whether the column is alphabetical or numeric
function sortTable(tableid, n, isNum) {
  var table, rows, switching, i, x, y, shouldSwitch, switchcount = 0;
  table = document.getElementById(tableid);
  switching = true;
  removeArrows();
  // Set the sorting direction to ascending:
  console.log(dir,n,lastCol);
  if(lastCol != n) {
	  if(isNum) dir = "desc";
	  else dir = "asc";
  }
  else if(dir == "asc") dir = "desc";
  else dir = "asc";
  // add arrow to bar
  let query = document.querySelectorAll("#" + tableid + " > thead > tr > th")[n];
  console.log(query);
  if(dir == "desc") query.classList.add("headerSortDown");
  else query.classList.add("headerSortUp");
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
	  if(isNum) {
		  if (dir == "asc") {
			  let xx = parseFloat(x.textContent);
			  let yy = parseFloat(y.textContent);
			  if(xx == NaN && yy != NaN) {
				  // Send NaN to bottom
				  shouldSwitch = true;
				  break;
			  }
			  if(xx != NaN && yy == NaN) {
				  // Send NaN to bottom
				  shouldSwitch = false;
				  break;
			  }
			  if (xx > yy) {
			    // If so, mark as a switch and break the loop:
			    shouldSwitch = true;
			    break;
			  }
		  } else if (dir == "desc") {
			  console.log("foo");
			  let xx = parseFloat(x.textContent);
			  let yy = parseFloat(y.textContent);
			  if(xx == NaN && yy != NaN) {
				  // Send NaN to bottom
				  shouldSwitch = false;
				  break;4
			  }
			  if(xx != NaN && yy == NaN) {
				  // Send NaN to bottom
				  shouldSwitch = true;
				  break;
			  }
			  if (xx < yy) {
				  console.log("bar");
			    // If so, mark as a switch and break the loop:
			    shouldSwitch = true;
			    break;
			  }
			  console.log("fubar",x.textContent,xx,yy);
		  }
	  } else {
		  if (dir == "asc") {
			if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
			  // If so, mark as a switch and break the loop:
			  shouldSwitch = true;
			  break;
			}
		  } else if (dir == "desc") {
			if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
			  // If so, mark as a switch and break the loop:
			  shouldSwitch = true;
			  break;
			}
		  }
	  }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount ++;
    }
  }
  lastCol = n;
}