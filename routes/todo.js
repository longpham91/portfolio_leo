var tedious = require('tedious'),
    TYPES = tedious.TYPES;

exports.post = function (req, res) {
    var request = new tedious.Request("INSERT INTO dbo.items(text, complete) VALUES (@text, @complete);select @@identity;", function (err) {
        if (err) {
            return res.status(500).json({success: false, data: err});
        }
    });
    request.addParameter('text', TYPES.NVarChar, req.body.text);
    request.addParameter('complete', TYPES.Bit, false);

    request.on('row', function (row) {
        res.json({text: req.body.text, complete: false, id: row[''].value});
    });

    req.app.get('db').execSql(request);
};

// MSSQL
exports.get = function (req, res) {
    
    // simple SQL script
    // var query = new tedious.Request("SELECT * FROM items ORDER BY id ASC", function (error) {
    //     if (error) {
    //         return res.status(500).json({success: false, data: error});
    //     }
    // });
    //stored procedure
    var query = new tedious.Request("usp_Items", function (error) {
        if (error) {
            return res.status(500).json({success: false, data: error});
        }
    });
    query.addParameter('TestParam', TYPES.Int, 0);
    
    var listTodo = [];
    query.on('row', function(columns) {
        listTodo.push({
            id: columns.id.value,
            text: columns.text.value,
            complete: columns.complete.value
        });
    });

    query.on('doneInProc', function () {
       res.json(listTodo);
    });
    req.app.get('db').callProcedure(query);
    //req.app.get('db').execSql(query);
};

// todo migrates to mssql
exports.put = function (req, res) {

    var request = new tedious.Request("UPDATE items SET text=@text, complete=@complete WHERE id=@id", function (err) {
        if (err) {
            return res.status(500).json({success: false, data: err});
        }
    });
    request.addParameter('id', TYPES.Int, req.params.todo_id);
    request.addParameter('text', TYPES.NVarChar, req.body.text);
    request.addParameter('complete', TYPES.Bit, req.body.complete);
    request.on('doneInProc', function () {
        res.json(req.body);
    });

    req.app.get('db').execSql(request);

};

// todo migrates to mssql
exports.delete = function (req, res) {

    var deleteQuery = new tedious.Request('DELETE FROM items where id=(@itemId)', function (error) {
        if (error) {
            return res.status(500).json({success: false, data: error});
        }
    });
    deleteQuery.addParameter('itemId', TYPES.Int, req.params.todo_id);

    req.app.get('db').execSql(deleteQuery);
    deleteQuery.on('doneInProc', function () {
        res.json({status: 'ok'});
    });
};

// test with Output Param
exports.test1 = function (req, res) {
    var query = new tedious.Request('usp_Items_Output', function(error) {
        if (error) {
            return res.status(500).json({success: false, data: error});
        }
    });
    
    query.addParameter('TestParam', TYPES.Int, 0);
    query.addOutputParameter('Return', TYPES.VarChar);
    
    query.on('returnValue', function(parameterName, value, metadata) {
        res.json({result: value});
    });
    req.app.get('db').callProcedure(query);   
}

// test with retrieving Item by ID
var childrenList = [];
var cnt = 0;
var repeatingRequest = function(req, res) {
    var query2 = new tedious.Request('usp_Items_ByItemID', function(error) {
        if (error) {
            return res.status(500).json({success: false, data: error});
        } else {
            if (cnt < 20) {
                repeatingRequest(req, res);
                cnt+=1;
            }
        }
    });
    query2.addParameter('ItemsID', TYPES.Int, req.params.todo_id);
    
    var item = [];
    query2.on('row', function(columns) {
        item.push({
            id: columns.id.value,
            text: columns.text.value,
            complete: columns.complete.value,
            children: childrenList
        });
    });
    query2.on('doneInProc', function (result) {
        if (cnt === 20) {
            res.json(item);
        }
    });
    req.app.get('db').callProcedure(query2);
}

exports.test2 = function (req, res) {
    var query = new tedious.Request('usp_ItemsOrders_ByItemID', function(error) {
        if (error) {
            return res.status(500).json({success: false, data: error});
        } else {
            repeatingRequest(req, res);
        }
    });
    query.on('row', function(columns) {
        childrenList.push({
            text: columns.OrdText.value,
        });
    });
    query.addParameter('ItemsID', TYPES.Int, req.params.todo_id);
    req.app.get('db').callProcedure(query);
}