/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.33333333333333, "KoPercent": 1.6666666666666667};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8658333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.99, 500, 1500, "GET Seller Product Id"], "isController": false}, {"data": [1.0, 500, 1500, "GET Buyer Product Id"], "isController": false}, {"data": [1.0, 500, 1500, "GET Buyer Order Id"], "isController": false}, {"data": [0.99, 500, 1500, "GET Seller Product"], "isController": false}, {"data": [0.99, 500, 1500, "POST Buyer Product"], "isController": false}, {"data": [0.47, 500, 1500, "POST Seller Product"], "isController": false}, {"data": [1.0, 500, 1500, "DEL Seller Product Id"], "isController": false}, {"data": [1.0, 500, 1500, "POST User Login"], "isController": false}, {"data": [0.32, 500, 1500, "GET Buyer Product"], "isController": false}, {"data": [0.95, 500, 1500, "GET Buyer Order"], "isController": false}, {"data": [0.98, 500, 1500, "PUT Buyer Order Id"], "isController": false}, {"data": [0.7, 500, 1500, "POST User Register"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 600, 10, 1.6666666666666667, 553.0816666666674, 278, 9018, 363.0, 1230.2999999999997, 1367.0, 3081.490000000006, 9.858368111465282, 319.78959251565016, 112.47088700667082], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Seller Product Id", 50, 0, 0.0, 348.8, 284, 573, 339.0, 420.2, 461.15, 573.0, 1.0869092648145733, 0.8406563845050214, 0.4298811057127951], "isController": false}, {"data": ["GET Buyer Product Id", 50, 0, 0.0, 332.0, 282, 474, 314.5, 407.7, 419.4, 474.0, 0.9423294383716547, 1.0573598873916321, 0.2171774877497173], "isController": false}, {"data": ["GET Buyer Order Id", 50, 0, 0.0, 335.36000000000007, 282, 444, 318.5, 405.09999999999997, 422.6999999999999, 444.0, 0.9350688210652304, 1.0419077390970974, 0.41183206865275285], "isController": false}, {"data": ["GET Seller Product", 50, 0, 0.0, 349.59999999999997, 285, 567, 337.5, 433.79999999999995, 455.34999999999997, 567.0, 1.0862480990658268, 2.884285723984358, 0.4243156636975885], "isController": false}, {"data": ["POST Buyer Product", 50, 0, 0.0, 348.32, 283, 555, 319.5, 427.7, 438.79999999999995, 555.0, 0.9403445422402769, 0.31681529987587453, 0.4591526085157602], "isController": false}, {"data": ["POST Seller Product", 50, 0, 0.0, 1192.6000000000004, 656, 1771, 1243.5, 1441.3999999999999, 1616.0999999999997, 1771.0, 1.0674864962958217, 0.34818407203398877, 140.82096299958368], "isController": false}, {"data": ["DEL Seller Product Id", 50, 0, 0.0, 338.90000000000003, 278, 485, 323.5, 420.79999999999995, 445.3499999999999, 485.0, 1.088399834563225, 0.36350853849670217, 0.521879217549359], "isController": false}, {"data": ["POST User Login", 50, 0, 0.0, 374.97999999999996, 346, 454, 366.0, 430.09999999999997, 433.45, 454.0, 1.0878315166547006, 0.5460404292583164, 0.37287974838457016], "isController": false}, {"data": ["GET Buyer Product", 50, 0, 0.0, 1697.14, 663, 9018, 1082.5, 3612.699999999999, 5251.15, 9018.0, 0.9153485647334505, 332.8981494512485, 0.24492725267281779], "isController": false}, {"data": ["GET Buyer Order", 50, 0, 0.0, 378.9400000000001, 292, 756, 339.5, 538.0999999999999, 637.0499999999998, 756.0, 0.936855911560802, 16.13423242224096, 0.3632146454000375], "isController": false}, {"data": ["PUT Buyer Order Id", 50, 0, 0.0, 357.3399999999999, 291, 556, 324.5, 450.7, 499.9499999999996, 556.0, 0.9355587156649952, 0.6057377231307537, 0.44037041108449965], "isController": false}, {"data": ["POST User Register", 50, 10, 20.0, 583.0, 287, 1505, 403.5, 1348.7, 1413.4999999999998, 1505.0, 1.0637845198076676, 0.5775394198651121, 1.1619144863516446], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 10, 100.0, 1.6666666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 600, 10, "400/Bad Request", 10, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST User Register", 50, 10, "400/Bad Request", 10, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
