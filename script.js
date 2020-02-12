let ships;
let n_ships_str;
let output_div;
// let scale_factor = getComputedStyle(document.documentElement)
//     .getPropertyValue("--scale-factor");

// document.body.addEventListener("click", removeCalendarOutput);

// Add capitalize method to string class
Object.defineProperty(String.prototype, "capitalize", {
	value: function() {
		return this.slice(0, 1).toUpperCase() + this.slice(1, this.length).toLowerCase()
	}
});

function resizeCalendar() {
  if (window.innerWidth < 450) {
    let scale_factor = 1.1;
    document.documentElement.style.setProperty("--scale-factor", scale_factor);

  }
}

// Get the auto-calendar (we have to wait the window load event)
let calendar = jsCalendar.new('#my-calendar', Date.now(), {language:"es"});
// Make changes on the month element
calendar.onMonthRender(function(index, element, info) {
  // Show month index
  let month = index + 1;
  element.textContent += ', ' + (info.start.getYear() + 1900);
});

let data_url = "http://risp.puertosdetenerife.org/dataset/eff95e11-4baa-4ab8-aeb2-33d80c6395d8/resource/4b31504e-fd63-4eba-a9ef-6663a12d5dd0/download/crucerosprevistos.csv";
Papa.parse(data_url, {
	download: true,
  header: true,
  encoding: "ISO-8859-1",
	complete: function(results) {
    
    initialize(results);

	}
});
// Papa.parse("crucerosprevistos_Tenerife.csv", {
// 	download: true,
//   header: true,
// 	complete: function(results) {
//
//     initialize(results);
//
// 	}
// });


function initialize(results) {
  ships = results.data.filter(s => s.PUERTO_ID === "T");
  ships.pop();
  const fields = Object.keys(ships[0]);
  console.log(fields);
  let names = getPropertyValuesAcrossShips("H_ENTRADA", ships);
  let lengths = getPropertyValuesAcrossShips("ESLORA", ships);
  let arrival_date = ships.map(ship => ship["F_ENTRADA"]);

  let dates = ships.filter(ship => parseFloat(ship["ESLORA"]) > 0).map(
    ship => ship["F_ENTRADA"]);

  let current_date = new Date;
  let current_month = current_date.getMonth() + 1;
  let n_ships_in_current_month = countShipsInMonth(current_month, dates);
  console.log(n_ships_in_current_month);

  selectDates(dates, calendar);

  let categories = {
    field: "MUELLE",
    values: {
      "SUR AL 2 (-)": "#70ee0d",
      "RIBERA AL 2 (-)": "#fe1356",
      "SUR AL 3 (-)": "#f5de12",
      "LLANOS DIQUE CENTRAL (-)": "#86ecff"
    }
  }
  addCalendarMarks(dates, calendar, categories);
  addCalendarLegend(categories);

  let mes = date.toLocaleString('es-ES', { month: 'long' });
  n_ships_str = `Total barcos en ${mes}: ${n_ships_in_current_month}`;

  // plotVariable(lengths);

  calendar.onDateClick(function(event, date){
    removeCalendarOutput();
    let date_str = getDateStr(date);
    let day_ships = getShipsOnDate(date_str, ships);
    if (day_ships.length > 0) {
      outputDayContents(day_ships);
    }
  });

  calendar.onMonthChange(function(event, date) {
    removeCalendarOutput();
    let month = date.getMonth() + 1;
    let mes = date.toLocaleString('es-ES', { month: 'long' });
    let n_ships = countShipsInMonth(month, dates);
    n_ships_str = `Total barcos en ${mes}: ${n_ships}`;
    console.log(n_ships_str);
  })

  resizeCalendar();
}

function addCalendarLegend(categories) {
  let div = document.getElementById("calendar-legend");
  let values = Object.keys(categories.values);
  let text = `<div id="legend-title">${categories.field}:</div>`;
  for (value of values) {
      let color = categories.values[value];
      text += `<div class="legend-field">
      <div class="legend-square" style="background-color:${color};"></div>
      <p>${value.replace(" (-)", "")}</p>
      </div>`
  }
  div.innerHTML = text;
}

function countShipsInMonth(month, dates) {
  let n_ships = 0;
  for (date of dates) {
    let date_month = parseInt(date.split("/")[1]);
    if (date_month === month) {
      n_ships++;
    }
  }
  return n_ships
}

function outputDayContents(day_ships) {
  /*
  Create new div which floats over the calendar to display results, then
  it is closed when touching screen or pressing "close" in div.
  */
  innerHTMLs = [];
  let n_ships = day_ships.length;
  for (ship of day_ships) {
    let buque = ship.BUQUE.capitalize();
    let anio = ship.FECCONSTRUCCION !== ""? `(${ship.FECCONSTRUCCION.split("/")[2]})`:"";
    let muelle = ship.MUELLE.replace(" (-)", "").capitalize();
    let consignatario = ship.CONSIG;
    let origen = ship.ORIGEN.capitalize();
    let destino = ship.DESTINO.capitalize();

    innerHTML =`<p><b>Buque: </b>${buque} ${anio}</p>
                <p><b>Muelle: </b>${muelle}</p>
                <p><b>Consignatario: </b>${consignatario}</p>
                <p><b>Duración escala: </b>${ship.F_ENTRADA}, ${ship.H_ENTRADA} - ${ship.F_SALIDA}, ${ship.H_SALIDA}</p>
                <p><b>Origen: </b>${origen}</p>
                <p><b>Destino: </b>${destino}</p>
                <br/>`;
    innerHTMLs.push(innerHTML)
  }

  output_div = document.createElement("div");
  output_div.classList.add("day-contents-container");

  let text_container = document.createElement("div");
  text_container.classList.add("output-text-container");
  text_container.innerHTML = innerHTMLs[0];
  output_div.appendChild(text_container);

  let nav_container = document.createElement("div");
  nav_container.classList.add("output-nav-container");

  let close_btn = document.createElement("button");
  close_btn.classList.add("close-btn");
  close_btn.innerHTML = "X";
  close_btn.addEventListener("click", removeCalendarOutput);

  // nav_container.appendChild(close_btn);
  // output_div.appendChild(close_btn);

  if (n_ships > 1) {

    let current_output = 0;
    // let nav_container = document.createElement("div");
    // nav_container.classList.add("output-nav-container");

    let counter = document.createElement("button");
    counter.classList.add("counter");
    counter.innerHTML = `${current_output + 1}/${n_ships}`;

    let left_arrow = document.createElement("button");
    left_arrow.innerHTML = "<";
    left_arrow.classList.add("arrow", "left-arrow");
    left_arrow.addEventListener("click", function() {
      current_output = goToPreviousOutput(current_output, n_ships);
      counter.innerHTML = `${current_output + 1}/${n_ships}`;
    });

    let right_arrow = document.createElement("button");
    right_arrow.innerHTML = ">";
    right_arrow.classList.add("arrow", "right-arrow");
    right_arrow.addEventListener("click", function() {
      current_output = goToNextOutput(current_output, n_ships);
      counter.innerHTML = `${current_output + 1}/${n_ships}`;
    });

    nav_container.appendChild(left_arrow);
    // nav_container.appendChild(counter);
    nav_container.appendChild(right_arrow);
    // nav_container.appendChild(counter);
    // output_div.appendChild(nav_container);
    output_div.appendChild(counter);

  }

  nav_container.appendChild(close_btn);
  output_div.appendChild(nav_container);
  document.body.appendChild(output_div);
  // close_btn.style.opacity = 1;
}

function removeCalendarOutput() {
  if (document.body.contains(output_div)) {
    document.body.removeChild(output_div);
  }
}

function goToPreviousOutput(index, n_ships) {
  if (index < 1) {
    index = 0;
  } else {
    index -= 1;
  }
  output_div.firstChild.innerHTML = innerHTMLs[index];
  return index
}

function goToNextOutput(index, n_ships) {
  if (index >= (n_ships - 1)) {
    index = n_ships - 1;
  } else {
    index += 1;
  }
  output_div.firstChild.innerHTML = innerHTMLs[index];
  return index
}

function getPropertyValuesAcrossShips(property, ships) {
  let number = parseFloat(ships[0][property]);
  if (!isNaN(number)) {
    return ships.map(ship => parseFloat(ship[property]));
  } else {
    return ships.map(ship => ship[property]);
  }
}

function getUniqueValues(array) {
  const unique = (value, index, self) => {
    return self.indexOf(value) === index
  };
  return array.filter(unique)
}

function plotVariable(data) {
  let trace = {
    x: data,
    type: 'histogram',
  };
  let plot_data = [trace];
  let layout = {
    bargap: 0.05,
    title: "$x=y$",
    xaxis: {"title": "value"},
    yaxis: {"title": "counts"}
  };
  let config = {responsive: true}
  Plotly.newPlot('histogram', plot_data, layout, config);
}



function getDateStr(date) {
    return jsCalendar.tools.dateToString(date, 'DD/MM/YYYY', 'en')
}


function selectDates(dates, calendar) {
  // Make changes on the date elements
  calendar.onDateRender(function(date, element, info) {

    const is_in_dates = function(date) {
      let date_str = getDateStr(date);
      return dates.indexOf(date_str) !== -1
    }

    if (is_in_dates(date)) {
      element.style.fontWeight = 'bold';
      element.style.color = (info.isCurrentMonth) ? '#289fde' : '#289fde';
    }
  });
  calendar.refresh();
}

function addCalendarMarks(date_strs, calendar, category=null) {
  let unique_strs = getUniqueValues(date_strs);

  if (category === null) {

    for (let i=0; i<unique_strs.length; i++) {
      let day_ships = getShipsOnDate(unique_strs[i], ships);
      let colors = day_ships.map(ship => "#606060");
      calendar.addEventMark(unique_strs[i], colors);
    }
  } else {

    for (let i=0; i<unique_strs.length; i++) {

      let day_ships = getShipsOnDate(unique_strs[i], ships);
      let ship_values = day_ships.map(ship => ship[category.field]);
      let colors = [];
      for (let j=0; j<ship_values.length; j++) {
        colors.push(category.values[ship_values[j]]);
      }
      calendar.addEventMark(unique_strs[i], colors);
    }
  }
}

function getShipsOnDate(date_str, ships) {
  return ships.filter(ship => ship["F_ENTRADA"] === date_str)
}
