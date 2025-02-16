function displayStationInfo(callback) {
  // Show the loading indicator
  document.getElementById("loader").style.display = "block";

  // Loading from database
  var addStationInfo = $.getJSON("/station-info/" + station_id, function (data) {
    console.log("success", data);
    var stationInfo = data;

    // Display header = name of the station
    const stationHeader = document.createTextNode(stationInfo[0]["address"]);
    document.getElementById("station_title").appendChild(stationHeader);

    // extracts container for real time station information
    const stationInfoList = document.getElementById("station_info");

    // Display real time availability information
    var addBikeInfo = $.getJSON("/bike-info/" + station_id, function (data) {
      console.log("success", data);
      var availability = [];
      availability = data;

      // Display currently available bikes
      populateCurrentAvailability("Currently Available Bikes", "available_bikes", availability, stationInfoList);

      // Display currently available stations
      populateCurrentAvailability("Currently Available Parking Spaces", "available_bike_stands", availability, stationInfoList);

      // Hide the loading indicator and show the information containers
      document.getElementById("loader").style.display = "none";
      document.getElementById("station_title_row").style.display = "block";
      document.getElementById("station_info").style.display = "block";
      document.getElementById("bike_chart_div").style.display = "block";
      document.getElementById("stand_chart_div").style.display = "block";
      document.getElementById("bike_hour_chart_div_mon").style.display = "block";
      document.getElementById("bike_hour_chart_div_tues").style.display = "block";
      document.getElementById("bike_hour_chart_div_wed").style.display = "block";
      document.getElementById("bike_hour_chart_div_thur").style.display = "block";
      document.getElementById("bike_hour_chart_div_fri").style.display = "block";
      document.getElementById("bike_hour_chart_div_sat").style.display = "block";
      document.getElementById("bike_hour_chart_div_sun").style.display = "block";
    })
      .fail(function () {
        console.error("inner error");
      });
  })
    .fail(function () {
      console.error("outer error");
    });

    if (callback) {
      callback();
    }
}

// inserts availability data onto the page 
function populateCurrentAvailability(header, key, availability, stationInfoList) {
  // creates container for availability data
  var availabilityContainer = document.createElement("div");
  availabilityContainer.className = "col-sm-6 availability_data";

  //creates header for availability data 
  var availabilityHeader = document.createElement("p");
  availabilityHeader.innerHTML = header;

  //inserts quantity into availability data
  var availabilityCount = document.createElement("p");
  availabilityCount.innerHTML = availability[availability.length - 1][key];

  // displays elements on the page
  availabilityContainer.appendChild(availabilityHeader);
  availabilityContainer.appendChild(availabilityCount);
  stationInfoList.appendChild(availabilityContainer);

}

// Load the Visualization API and the corechart package.
google.charts.load('current', { 'packages': ['corechart'] });

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(function () {
  displayStationInfo(function() {
    drawBikeChart();
    drawStandChart();
    drawBikeHourMonChart();
    drawBikeHourTuesChart();
    drawBikeHourWedChart();
    drawBikeHourThurChart();
    drawBikeHourFriChart();
    drawBikeHourSatChart();
    drawBikeHourSunChart();
  });
});

function drawBikeChart() {
  // Fetch bike availability data from server
  $.getJSON('/bike-info/' + station_id, function (response) {
    var bikeData = response;

    // Create a DataTable object
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Day of Week');
    data.addColumn('number', 'Average Bikes');

    // Calculate average number of bikes available for each day of the week
    var dayOfWeekData = Array(7).fill(0);
    var dayOfWeekCount = Array(7).fill(0); // New array to keep track of count for each day
    for (var i = 0; i < bikeData.length; i++) {
      var timestamp = new Date(bikeData[i].last_update * 1000); // Convert seconds to milliseconds
      var dayOfWeek = timestamp.getDay();
      dayOfWeekData[dayOfWeek] += bikeData[i].available_bikes;
      dayOfWeekCount[dayOfWeek]++; // Increment count for each day
    }
    dayOfWeekData.push(dayOfWeekData.shift());
    dayOfWeekCount.push(dayOfWeekCount.shift());
    var weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (var j = 0; j < dayOfWeekData.length; j++) {
      data.addRow([weekdays[j], dayOfWeekData[j] / dayOfWeekCount[j]]); // Divide by count for each day
    }
    // Create and draw the chart
    var options = {
      title: 'Average Bikes Availability by Day',
      vAxis: { title: 'Average Bikes' },
      legend: { position: 'none' },
      bar: { groupWidth: '80%' },
      colors: ['#44a0ff'],
      width: 1000,
      height: 400,
    };

    var chartDiv = document.getElementById('bike_chart_div');
    //chartDiv.style.width = '60%';
    var chart = new google.visualization.ColumnChart(document.getElementById('bike_chart_div'));
    chart.draw(data, options);
  });
}

function drawStandChart() {
  // Fetch bike availability data from server
  $.getJSON('/bike-info/' + station_id, function (response) {
    var standData = response;

    // Create a DataTable object
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Day of Week');
    data.addColumn('number', 'Average Stands');

    // Calculate average number of bikes available for each day of the week
    var dayOfWeekData = Array(7).fill(0);
    var dayOfWeekCount = Array(7).fill(0); // New array to keep track of count for each day
    for (var i = 0; i < standData.length; i++) {
      var timestamp = new Date(standData[i].last_update * 1000); // Convert seconds to milliseconds
      var dayOfWeek = timestamp.getDay();
      dayOfWeekData[dayOfWeek] += standData[i].available_bike_stands;
      dayOfWeekCount[dayOfWeek]++; // Increment count for each day
    }
    dayOfWeekData.push(dayOfWeekData.shift());
    dayOfWeekCount.push(dayOfWeekCount.shift());
    var weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (var j = 0; j < dayOfWeekData.length; j++) {
      data.addRow([weekdays[j], dayOfWeekData[j] / dayOfWeekCount[j]]); // Divide by count for each day
    }
    // Create and draw the chart
    var options = {
      title: 'Average Stand Availability by Day',
      vAxis: { title: 'Average Stands' },
      legend: { position: 'none' },
      bar: { groupWidth: '80%' },
      colors: ['#44a0ff'],
      width: 1000,
      height: 400,
    };

    var chartDiv = document.getElementById('stand_chart_div');
    //chartDiv.style.width = '60%';
    var chart = new google.visualization.ColumnChart(document.getElementById('stand_chart_div'));
    chart.draw(data, options);
  });
}

function drawBikeHourMonChart() {
  $.getJSON('/bike-info/' + station_id, function (response) {
    var bikeData = response;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Hour');
    data.addColumn('number', 'Average Bikes');
    var hourOfDayData = Array(24).fill(0);
    var hourOfDayCount = Array(24).fill(0);
    for (var i = 0; i < bikeData.length; i++) {
      var timestamp = new Date(bikeData[i].last_update * 1000); // Convert seconds to milliseconds for Date()
      var dayOfWeek = timestamp.getDay();
      var hourOfDay = timestamp.getHours();

      if (dayOfWeek == 1) { // Only consider Monday
        hourOfDayData[hourOfDay] += bikeData[i].available_bikes;
        hourOfDayCount[hourOfDay]++;
      }
    }
    var hours = [];
    for (var i = 0; i < 24; i++) {
      i = i.toString()
      hours.push(i);
    }
    for (var j = 0; j < hourOfDayData.length; j++) {
      data.addRow([hours[j].toString(), hourOfDayData[j] / hourOfDayCount[j]]); // Divide by count for each hour
    }
    var options = {
      title: 'Hourly Distribution of Bike Availability for Monday',
      hAxis: { title: 'Hour' },
      vAxis: { title: 'Average Bikes' },
      legend: { position: 'none' },
      bar: { groupWidth: '80%' },
      colors: ['#44a0ff'],
      width: 1000,
      height: 400,
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('bike_hour_chart_div_mon'));
    chart.draw(data, options);
  });
}

function drawBikeHourTuesChart() {
  $.getJSON('/bike-info/' + station_id, function (response) {
    var bikeData = response;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Hour');
    data.addColumn('number', 'Average Bikes');
    var hourOfDayData = Array(24).fill(0);
    var hourOfDayCount = Array(24).fill(0);
    for (var i = 0; i < bikeData.length; i++) {
      var timestamp = new Date(bikeData[i].last_update * 1000); // Convert seconds to milliseconds for Date()
      var dayOfWeek = timestamp.getDay();
      var hourOfDay = timestamp.getHours();

      if (dayOfWeek == 2) { // Only consider Tuesday
        hourOfDayData[hourOfDay] += bikeData[i].available_bikes;
        hourOfDayCount[hourOfDay]++;
      }
    }
    var hours = [];
    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }
    for (var j = 0; j < hourOfDayData.length; j++) {
      data.addRow([hours[j].toString(), hourOfDayData[j] / hourOfDayCount[j]]); // Divide by count for each hour
    }
    var options = {
      title: 'Hourly Distribution of Bike Availability for Tuesday',
      hAxis: { title: 'Hour' },
      vAxis: { title: 'Average Bikes' },
      legend: { position: 'none' },
      bar: { groupWidth: '80%' },
      colors: ['#44a0ff'],
      width: 1000,
      height: 400,
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('bike_hour_chart_div_tues'));
    chart.draw(data, options);
  });
}

function drawBikeHourWedChart() {
  $.getJSON('/bike-info/' + station_id, function (response) {
    var bikeData = response;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Hour');
    data.addColumn('number', 'Average Bikes');
    var hourOfDayData = Array(24).fill(0);
    var hourOfDayCount = Array(24).fill(0);
    for (var i = 0; i < bikeData.length; i++) {
      var timestamp = new Date(bikeData[i].last_update * 1000); // Convert seconds to milliseconds for Date()
      var dayOfWeek = timestamp.getDay();
      var hourOfDay = timestamp.getHours();

      if (dayOfWeek == 3) { // Only consider Wednesday
        hourOfDayData[hourOfDay] += bikeData[i].available_bikes;
        hourOfDayCount[hourOfDay]++;
      }
    }
    var hours = [];
    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }
    for (var j = 0; j < hourOfDayData.length; j++) {
      data.addRow([hours[j].toString(), hourOfDayData[j] / hourOfDayCount[j]]); // Divide by count for each hour
    }
    var options = {
      title: 'Hourly Distribution of Bike Availability for Wednesday',
      hAxis: { title: 'Hour' },
      vAxis: { title: 'Average Bikes' },
      legend: { position: 'none' },
      bar: { groupWidth: '80%' },
      colors: ['#44a0ff'],
      width: 1000,
      height: 400,
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('bike_hour_chart_div_wed'));
    chart.draw(data, options);
  });
}

function drawBikeHourThurChart() {
  $.getJSON('/bike-info/' + station_id, function (response) {
    var bikeData = response;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Hour');
    data.addColumn('number', 'Average Bikes');
    var hourOfDayData = Array(24).fill(0);
    var hourOfDayCount = Array(24).fill(0);
    for (var i = 0; i < bikeData.length; i++) {
      var timestamp = new Date(bikeData[i].last_update * 1000); // Convert seconds to milliseconds for Date()
      var dayOfWeek = timestamp.getDay();
      var hourOfDay = timestamp.getHours();

      if (dayOfWeek == 4) { // Only consider Thursday
        hourOfDayData[hourOfDay] += bikeData[i].available_bikes;
        hourOfDayCount[hourOfDay]++;
      }
    }
    var hours = [];
    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }
    for (var j = 0; j < hourOfDayData.length; j++) {
      data.addRow([hours[j].toString(), hourOfDayData[j] / hourOfDayCount[j]]); // Divide by count for each hour
    }
    var options = {
      title: 'Hourly Distribution of Bike Availability for Thursday',
      hAxis: { title: 'Hour' },
      vAxis: { title: 'Average Bikes' },
      legend: { position: 'none' },
      bar: { groupWidth: '80%' },
      colors: ['#44a0ff'],
      width: 1000,
      height: 400,
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('bike_hour_chart_div_thur'));
    chart.draw(data, options);
  });
}

function drawBikeHourFriChart() {
  $.getJSON('/bike-info/' + station_id, function (response) {
    var bikeData = response;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Hour');
    data.addColumn('number', 'Average Bikes');
    var hourOfDayData = Array(24).fill(0);
    var hourOfDayCount = Array(24).fill(0);
    for (var i = 0; i < bikeData.length; i++) {
      var timestamp = new Date(bikeData[i].last_update * 1000); // Convert seconds to milliseconds for Date()
      var dayOfWeek = timestamp.getDay();
      var hourOfDay = timestamp.getHours();

      if (dayOfWeek == 5) { // Only consider Friday
        hourOfDayData[hourOfDay] += bikeData[i].available_bikes;
        hourOfDayCount[hourOfDay]++;
      }
    }
    var hours = [];
    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }
    for (var j = 0; j < hourOfDayData.length; j++) {
      data.addRow([hours[j].toString(), hourOfDayData[j] / hourOfDayCount[j]]); // Divide by count for each hour
    }
    var options = {
      title: 'Hourly Distribution of Bike Availability for Friday',
      hAxis: { title: 'Hour' },
      vAxis: { title: 'Average Bikes' },
      legend: { position: 'none' },
      bar: { groupWidth: '80%' },
      colors: ['#44a0ff'],
      width: 1000,
      height: 400,
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('bike_hour_chart_div_fri'));
    chart.draw(data, options);
  });
}

function drawBikeHourSatChart() {
  $.getJSON('/bike-info/' + station_id, function (response) {
    var bikeData = response;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Hour');
    data.addColumn('number', 'Average Bikes');
    var hourOfDayData = Array(24).fill(0);
    var hourOfDayCount = Array(24).fill(0);
    for (var i = 0; i < bikeData.length; i++) {
      var timestamp = new Date(bikeData[i].last_update * 1000); // Convert seconds to milliseconds for Date()
      var dayOfWeek = timestamp.getDay();
      var hourOfDay = timestamp.getHours();

      if (dayOfWeek == 6) { // Only consider Saturday
        hourOfDayData[hourOfDay] += bikeData[i].available_bikes;
        hourOfDayCount[hourOfDay]++;
      }
    }
    var hours = [];
    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }
    for (var j = 0; j < hourOfDayData.length; j++) {
      data.addRow([hours[j].toString(), hourOfDayData[j] / hourOfDayCount[j]]); // Divide by count for each hour
    }
    var options = {
      title: 'Hourly Distribution of Bike Availability for Saturday',
      hAxis: { title: 'Hour' },
      vAxis: { title: 'Average Bikes' },
      legend: { position: 'none' },
      bar: { groupWidth: '80%' },
      colors: ['#44a0ff'],
      width: 1000,
      height: 400,
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('bike_hour_chart_div_sat'));
    chart.draw(data, options);
  });
}

function drawBikeHourSunChart() {
  $.getJSON('/bike-info/' + station_id, function (response) {
    var bikeData = response;
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Hour');
    data.addColumn('number', 'Average Bikes');
    var hourOfDayData = Array(24).fill(0);
    var hourOfDayCount = Array(24).fill(0);
    for (var i = 0; i < bikeData.length; i++) {
      var timestamp = new Date(bikeData[i].last_update * 1000); // Convert seconds to milliseconds for Date()
      var dayOfWeek = timestamp.getDay();
      var hourOfDay = timestamp.getHours();

      if (dayOfWeek == 0) { // Only consider Sunday
        hourOfDayData[hourOfDay] += bikeData[i].available_bikes;
        hourOfDayCount[hourOfDay]++;
      }
    }
    var hours = [];
    for (var i = 0; i < 24; i++) {
      hours.push(i);
    }
    for (var j = 0; j < hourOfDayData.length; j++) {
      data.addRow([hours[j].toString(), hourOfDayData[j] / hourOfDayCount[j]]); // Divide by count for each hour
    }
    var options = {
      title: 'Hourly Distribution of Bike Availability for Sunday',
      hAxis: { title: 'Hour' },
      vAxis: { title: 'Average Bikes' },
      legend: { position: 'none' },
      bar: { groupWidth: '80%' },
      colors: ['#44a0ff'],
      width: 1000,
      height: 400,
    };
    var chart = new google.visualization.ColumnChart(document.getElementById('bike_hour_chart_div_sun'));
    chart.draw(data, options);
  });
}

