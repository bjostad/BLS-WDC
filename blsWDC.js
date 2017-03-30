(function () {
    var myConnector = tableau.makeConnector();
    var selectedData = {
        "seriesid"  :["NoInputCollected"],
        "registrationkey":"NoInputCollected"
    };
    console.log(selectedData);

    myConnector.getSchema = function (schemaCallback) {
        console.log('getSchema');
        var cols = [
            {id: "seriesID", alias: "seriesID", dataType: tableau.dataTypeEnum.string},
            {id: "year", alias: "Year", dataType: tableau.dataTypeEnum.int},
            {id: "period", alias: "Period", dataType: tableau.dataTypeEnum.string}, 
            {id: "month", alias: "Month", dataType: tableau.dataTypeEnum.string},
            {id: "fullDate", alias: "Full Date", dataType: tableau.dataTypeEnum.string},  
            {id: "value", alias: "value", dataType: tableau.dataTypeEnum.int}, 
            {id: "footnotes", alias: "footnotes", dataType: tableau.dataTypeEnum.string}            
        ];

        var tableInfo = {
            id : "BLS",
            alias : "UnemploymentData",
            columns : cols
        };
        console.log('tableInfo');

        schemaCallback([tableInfo]);
        console.log('schemaCallback');
    };

    myConnector.getData = function(table, doneCallback) {
        console.log('getData');

        selectedData.registrationkey = tableau.password;
        console.log('Importing API Key');
        console.log(selectedData);

        selectedData.seriesid = tableau.connectionData.split(',');
        console.log('Importing and splitting seriesID');
        console.log(selectedData);

        $.ajax({
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(selectedData),
            type: 'POST',
            url: 'https://cors-anywhere.herokuapp.com/https://api.bls.gov/publicAPI/v1/timeseries/data/',
            success: function(resp){
                var resultSets = resp.Results,
                    tableData = [];
                console.log('resultSets::'+resultSets);
                console.log(resultSets);

                $.each(resultSets.series, function(index, obj) {
                    console.log('object::');
                    console.log(obj);
                    console.log("length: "+obj.data.length);


                    for (var i = 0, len = obj.data.length; i < len; i++) {

                        var calcDate = (obj.data[i].periodName + " 1, " + obj.data[i].year);

                        tableData.push({
                            "seriesID": obj.seriesID,
                            "year": obj.data[i].year,
                            "period": obj.data[i].period,
                            "month": obj.data[i].periodName,
                            "fullDate": calcDate,
                            "value": obj.data[i].value,
                            "footnotes": obj.data[i].footnotes[0].text
                        });
                    }

                })
                console.log(tableData);
                table.appendRows(tableData);
                doneCallback();
            }

        });
    };

    tableau.registerConnector(myConnector);
    $(document).ready(function () {
    $("#submitButton").click(function () {
        tableau.connectionName = "BLS Unemployment Data";
        //Collect the seriesIDs as well as the API key and pass them using tableau.password and tableau.connectionData
        tableau.password = document.getElementById('apiKeyInput').value;
        tableau.connectionData = document.getElementById('seriesIDInput').value;

        tableau.submit();
    });
});
})();
