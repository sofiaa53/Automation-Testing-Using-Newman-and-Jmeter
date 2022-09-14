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

    var data = {"OkPercent": 96.68333333333334, "KoPercent": 3.316666666666667};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.32316666666666666, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.312, 500, 1500, "GET Seller Product Id"], "isController": false}, {"data": [0.561, 500, 1500, "GET Buyer Product Id"], "isController": false}, {"data": [0.461, 500, 1500, "GET Buyer Order Id"], "isController": false}, {"data": [0.438, 500, 1500, "GET Seller Product"], "isController": false}, {"data": [0.353, 500, 1500, "POST Buyer Product"], "isController": false}, {"data": [0.008, 500, 1500, "POST Seller Product"], "isController": false}, {"data": [0.482, 500, 1500, "DEL Seller Product Id"], "isController": false}, {"data": [0.508, 500, 1500, "POST User Login"], "isController": false}, {"data": [0.0, 500, 1500, "GET Buyer Product"], "isController": false}, {"data": [0.311, 500, 1500, "GET Buyer Order"], "isController": false}, {"data": [0.278, 500, 1500, "PUT Buyer Order Id"], "isController": false}, {"data": [0.166, 500, 1500, "POST User Register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6000, 199, 3.316666666666667, 1531.9464999999973, 301, 16247, 1292.0, 2783.800000000001, 3216.749999999999, 4596.719999999972, 50.29759409841562, 1631.358265898755, 722.7412745462738], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Seller Product Id", 500, 0, 0.0, 1493.356, 308, 3530, 1424.5, 2445.0, 2835.8, 3367.9700000000003, 4.745003511302599, 3.6699636532731037, 1.8766859590601097], "isController": false}, {"data": ["GET Buyer Product Id", 500, 0, 0.0, 855.5020000000004, 330, 2693, 821.0, 1315.6000000000001, 1564.1, 1873.98, 4.514305835191723, 5.06536855921415, 1.0404064229543424], "isController": false}, {"data": ["GET Buyer Order Id", 500, 0, 0.0, 1101.8480000000025, 313, 2742, 1056.0, 1649.9, 1920.0499999999997, 2652.86, 4.503206282873406, 5.0177327819907775, 1.9833457359139708], "isController": false}, {"data": ["GET Seller Product", 500, 0, 0.0, 1133.8679999999997, 320, 3277, 1043.5, 1807.9, 2208.75, 2946.2800000000016, 4.744238122799859, 12.59724946864533, 1.8532180167186951], "isController": false}, {"data": ["POST Buyer Product", 500, 0, 0.0, 1401.6180000000002, 301, 3967, 1373.0, 2389.2000000000007, 2651.85, 3596.63, 4.511128955132311, 1.5198627827350073, 2.202699685123199], "isController": false}, {"data": ["POST Seller Product", 500, 0, 0.0, 2495.369999999998, 1387, 4024, 2467.0, 3300.7000000000003, 3576.2, 3959.3400000000006, 4.69034352075946, 1.5298581405602145, 785.3842813103881], "isController": false}, {"data": ["DEL Seller Product Id", 500, 0, 0.0, 1038.4719999999988, 329, 2856, 1002.0, 1533.2000000000003, 1786.6499999999999, 2466.1100000000015, 4.7497363896303755, 1.5863377395054574, 2.277461491512221], "isController": false}, {"data": ["POST User Login", 500, 0, 0.0, 932.9600000000004, 372, 2562, 865.5, 1430.9000000000003, 1606.3999999999999, 2141.6800000000003, 4.7664442326024785, 2.392531577693041, 1.633810474261201], "isController": false}, {"data": ["GET Buyer Product", 500, 0, 0.0, 3369.956000000001, 1667, 16247, 2832.5, 5279.400000000009, 7448.9, 13097.750000000007, 4.453033851963342, 1619.499703038305, 1.1915344486698787], "isController": false}, {"data": ["GET Buyer Order", 500, 0, 0.0, 1423.6779999999992, 345, 3143, 1414.0, 2293.7000000000003, 2606.6, 3047.4600000000014, 4.505032120879022, 77.5842201676773, 1.7465798359267302], "isController": false}, {"data": ["PUT Buyer Order Id", 500, 0, 0.0, 1830.5840000000014, 309, 4357, 1682.0, 3260.7000000000003, 3639.5499999999997, 4244.620000000001, 4.510721986161105, 2.9205162859617313, 2.123210934892239], "isController": false}, {"data": ["POST User Register", 500, 199, 39.8, 1306.1460000000018, 317, 2908, 1259.5, 2040.8000000000002, 2363.2, 2706.83, 4.723442444853809, 2.322429930683482, 5.153220354494355], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 199, 100.0, 3.316666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6000, 199, "400/Bad Request", 199, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST User Register", 500, 199, "400/Bad Request", 199, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
