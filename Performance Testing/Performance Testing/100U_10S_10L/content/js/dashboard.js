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

    var data = {"OkPercent": 96.55, "KoPercent": 3.45};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.31575, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3295, 500, 1500, "GET Seller Product Id"], "isController": false}, {"data": [0.5065, 500, 1500, "GET Buyer Product Id"], "isController": false}, {"data": [0.4165, 500, 1500, "GET Buyer Order Id"], "isController": false}, {"data": [0.4385, 500, 1500, "GET Seller Product"], "isController": false}, {"data": [0.3955, 500, 1500, "POST Buyer Product"], "isController": false}, {"data": [0.002, 500, 1500, "POST Seller Product"], "isController": false}, {"data": [0.4455, 500, 1500, "DEL Seller Product Id"], "isController": false}, {"data": [0.482, 500, 1500, "POST User Login"], "isController": false}, {"data": [0.001, 500, 1500, "GET Buyer Product"], "isController": false}, {"data": [0.3005, 500, 1500, "GET Buyer Order"], "isController": false}, {"data": [0.2875, 500, 1500, "PUT Buyer Order Id"], "isController": false}, {"data": [0.184, 500, 1500, "POST User Register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12000, 414, 3.45, 1716.100999999993, 296, 17346, 1294.0, 3178.8999999999996, 4157.899999999998, 8146.689999999993, 49.288398743145834, 1598.6088060655536, 665.0730365183393], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Seller Product Id", 1000, 0, 0.0, 1475.8699999999997, 330, 7655, 1350.5, 2618.0, 2834.499999999999, 4092.8900000000012, 4.448438153364354, 3.4405888842427426, 1.7593920430786751], "isController": false}, {"data": ["GET Buyer Product Id", 1000, 0, 0.0, 1001.1190000000008, 305, 5829, 901.5, 1569.1999999999998, 1942.85, 2984.9700000000003, 4.269617826508349, 4.790811408845794, 0.9840134834530961], "isController": false}, {"data": ["GET Buyer Order Id", 1000, 0, 0.0, 1244.4190000000003, 312, 5598, 1157.0, 1918.9, 2365.749999999997, 3670.95, 4.368242874303811, 4.867348749590477, 1.9239038440537293], "isController": false}, {"data": ["GET Seller Product", 1000, 0, 0.0, 1209.5389999999998, 307, 9237, 1061.0, 2028.8, 2517.1499999999987, 4342.0, 4.442213466125901, 11.795291420308912, 1.7352396352054302], "isController": false}, {"data": ["POST Buyer Product", 1000, 0, 0.0, 1301.207999999997, 316, 6502, 1215.0, 2232.2999999999997, 2741.7999999999997, 3710.95, 4.289084280506112, 1.4450528093502037, 2.094279433840875], "isController": false}, {"data": ["POST Seller Product", 1000, 0, 0.0, 4349.748999999995, 1443, 14744, 3671.5, 7499.499999999999, 9343.599999999995, 13041.380000000001, 4.426874670751197, 1.4439220117489253, 694.7569618137791], "isController": false}, {"data": ["DEL Seller Product Id", 1000, 0, 0.0, 1123.3490000000002, 314, 5908, 1045.0, 1771.0, 2008.9499999999998, 3228.6000000000004, 4.454481876940483, 1.4877273456187943, 2.1358892593532985], "isController": false}, {"data": ["POST User Login", 1000, 0, 0.0, 1041.6880000000012, 348, 5128, 957.0, 1482.6999999999998, 1815.9499999999998, 3093.210000000002, 4.453470143936155, 2.2354332558429526, 1.5265312700406155], "isController": false}, {"data": ["GET Buyer Product", 1000, 0, 0.0, 3359.4790000000044, 1146, 17346, 2833.0, 5055.099999999999, 7509.899999999996, 12272.040000000008, 4.234596654668643, 1540.0574647999154, 1.133085432987508], "isController": false}, {"data": ["GET Buyer Order", 1000, 0, 0.0, 1470.6710000000003, 312, 6276, 1401.0, 2327.0, 2690.0999999999985, 3915.84, 4.319262615486284, 74.38495725009827, 1.6745578694805223], "isController": false}, {"data": ["PUT Buyer Order Id", 1000, 0, 0.0, 1597.0209999999997, 296, 7362, 1541.5, 2857.8, 3237.6499999999983, 3991.5400000000004, 4.39126138983423, 2.8431702162696237, 2.0669804588868153], "isController": false}, {"data": ["POST User Register", 1000, 414, 41.4, 1419.0999999999979, 316, 11826, 1170.0, 2549.0, 3258.9999999999986, 5164.410000000001, 4.437147801393264, 2.1631962162222123, 4.82636452694458], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 414, 100.0, 3.45], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12000, 414, "400/Bad Request", 414, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST User Register", 1000, 414, "400/Bad Request", 414, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
