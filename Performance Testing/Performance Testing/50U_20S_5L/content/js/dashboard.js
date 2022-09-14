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

    var data = {"OkPercent": 96.63333333333334, "KoPercent": 3.3666666666666667};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5703333333333334, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.67, 500, 1500, "GET Seller Product Id"], "isController": false}, {"data": [0.786, 500, 1500, "GET Buyer Product Id"], "isController": false}, {"data": [0.716, 500, 1500, "GET Buyer Order Id"], "isController": false}, {"data": [0.734, 500, 1500, "GET Seller Product"], "isController": false}, {"data": [0.712, 500, 1500, "POST Buyer Product"], "isController": false}, {"data": [0.072, 500, 1500, "POST Seller Product"], "isController": false}, {"data": [0.738, 500, 1500, "DEL Seller Product Id"], "isController": false}, {"data": [0.736, 500, 1500, "POST User Login"], "isController": false}, {"data": [0.006, 500, 1500, "GET Buyer Product"], "isController": false}, {"data": [0.704, 500, 1500, "GET Buyer Order"], "isController": false}, {"data": [0.688, 500, 1500, "PUT Buyer Order Id"], "isController": false}, {"data": [0.282, 500, 1500, "POST User Register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3000, 101, 3.3666666666666667, 883.8573333333334, 283, 15997, 612.0, 1818.9, 2183.749999999999, 3137.7099999999937, 35.60408260147164, 1154.7824789898825, 405.89423733088057], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Seller Product Id", 250, 0, 0.0, 646.3119999999998, 290, 1645, 590.0, 1026.4, 1158.1499999999999, 1629.0, 3.335512534856106, 2.57981047617777, 1.3192212662272687], "isController": false}, {"data": ["GET Buyer Product Id", 250, 0, 0.0, 526.7799999999999, 291, 1330, 474.5, 731.9, 865.9999999999993, 1252.4000000000005, 3.2948060677148545, 3.697004074027703, 0.7593498359186579], "isController": false}, {"data": ["GET Buyer Order Id", 250, 0, 0.0, 578.5160000000004, 302, 1415, 565.0, 839.9, 916.8499999999999, 1242.7600000000011, 3.2724654754892333, 3.646370222200406, 1.441290946724262], "isController": false}, {"data": ["GET Seller Product", 250, 0, 0.0, 571.5599999999997, 286, 1366, 510.5, 835.5, 1006.25, 1161.9900000000005, 3.3296041766554794, 8.84100952766235, 1.3006266315060464], "isController": false}, {"data": ["POST Buyer Product", 250, 0, 0.0, 607.912, 283, 1262, 555.5, 917.9, 1062.5, 1203.98, 3.291422552827332, 1.1089265436771774, 1.6071399183727206], "isController": false}, {"data": ["POST Seller Product", 250, 0, 0.0, 1681.8480000000004, 1263, 2673, 1641.5, 1967.1000000000001, 2070.2499999999995, 2255.1900000000005, 3.2875703540055756, 1.0723129865604124, 433.37617962133766], "isController": false}, {"data": ["DEL Seller Product Id", 250, 0, 0.0, 559.252, 299, 1172, 516.0, 787.0, 960.1499999999999, 1166.49, 3.334444814938313, 1.1136524674891632, 1.5988402384128044], "isController": false}, {"data": ["POST User Login", 250, 0, 0.0, 533.3360000000002, 357, 1241, 511.0, 682.0, 757.05, 957.2500000000002, 3.3285402353943656, 1.6707711728444372, 1.1409351783431858], "isController": false}, {"data": ["GET Buyer Product", 250, 0, 0.0, 2777.3040000000005, 1137, 15997, 2279.5, 3559.6000000000013, 6586.749999999995, 11974.27000000001, 3.2596224053405654, 1185.4743738672812, 0.8722036514290185], "isController": false}, {"data": ["GET Buyer Order", 250, 0, 0.0, 629.1280000000004, 313, 1706, 545.0, 1031.8, 1204.9499999999998, 1540.840000000001, 3.2762394013655367, 56.42234554988402, 1.2701826585372247], "isController": false}, {"data": ["PUT Buyer Order Id", 250, 0, 0.0, 659.8319999999998, 285, 1360, 613.5, 1040.7, 1157.9499999999998, 1263.8000000000002, 3.269384178796082, 2.116798545450979, 1.5389093497848745], "isController": false}, {"data": ["POST User Register", 250, 101, 40.4, 834.508, 298, 2236, 668.0, 1613.8000000000002, 1814.6999999999998, 1957.96, 3.277656868657734, 1.6064231627094423, 3.5608669074651913], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 101, 100.0, 3.3666666666666667], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3000, 101, "400/Bad Request", 101, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST User Register", 250, 101, "400/Bad Request", 101, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
