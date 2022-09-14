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

    var data = {"OkPercent": 95.69166666666666, "KoPercent": 4.308333333333334};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.123625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1085, 500, 1500, "GET Seller Product Id"], "isController": false}, {"data": [0.295, 500, 1500, "GET Buyer Product Id"], "isController": false}, {"data": [0.142, 500, 1500, "GET Buyer Order Id"], "isController": false}, {"data": [0.1515, 500, 1500, "GET Seller Product"], "isController": false}, {"data": [0.114, 500, 1500, "POST Buyer Product"], "isController": false}, {"data": [0.005, 500, 1500, "POST Seller Product"], "isController": false}, {"data": [0.1425, 500, 1500, "DEL Seller Product Id"], "isController": false}, {"data": [0.2575, 500, 1500, "POST User Login"], "isController": false}, {"data": [0.0, 500, 1500, "GET Buyer Product"], "isController": false}, {"data": [0.1255, 500, 1500, "GET Buyer Order"], "isController": false}, {"data": [0.1145, 500, 1500, "PUT Buyer Order Id"], "isController": false}, {"data": [0.0275, 500, 1500, "POST User Register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12000, 517, 4.308333333333334, 2820.3548333333283, 291, 28478, 2520.0, 5010.499999999998, 6089.0, 8428.96, 55.040317032226106, 1785.0430518479786, 742.6958301154815], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Seller Product Id", 1000, 0, 0.0, 2988.476999999997, 307, 8316, 3081.5, 4824.9, 5204.95, 6097.080000000001, 4.886988393402566, 3.779780085522297, 1.9328420891875382], "isController": false}, {"data": ["GET Buyer Product Id", 1000, 0, 0.0, 1526.2610000000002, 294, 4868, 1444.5, 2443.2999999999997, 2755.6499999999996, 3825.96, 4.769649764617784, 5.3518824019002285, 1.099255219189255], "isController": false}, {"data": ["GET Buyer Order Id", 1000, 0, 0.0, 2375.487000000001, 291, 4766, 2494.0, 3727.8, 4056.7999999999997, 4312.99, 4.759683576235852, 5.303514609848737, 2.0963059500804384], "isController": false}, {"data": ["GET Seller Product", 1000, 0, 0.0, 2259.6909999999975, 317, 6244, 2293.0, 3582.0, 4052.4499999999994, 4845.88, 4.888947556259564, 12.981492583466556, 1.9097451391638922], "isController": false}, {"data": ["POST Buyer Product", 1000, 0, 0.0, 3493.3469999999993, 293, 7889, 3667.5, 5806.7, 6402.899999999997, 7310.99, 4.768580774989747, 1.6066019212611944, 2.3284085815379627], "isController": false}, {"data": ["POST Seller Product", 1000, 0, 0.0, 3943.1729999999943, 1266, 10806, 3945.0, 5469.9, 5829.75, 7128.380000000003, 4.867435396963693, 1.5876205298690174, 763.9056164728617], "isController": false}, {"data": ["DEL Seller Product Id", 1000, 0, 0.0, 2169.9610000000016, 324, 5234, 2227.5, 3426.3999999999987, 3726.0, 4337.87, 4.885245581295372, 1.6315956921904464, 2.342437090250027], "isController": false}, {"data": ["POST User Login", 1000, 0, 0.0, 1535.9240000000002, 365, 4384, 1557.0, 2297.8, 2456.0, 3021.080000000001, 4.914512062669858, 2.4668546877073307, 1.6845641933565625], "isController": false}, {"data": ["GET Buyer Product", 1000, 0, 0.0, 4270.363999999994, 1606, 28478, 3670.0, 6911.599999999999, 8698.599999999999, 13029.460000000003, 4.734288081429755, 1721.7875266303704, 1.2667919280388211], "isController": false}, {"data": ["GET Buyer Order", 1000, 0, 0.0, 2450.800999999998, 310, 6236, 2344.0, 4092.2999999999997, 4504.799999999999, 5099.63, 4.759547652591098, 81.96740513031641, 1.845254314529947], "isController": false}, {"data": ["PUT Buyer Order Id", 1000, 0, 0.0, 4754.267999999996, 298, 10610, 5181.0, 8027.299999999999, 8483.8, 9819.350000000002, 4.756355680277771, 3.0795545078360957, 2.238831482318248], "isController": false}, {"data": ["POST User Register", 1000, 517, 51.7, 2076.503999999997, 334, 5868, 1897.5, 3429.5, 3849.95, 5402.920000000001, 4.888589055426823, 2.2530666730218325, 5.320536954983428], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 517, 100.0, 4.308333333333334], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12000, 517, "400/Bad Request", 517, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST User Register", 1000, 517, "400/Bad Request", 517, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
