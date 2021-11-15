// Create or Open Database.
var db = window.openDatabase('DAF', '1.0', 'DAF', 20000);
//fix-font-end
jQuery.event.special.touchstart = {
    setup: function (_, ns, handle) {
        this.addEventListener("touchstart", handle, { passive: !ns.includes("noPreventDefault") });
    }
};
jQuery.event.special.touchmove = {
    setup: function (_, ns, handle) {
        this.addEventListener("touchmove", handle, { passive: !ns.includes("noPreventDefault") });
    }
};
jQuery.event.special.wheel = {
    setup: function (_, ns, handle) {
        this.addEventListener("wheel", handle, { passive: true });
    }
};
jQuery.event.special.mousewheel = {
    setup: function (_, ns, handle) {
        this.addEventListener("mousewheel", handle, { passive: true });
    }
};

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        console.log('Portrait.');
    }
    else {
        console.log('Landscape.');
    }
}
// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    onDeviceReady();
}
// Display errors when executing SQL queries.
function transactionError(tx, error) {
    console.log(`[${new Date().toUTCString()}] Errors when executing SQL query. [Code: ${error.code}] [Message: ${error.message}]`);
}
function onDeviceReady() {
    // Logging.
    console.log(`[${new Date().toUTCString()}] Device is ready.`);

    db.transaction(function (tx) {
        // Create a query Feedback.
        var query = `CREATE TABLE IF NOT EXISTS Feedback (Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Name TEXT NOT NULL UNIQUE,
        Message TEXT NOT NULL)`;

        // Execute a query.
        tx.executeSql(query, [], transactionSuccess_Feedback, transactionError);

        function transactionSuccess_Feedback(tx, result) {
            // Logging.
            console.log(`[${new Date().toUTCString()}] Create table 'Feedback' successfully.`);
        }
        // Create a query Apartment.
      var query = `CREATE TABLE IF NOT EXISTS Apartment (Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Propertytypename TEXT NOT NULL UNIQUE,
            Propertytypeaddress TEXT NOT NULL,
            City INTEGER NOT NULL,
            District INTEGER NOT NULL,
            Ward INTEGER NOT NULL,
            Propertytype TEXT NOT NULL,
            Bedroom TEXT NOT NULL,
            Createdate DATE NOT NULL ,
            Monthlyrentprice INTEGER NOT NULL, 
            Furnituretype TEXT NOT NULL, 
            Description TEXT NOT NULL,
            Namereporter TEXT NOT NULL)`;

        tx.executeSql(query, [], transactionSuccess_Apartment, transactionError);

        function transactionSuccess_Apartment(tx, result) {
            // Logging.
            console.log(`[${new Date().toUTCString()}] Create table 'Apartment' successfully.`);
        }
        // Create a query Image.

        db.transaction(function (tx) {
            // Create table Image.
            var query = `CREATE TABLE IF NOT EXISTS Image (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                             Image BLOB,
                                                             ApartmentId INTEGER NOT NULL,
                                                             FOREIGN KEY (ApartmentId) REFERENCES Apartment(Id))`;
            tx.executeSql(query, [], function (tx, result) {
                console.log(`[${new Date().toUTCString()}] Create table 'Image' successfully.`);

            }, transactionError);

            prepareDatabase(db);
        });
        // Create a query Comment.
        var query = `CREATE TABLE IF NOT EXISTS Comment (Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Comment TEXT NOT NULL ,
            Datetime DATE NOT NULL,
            ApartmentId INTEGER NOT NULL,
            FOREIGN KEY (ApartmentId) REFERENCES Apartment(Id))`;
        // Execute a query.
        tx.executeSql(query, [], transactionSuccess_Comment, transactionError);

        function transactionSuccess_Comment(tx, result) {
            // Logging.
            console.log(`[${new Date().toUTCString()}] Create table 'Comment' successfully.`);
        }
           // Create a query CommentAccount.
           var query = `CREATE TABLE IF NOT EXISTS CommentAccount (Id INTEGER PRIMARY KEY AUTOINCREMENT,
            CommentAccount TEXT NOT NULL ,
            Datetime DATE NOT NULL,
            UserId INTEGER NOT NULL,
            FOREIGN KEY (UserId) REFERENCES User(Id))`;
        // Execute a query.
        tx.executeSql(query, [], transactionSuccess_Comment_Account, transactionError);

        function transactionSuccess_Comment_Account(tx, result) {
            // Logging.
            console.log(`[${new Date().toUTCString()}] Create table 'CommentAccount' successfully.`);
        }
    });
}

// confirm Feedback
$(document).on('submit', '#frm-feedback', confirmFeedback);

function confirmFeedback(e) {
    e.preventDefault()
    var name = $('#infopage #frm-feedback #name').val();
    var message = $('#infopage #frm-feedback #message').val();

    db.transaction(function (tx) {
        var query = 'SELECT Id FROM Feedback WHERE Name = ?';
        tx.executeSql(query, [name], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] == null) {
                $('#infopage #popup-feedback-confirm #name').text(name);
                $('#infopage #popup-feedback-confirm #message').text(message);
                $('#infopage #popup-feedback-confirm').popup('open');
            } else {
                alert('Feedback exists');
            }
        }
    });

}

// Add Feedback
$(document).on('vclick', '#infopage #popup-feedback-confirm #btn-confirm', addFeeback)
function addFeeback(e) {
    e.preventDefault();
    var name = $('#infopage #popup-feedback-confirm #name').text();
    var message = $('#infopage #popup-feedback-confirm #message').text();
    db.transaction(function (tx) {
        var query = 'INSERT INTO Feedback (Name, Message) VALUES (?, ?)';
        tx.executeSql(query, [name, message], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            // Logging.
            console.log(`Create a feedback '${name}' successfully.`);

            // Reset the form.
            $('#frm-feedback').trigger('reset');
            $('#name').focus();
            $('#infopage #popup-feedback-confirm').popup('close');
        }
    });

}
// 
$(document).on('vclick', '#infopage #popup-feedback-confirm #btn-confirm', pluginBeep)
$(document).on('vclick', '#infopage #popup-feedback-confirm #btn-cancel', pluginVibration)
function pluginVibration() {
    // Rung trong 7 giây  
    // Tạm dừng trong 2 giây  
    // Rung trong 4 giây  
    // Tạm dừng trong 5 giây  
    // Rung trong 6 giây  
    navigator.vibrate([7000, 2000, 4000, 5000, 6000]);  
}
function pluginBeep() {
        // kêu hai tiếng 

    navigator.notification.beep(2);
}


// Submit a form to Apartment a new Apartment./////////////////////////////////////////////////
// select Apartment address
$(document).on('pagebeforeshow','#addpage',function(){
    importAddress('#addpage #frm-apartment','City');
    importAddress('#addpage #frm-apartment','District','City');
    importAddress('#addpage #frm-apartment','Ward','District');

});

$(document).on('change','#addpage #frm-apartment #city',function(){

    importAddress('#addpage #frm-apartment','District','City');
    importAddress('#addpage #frm-apartment','Ward','District');

});

$(document).on('change','#addpage #frm-apartment #district',function(){
    importAddress('#addpage #frm-apartment','Ward','District');
});
function importAddress(form, name, parentName ='',selectedValue = -1){
    var lowerName = name.toLowerCase();

    var id , conditon = '';
    if(parentName){
        id = $(`${form} #${parentName.toLowerCase()}`).val();
        conditon = `where ${parentName}Id = ${id}`;
    }
    
    db.transaction(function (tx){
        var query = `Select * from ${name} ${conditon} order by Name`;

        tx.executeSql(query,[],transactionSuccess,transactionError);

        function transactionSuccess(tx,result){
            var optionList = `<option value='-1'>Select</option>`;

            for (let item of result.rows){
                optionList += `<option value='${item.Id}' ${item.Id == selectedValue ? 'selected': ''}> ${item.Name}</option>`;
            }
            $(`${form} #${lowerName}`).html(optionList);
            $(`${form} #${lowerName}`).selectmenu('refresh',true);

        }

    });
}
//// Add Apartment


$(document).on('submit', '#frm-apartment', confirmApartment);
function confirmApartment(e) {
    e.preventDefault()
    var propertytypename = $('#addpage #frm-apartment #propertytypename').val();
    var propertytypeaddress = $('#addpage #frm-apartment #propertytypeaddress').val();
    var propertytype = $('#addpage #frm-apartment #propertytype').val();
    var bedroom = $('#addpage #frm-apartment #bedroom').val();
    var monthlyrentprice = $('#addpage #frm-apartment #monthlyrentprice').val();
    var furnituretype = $('#addpage #frm-apartment #furnituretype').val();
    var description = $('#addpage #frm-apartment #description').val();
    var namereporter = $('#addpage #frm-apartment #namereporter').val();
    var city = $('#addpage #frm-apartment #city option:selected').text();
    var ward = $('#addpage #frm-apartment #ward option:selected').text();
    var district = $('#addpage #frm-apartment #district option:selected').text();


    db.transaction(function (tx) {
        var query = 'SELECT * FROM Apartment WHERE Propertytypename = ?';

        tx.executeSql(query, [propertytypename], transactionSuccess, transactionError);


        function transactionSuccess(tx, result) {
            if (result.rows[0] == null) {
                $('#addpage #popup-apartment-confirm #propertytypename').text(propertytypename);
                $('#addpage #popup-apartment-confirm #propertytypeaddress').text(propertytypeaddress);
                $('#addpage #popup-apartment-confirm #propertytype').text(propertytype);
                $('#addpage #popup-apartment-confirm #bedroom').text(bedroom);
                $('#addpage #popup-apartment-confirm #monthlyrentprice').text(monthlyrentprice);
                $('#addpage #popup-apartment-confirm #furnituretype').text(furnituretype);
                $('#addpage #popup-apartment-confirm #description').text(description);
                $('#addpage #popup-apartment-confirm #namereporter').text(namereporter);
                $('#addpage #popup-apartment-confirm #city').text(city);
                $('#addpage #popup-apartment-confirm #ward').text(ward);
                $('#addpage #popup-apartment-confirm #district').text(district);



                $('#addpage #popup-apartment-confirm').popup('open');
            } else {
                alert('Apartment exists');
            }
        }
    });


}
$(document).on('vclick', '#addpage #popup-apartment-confirm #btn-confirm', addApartment)
function addApartment(e) {
    e.preventDefault();
    var propertytypename = $('#addpage #popup-apartment-confirm #propertytypename').text();
    var propertytypeaddress = $('#addpage #popup-apartment-confirm #propertytypeaddress').text();
    var propertytype = $('#addpage #popup-apartment-confirm #propertytype').text();
    var bedroom = $('#addpage #popup-apartment-confirm #bedroom').text();
    var createdate = new Date();
    var monthlyrentprice = $('#addpage #popup-apartment-confirm #monthlyrentprice').text();
    var furnituretype = $('#addpage #popup-apartment-confirm #furnituretype').text();
    var description = $('#addpage #popup-apartment-confirm #description').text();
    var namereporter = $('#addpage #popup-apartment-confirm #namereporter').text();
    var city = $('#addpage #popup-apartment-confirm #city').text();
    var ward = $('#addpage #popup-apartment-confirm #ward').text();
    var district = $('#addpage #popup-apartment-confirm #district').text();

    db.transaction(function (tx) {
        var query = `INSERT INTO Apartment (Propertytypename, Propertytypeaddress,Propertytype, Bedroom, Createdate,
             Monthlyrentprice, Furnituretype, Description, Namereporter,City,Ward,District) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
        tx.executeSql(query, [propertytypename, propertytypeaddress, propertytype, bedroom, createdate,
            monthlyrentprice, furnituretype, description, namereporter,city,ward,district], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            // Logging.
            console.log(`Create a propertytypename '${propertytypename}' successfully.`);

            // Reset the form.
            $('#frm-apartment').trigger('reset');
            $('#propertytypename').focus();
            $('#addpage #popup-apartment-confirm').popup('close');

        }
    });
}

// Display Apartment List.
$(document).on('pagebeforeshow', '#loadpage', showListApartment);

function showListApartment() {
    db.transaction(function (tx) {

        var query = `SELECT Id,Propertytypename, Propertytypeaddress,Propertytype, Createdate,
        Monthlyrentprice,City,Ward,District FROM Apartment`;

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Show list of Apartments successfully.`);

            // Prepare the list of Apartment.
            var listApartment = `
            <ul id='list-apartment' data-role='listview' data-filter='true' data-filter-placeholder='Search Apartment'
            data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let apartment of result.rows) {
                listApartment +=
                    `<li><a data-details='{"Id" : ${apartment.Id}}'>
                            <h3 style="font-weight:bold;padding-left:5%;"> Property type name:${apartment.Propertytypename}</h3>
                            <p style="font-size:small;font-weight:bold;padding-left:5%;"><br><img src="css/themes/images/icons-png/calendar-black.png"> <br>${apartment.Createdate}</p>
                            <p style="font-size:small;font-weight:bold;padding-left:5%;"><img src="css/themes/images/icons-png/tag-black.png"><br><span class="blod">Price:</span> ${apartment.Monthlyrentprice}<span class="blod"> USD/Month</p></span>

                            <p style="font-size:small;font-weight:bold;padding-left:5%;"><img src="css/themes/images/icons-png/home-black.png"> <br><span class="blod"> Property type:</span> ${apartment.Propertytype}</p>
                           
                            <p style="font-size:small;font-weight:bold;padding-left:5%;"><img src="css/themes/images/icons-png/location-black.png"><span class="blod"> <br> ${apartment.Propertytypeaddress} <br>${apartment.City} <br>${apartment.Ward}${apartment.District}</p>
                    </a></li>`;
            }
            listApartment += `</ul>`;

            // Add list to UI.
            $('#list-apartment').empty().append(listApartment).listview('refresh').trigger('create');
        }
    });
}

// Save apartment Id.
$(document).on('vclick', '#list-apartment li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentApartmentId', id);
    $.mobile.navigate('#pagedetail', { transition: 'none' });


});

// Show Apartment Details.
$(document).on('pagebeforeshow', '#pagedetail', showDetails);

function showDetails() {
    var id = localStorage.getItem('currentApartmentId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Apartment WHERE Id = ? ';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var error = 'Apartment not found';
            var propertytypename = error;
            var propertytypeaddress = error;
            var propertytype = error;
            var bedroom = error;
            var createdate = error;
            var monthlyrentprice = error;
            var furnituretype = error;
            var description = error;
            var namereporter = error;
            var city = error;
            var ward = error;
            var district = error;

            if (result.rows[0] != null) {
                propertytypename = result.rows[0].Propertytypename;
                propertytypeaddress = result.rows[0].Propertytypeaddress;
                propertytype = result.rows[0].Propertytype;
                bedroom = result.rows[0].Bedroom;
                createdate = result.rows[0].Createdate;
                monthlyrentprice = result.rows[0].Monthlyrentprice;
                furnituretype = result.rows[0].Furnituretype;
                description = result.rows[0].Description;
                namereporter = result.rows[0].Namereporter;
                city = result.rows[0].City;
                ward = result.rows[0].Ward;
                district = result.rows[0].District;
            }
            else {
                console.log(error);

                $('#pagedetail #btn-update').addClass('ui-disabled');
                $('#pagedetail #btn-delete-confirm').addClass('ui-disabled');
            }


            $('#pagedetail #id').text(id);
            $('#pagedetail #propertytypename').text(propertytypename);
            $('#pagedetail #propertytypeaddress').text(propertytypeaddress);
            $('#pagedetail #propertytype').text(propertytype);
            $('#pagedetail #bedroom').text(bedroom);
            $('#pagedetail #createdate').text(createdate);
            $('#pagedetail #monthlyrentprice').text(monthlyrentprice);
            $('#pagedetail #furnituretype').text(furnituretype);
            $('#pagedetail #description').text(description);
            $('#pagedetail #namereporter').text(namereporter);
            $('#pagedetail #city').text(city);
            $('#pagedetail #ward').text(ward);
            $('#pagedetail #district').text(district);
            showImage();
            showComment();


        }
    });
}
// Delete Apartment.
$(document).on('vclick', '#pagedetail #btn-delete', deleteApartment);

function deleteApartment() {
    var id = localStorage.getItem('currentApartmentId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Apartment WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Delete Apartment '${id}' successfully.`);

            $.mobile.navigate('#loadpage', { transition: 'none' });
        }
    });
}
// update Apartment.
$(document).on("vclick", "#pagedetail #btn-update", function () {

    var id = localStorage.getItem("currentApartmentId");

    db.transaction(function (tx) {
        var query = "SELECT * FROM Apartment WHERE Id = ?";
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var error = "Apartment not found.";
            var propertytypename = error;
            var propertytypeaddress = error;
            var propertytype = error;
            var bedroom = error;
            var createdate = error;
            var monthlyrentprice = error;
            var furnituretype = error;
            var description = error;
            var namereporter = error;
            var city = error;
            var ward = error;
            var district = error;

            if (result.rows[0] != null) {
                propertytypename = result.rows[0].Propertytypename;
                propertytypeaddress = result.rows[0].Propertytypeaddress;
                propertytype = result.rows[0].Propertytype;
                bedroom = result.rows[0].Bedroom;
                createdate = result.rows[0].Createdate;
                monthlyrentprice = result.rows[0].Monthlyrentprice;
                furnituretype = result.rows[0].Furnituretype;
                description = result.rows[0].Description;
                namereporter = result.rows[0].Namereporter;
                city = result.rows[0].City;
                ward = result.rows[0].Ward;
                district = result.rows[0].District;


            } else {
                console.log(error);
            }

            $("#updatedialog #propertytypename").val(propertytypename);
            $("#updatedialog #propertytypeaddress").val(propertytypeaddress);
            $("#updatedialog #propertytype").val(propertytype);
            $("#updatedialog #bedroom").val(bedroom);
            $("#updatedialog #monthlyrentprice").val(monthlyrentprice);
            $("#updatedialog #furnituretype").val(furnituretype);
            $("#updatedialog #description").val(description);
            $("#updatedialog #namereporter").val(namereporter);
            $("#updatedialog #city").val(city);
            $("#updatedialog #ward").val(ward);
            $("#updatedialog #district").val(district);
        }
    });
});

$(document).on("submit", "#frm-update", uploadApartment);

function uploadApartment(e) {
    e.preventDefault();

    var id = localStorage.getItem("currentApartmentId");

    var propertytypename = $('#updatedialog #propertytypename').val();
    var propertytypeaddress = $('#updatedialog #propertytypeaddress').val();
    var propertytype = $('#updatedialog #propertytype').val();
    var bedroom = $('#updatedialog #bedroom').val();
    var createdate = new Date();
    var monthlyrentprice = $('#updatedialog #monthlyrentprice').val();
    var furnituretype = $('#updatedialog #furnituretype').val();
    var description = $('#updatedialog #description').val();
    var namereporter = $('#updatedialog #namereporter').val();
    var city = $('#updatedialog #city').val();
    var ward = $('#updatedialog #ward').val();
    var district = $('#updatedialog #district').val();

    db.transaction(function (tx) {
        var query =
            `UPDATE Apartment SET Propertytypename = ?, Propertytypeaddress = ? , Propertytype = ? , Bedroom = ? 
        , Createdate = ? , Monthlyrentprice = ? , Furnituretype = ? , Description = ? , Namereporter = ? , City  = ? , Ward = ? , District = ? WHERE Id = ? `;
        tx.executeSql(query, [propertytypename, propertytypeaddress, propertytype, bedroom, createdate,
            monthlyrentprice, furnituretype, description, namereporter,city,ward,district, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {

            console.log(`update a propertytypename '${propertytypename}' successfully.`);


            $.mobile.navigate('#loadpage', { transition: 'none' });
        }
    });
}

/// Add Comment
$(document).on('vclick', '#pagedetail #popup-comment #btn-comment', addComment);

function addComment() {
    var apartmentId = localStorage.getItem('currentApartmentId');
    var comment = $('#pagedetail #popup-comment #comment').val();
    var date = new Date();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Comment (Comment, Datetime,ApartmentId) VALUES (?, ?, ?)';
        tx.executeSql(query, [comment, date, apartmentId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Add comment to Apartment '${apartmentId}' successfully.`);
            showComment();

            $('#pagedetail #popup-comment #comment').val('');
            $('#popup-comment').popup('close')
        }
    });
}
function showComment() {
    var apartmentId = localStorage.getItem('currentApartmentId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Comment WHERE ApartmentId = ?';
        tx.executeSql(query, [apartmentId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Show list of comment successfully.`);

            // Prepare the list of comment.
            var listComment = `<ul id='list-comment' data-role='listview'>`;
            for (let comment of result.rows) {
                listComment += `<li>
                                    <h3>${comment.Comment}</h3>
                                    <h3>${comment.Datetime}</h3>
                                </li>`;
            }
            listComment += `</ul>`;

            // Add list to UI.
            $('#list-comment').empty().append(listComment).listview('refresh').trigger('create');
        }
    });
}
/// search 
$(document).on('submit', '#pagesearch #frm-search', search);
function search(e) {
    e.preventDefault();
    var id = $('#pagesearch #frm-search #id').val();
    var propertytypename = $('#pagesearch #frm-search #propertytypename').val();
    var propertytypeaddress = $('#pagesearch #frm-search #propertytypeaddress').val();
    var propertytype = $('#pagesearch #frm-search #propertytype').val();
    var bedroom = $('#pagesearch #frm-search #bedroom').val();
    var monthlyrentprice = $('#pagesearch #frm-search #monthlyrentprice').val();
    var furnituretype = $('#pagesearch #frm-search #furnituretype').val();
    var namereporter = $('#pagesearch #frm-search #namereporter').val();
    db.transaction(function (tx) {

        var query = `SELECT Id, Propertytypename, Propertytypeaddress,Propertytype,Bedroom,Monthlyrentprice,Furnituretype,Namereporter,Createdate FROM Apartment WHERE`;
        if (id) {
            query += ` Id = ${id}   AND`;
        }
        if (propertytypename) {
            query += ` Propertytypename LIKE  "%${propertytypename}%"   AND`;
        }
        if (propertytypeaddress) {
            query += ` Propertytypeaddress LIKE  "%${propertytypeaddress}%"   AND`;
        }
        if (propertytype) {
            query += ` Propertytypename LIKE  "%${propertytypename}%"   AND`;
        }
        if (bedroom) {
            query += ` Bedroom LIKE  "%${bedroom}%"   AND`;
        }
        if (monthlyrentprice) {
            query += ` Monthlyrentprice > ${monthlyrentprice}   AND`;
        }
        if (furnituretype) {
            query += ` Furnituretype LIKE  "%${furnituretype}%"   AND`;
        }
        if (namereporter) {
            query += ` Namereporter LIKE  "%${namereporter}%"   AND`;
        }
        query = query.substring(0, query.length - 6);
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Show list of Search successfully.`);

            // Prepare the list of Apartment.
            var listSearch = `
            <ul id='list-Search' data-role='listview' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let apartment of result.rows) {
                listSearch +=
                    `<li><a data-details='{"Id" : ${apartment.Id}}'>
                            <h3>Property type name: ${apartment.Propertytypename}</h3>
                            
                            <p><img src="css/themes/images/icons-png/tag-black.png"><span class="blod"> Monthly Rent Price:</span> ${apartment.Monthlyrentprice}<span class="blod"> USD/Month</p></span>
                            <p><img src="css/themes/images/icons-png/home-black.png"><span class="blod"> Property type:</span> ${apartment.Propertytype}</p>
                            <p><img src="css/themes/images/icons-png/location-black.png"><span class="blod"> Property type address:</span> ${apartment.Propertytypeaddress}</p>
                            <p><img src="css/themes/images/icons-png/calendar-black.png"><span class="blod"> Create Date:</span> ${apartment.Createdate}</p>
                            <p><img src="css/themes/images/icons-png/star-black.png"><span class="blod"> Furniture Type:</span> ${apartment.Furnituretype}</p>
                            <p><img src="css/themes/images/icons-png/info-black.png"><span class="blod"> Bedrooms:</span> ${apartment.Bedroom}</p>
                            <p><img src="css/themes/images/icons-png/user-black.png"><span class="blod"> Name Reporter:</span> ${apartment.Namereporter} </p>
                    </a></li>`;
            }
            listSearch += `</ul>`;

            // Add list to UI.
            $('#list-Search').empty().append(listSearch).listview('refresh').trigger('create');
        }
    });
}
// Save apartment Id.
$(document).on('vclick', '#list-Search li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentApartmentId', id);
    $.mobile.navigate('#pagedetail', { transition: 'none' });


});
//commission calculation
function apartmentTip() {
    var billAmt = document.getElementById("billamt").value;
    var serviceQual = document.getElementById("serviceQual").value;
    var numOfPeople = document.getElementById("peopleamt").value;

    //validate input
    if (billAmt === "" || serviceQual == 0) {
        alert("Please enter values");
        return;
    }
    //Check to see if this input is empty or less than or equal to 1
    if (numOfPeople === "" || numOfPeople <= 1) {
        numOfPeople = 1;
        document.getElementById("each").style.display = "none";
    } else {
        document.getElementById("each").style.display = "block";
    }

    //Calculate tip
    var total = (billAmt * serviceQual) / numOfPeople;
    //round to two decimal places
    total = Math.round(total * 100) / 100;
    //next line allows us to always have two digits after decimal point
    total = total.toFixed(2);
    //Display the tip
    document.getElementById("totalTip").style.display = "block";
    document.getElementById("tip").innerHTML = total;

}

//Hide the tip amount on load
document.getElementById("totalTip").style.display = "none";
document.getElementById("each").style.display = "none";

//click to call function
document.getElementById("calculate").onclick = function () {
    apartmentTip();

};
/// login
db.transaction(function (tx) {

    tx.executeSql('CREATE TABLE IF NOT EXISTS User (Username TEXT PRIMARY KEY, Password TEXT, Name TEXT, Type TEXT)');
    tx.executeSql('INSERT INTO User (Id,Username, Password, Name, Type) VALUES ("1","admin", "1234", "administrador", "0")');
});




// Read the username and password fields
function Validate() {

    // Get the username and password
    var chave = document.getElementById('username').value;
    var txtSenha = document.getElementById('password').value;

    //Default system username and password is admin and 1234. These values are defined in the database.
    // After registering an admin user, it will be deleted.	
    if (chave === "admin" && txtSenha === "1234") {

        // Transforms the OBJECT with the user information in string and stores it in the sessionstorage
        sessionStorage.setItem("userLoggedin", JSON.stringify({ 'Id': 1, 'Username': "admin", 'Name': "Administrador", 'Type': 0 }));
        window.location.href = "home.html";


    } else {
        // Perform database operations.
        // Validate any other user registered in the database
        db.transaction(function (tx) {

            // Filters the database with the values provided in the login input, if registered
            // logs into the system. the type field defines whether it is an administrator or a common user.
            tx.executeSql("SELECT Username, Name, Type FROM User WHERE Username = '" + chave + "' AND Password = '" + txtSenha + "' ", [], function (tx, results) {

                // Se tam for maior que 0 encontrou o usuario no banco de dados e valida a senha. Se não da mensagem
                // de usuario ou senha incorreto.
                var tam = results.rows.length;
                if (tam > 0) {

                    // Transforms the OBJECT with the user information in string and stores it in the sessionstorage
                    // from the browser.
                    sessionStorage.setItem("userLoggedin", JSON.stringify({ 'Username': results.rows.item(0).Username, 'Name': results.rows.item(0).Name, 'Type': results.rows.item(0).Type }));


                    window.location.href = "home.html";

                } else {
                    alert("Incorrect username or password");

                };

            });
        });


    };


};
// This function restores from sessionStorage the information of who is logged in.
function Login() {
    var logged = JSON.parse(sessionStorage.getItem("userLoggedin"));

    document.getElementById("wellcome").innerHTML = "Hello!    " + logged.Name;
};

// Clear sessionStorage
function Logout() {
    sessionStorage.clear()
    window.location.href = "index.html";


};


// Class will serve as a template for all screens that need to perform database operations.
var OperSql = function (Username, Password, Name, Type) {

    this.Username = Username;
    this.Password = Password;
    this.Name = Name;
    this.Type = Type;



};


OperSql.prototype.Torecord = function () {

    // Variables that receive form data.
    // Declared like this, because with this, it doesn't go into the tx function
    var Username = this.Username;
    var Password = this.Password;
    var Name = this.Name;
    var Type = this.Type;

    db.transaction(function (tx) {

        tx.executeSql('SELECT username FROM User WHERE Username = "' + Username + '" ', [], function (tx, results) {

            // If tam is different from 0, found a user with the same Email in the bank.
            var tam = results.rows.length;
            if (tam === 0) {

                // Write the user to the bank
                tx.executeSql('INSERT INTO User (Username, Password, Name, Type) VALUES ("' + Username + '","' + Password + '","' + Name + '","' + Type + '")');
                alert("User registered successfully!")


            } else {
                alert("There is already a user with this Email!");

            };

        });


    });
};


function Tosave() {

    // Receive data from forms.
    var Username = document.getElementById('username').value;
    var Password = document.getElementById('password').value;
    var Name = document.getElementById('name').value;
    var Type = document.getElementById('type').value;

    // Tests if the typed passwords match and sends to the constructor.
    if (Password === document.getElementById('cpassword').value) {

        var userData = new OperSql(Username, Password, Name, Type);
        userData.Torecord();

    } else {

        alert("Password does not match!")
    };



};
/// Find geolocation
function geoFindMe() {

    const status = document.querySelector('#status');
    const mapLink = document.querySelector('#map-link');

    mapLink.href = '';
    mapLink.textContent = '';

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        status.textContent = '';
        mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
    }

    function error() {
        status.textContent = 'Unable to retrieve your location';
    }

    if (!navigator.geolocation) {
        status.textContent = 'Geolocation is not supported by your browser';
    } else {
        status.textContent = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error);
    }

}

document.querySelector('#find-me').addEventListener('click', geoFindMe);
///Take picture 
$(document).on('vclick', '#pagedetail  #btn-take-picture', takePicture);

function takePicture() {
    var apartmentId = localStorage.getItem('currentApartmentId');
    var options = {
         destinationType: Camera.DestinationType.DATA_URL,
         saveToPhotoAlbum: true
     }
     navigator.camera.getPicture(success, error, options);
     function success(imageData) {
        db.transaction(function (tx) {
            var query = 'INSERT INTO Image (Image,ApartmentId) VALUES (?,?)';
            tx.executeSql(query, [imageData, apartmentId], transactionSuccess, transactionError);
            function transactionSuccess(tx, result) {
                alert('Sucessfull stored in database ');
            }
            showImage();
        });
    }
    function error(error) {
        alert(`Failed to take picture. Error: ${error}.`);
    }
}
///up picture 
$(document).on('vclick', '#pagedetail  #btn-up-picture', upPicture);

function upPicture() {
    var apartmentId = localStorage.getItem('currentApartmentId');
    var options = {
         destinationType: Camera.DestinationType.DATA_URL,
         sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        }
     navigator.camera.getPicture(success, error, options);
     function success(imageData) {
        db.transaction(function (tx) {
            var query = 'INSERT INTO Image (Image,ApartmentId) VALUES (?,?)';
            tx.executeSql(query, [imageData, apartmentId], transactionSuccess, transactionError);
            function transactionSuccess(tx, result) {
                alert('Sucessfull stored in database ');
            }
            showImage();
        });
    }
    function error(error) {
        alert(`Failed to take picture. Error: ${error}.`);
    }
}

 
function showImage() {
    var apartmentId = localStorage.getItem('currentApartmentId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Image WHERE ApartmentId = ?';
        tx.executeSql(query, [apartmentId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Show list of Image successfully.`);

            // Prepare the list of accounts.
            var listImage = `<div id='list-image' data-role='listview'>`;
            for (let image of result.rows) {
                listImage += `<div>
                                    
                                    <img src='data:image/jpeg;base64,${image.Image}' width='100%'>
                                </div>`;
            }
            listImage += `</div>`;

            // Add list to UI.
            $('#list-image').empty().append(listImage).listview('refresh').trigger('create');
        }
    });
}
//
    $('#frm-apartment').validate({
        rules: {
            propertytypename: "required",
            propertytypeaddress: "required",
            propertytype: "required",
            bedroom: "required",
            monthlyrentprice: {
                minlength: 3,
                required: true,
                number: true
            },
            namereporter: "required"

        },
        messages: {
            propertytypename: "Please input Property Name !",
            propertytypeaddress: "Please input Property Address !",
            propertytype: "Please input Property Type !",
            bedroom: "Please input Bedroom !",
            monthlyrentprice: {
                required: "Please input Price !",
                number: "Please enter the correct format!",
                minlength: "value is too low!",
            },
            namereporter: "Please input Name Reporter !"

        },
        errorPlacement: function (error, element) {
            error.appendTo(element.parent().prev());
        },
      
    });
     



