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
        /// login
        db.transaction(function (tx) {

            tx.executeSql('CREATE TABLE IF NOT EXISTS User (Id INTEGER PRIMARY KEY AUTOINCREMENT,Username TEXT, Password TEXT, Name TEXT, Type TEXT)');
            tx.executeSql('INSERT INTO User (Id,Username, Password, Name, Type) VALUES ("1","admin", "1234", "administrador", "0")');
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
        prepareDatabase(db);

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
// List Feedback
$(document).on('pagebeforeshow', '#feedbacklist', showListfeedback);

function showListfeedback() {
    db.transaction(function (tx) {
        var query = 'SELECT Id, Name FROM Feedback';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            // Logging.

            console.log(`show a feedback successfully.`);

            // Prepare the list of feedbacks.
            var ListFeedback = `<ul id='list-feeback' data-role='listview' data-filter='true' data-filter-placeholder='Search feedback...'
                                                     data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let feedback of result.rows) {
                ListFeedback += `<li><a data-details='{"Id" : ${feedback.Id}}'>
                                    <img src='img/user.png'>
                                    <h3>Name: ${feedback.Name}</h3>
                                    <p>Text: ${feedback.Id}</p>
                                </a></li>`;
            }
            ListFeedback += `</ul>`;

            // Add list Feedback to UI.
            $('#list-feeback').empty().append(ListFeedback).listview('refresh').trigger('create');
        }
    });
}
// Save currentFeedBackId
$(document).on('vclick', '#list-feeback li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentFeedBackId', id);

    $.mobile.navigate('#feedback-detail', { transition: 'none' });
});
// Show Feedback Details.
$(document).on('pagebeforeshow', '#feedback-detail', showDetailFeedback);

function showDetailFeedback() {
    var id = localStorage.getItem('currentFeedBackId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Feedback WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Feedback not found.';
            var name = errorMessage;
            var message = errorMessage;

            if (result.rows[0] != null) {
                name = result.rows[0].Name;
                message = result.rows[0].Message;
            }
            else {
                console.log(errorMessage);

                $('#feedback-detail #btn-delete-confirm').addClass('ui-disabled');
            }

            $('#feedback-detail #id').text(id);
            $('#feedback-detail #name').text(name);
            $('#feedback-detail #message').text(message);
        }
    });
}
// Delete Feedback.
$(document).on('vclick', '#feedback-detail #btn-delete-confirm', deleteFeedback);

function deleteFeedback() {
    var id = localStorage.getItem('currentFeedBackId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Feedback WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Delete Feedback '${id}' successfully.`);

            $.mobile.navigate('#feedbacklist', { transition: 'none' });
        }
    });
}


//login

// Read the username and password fields
function Validate() {

    // Get the username and password
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    //Default system username and password is admin and 1234. These values are defined in the database.
    // After registering an admin user, it will be deleted.	
    if (username === "admin" && password === "1234") {

        // Transforms the OBJECT with the user information in string and stores it in the sessionstorage
        sessionStorage.setItem("userLoggedin", JSON.stringify({ 'Id': 1, 'Username': "admin", 'Name': "Administrador", 'Type': 0 }));
        window.location.href = "adminslide.html";


    } else {
        // Perform database operations.
        // Validate any other user registered in the database
        db.transaction(function (tx) {

            // Filters the database with the values provided in the login input, if registered
            // logs into the system. the type field defines whether it is an administrator or a common user.
            tx.executeSql("SELECT Username, Name, Type FROM User WHERE Username = '" + username + "' AND Password = '" + password + "' ", [], function (tx, results) {

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
function Loginadmin() {
    var logged = JSON.parse(sessionStorage.getItem("userLoggedin"));

    document.getElementById("wellcome").innerHTML = "wellcome " + logged.Name;
};

// Clear sessionStorage
function Logoutadmin() {
    sessionStorage.clear()
    window.location.href = "loginadmin.html";


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
// Manager Account 
// Display Account List.
$(document).on('pagebeforeshow', '#load-account-page', showList);

function showList() {
    db.transaction(function (tx) {
        var query = 'SELECT Id,Username,Name FROM User';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {

            // Prepare the list of accounts.
            var listAccount = `<ul id='list-account' data-role='listview' data-filter='true' data-filter-placeholder='Search accounts...'
                                                     data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let account of result.rows) {
                listAccount += `<li><a data-details='{"Id" : ${account.Id}}'>
                                    <img src='img/user.png'>
                                    <h3>Username: ${account.Username}</h3>
                                    <p>Name: ${account.Name}</p>
                                    <p>ID: ${account.Id}</p>
                                </a></li>`;
            }
            listAccount += `</ul>`;

            // Add list to UI.
            $('#list-account').empty().append(listAccount).listview('refresh').trigger('create');

            console.log(`Show list of accounts successfully.`);
        }
    });
}

// Save Account Id.
$(document).on('vclick', '#list-account li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentAccountId', id);
    $.mobile.navigate('#page-detail-account', { transition: 'none' });


});

// Show Account Details.
$(document).on('pagebeforeshow', '#page-detail-account', showDetailAcounts);

function showDetailAcounts() {
    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM User WHERE Id = ? ';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var error = 'User not found';
            var username = error;
            var password = error;
            var name = error;
            var type = error;


            if (result.rows[0] != null) {
                username = result.rows[0].Username;
                password = result.rows[0].Password;
                name = result.rows[0].Name;
                type = result.rows[0].Type;
            }
            else {
                console.log(error);

                $('#page-detail-account #btn-update').addClass('ui-disabled');
                $('#page-detail-account #btn-delete-confirm').addClass('ui-disabled');
            }


            $('#page-detail-account #id').text(id);
            $('#page-detail-account #username').text(username);
            $('#page-detail-account #password').text(password);
            $('#page-detail-account #name').text(name);
            $('#page-detail-account #type').text(type);

            showNote();


        }
    });
}
// Delete Account.
$(document).on('vclick', '#page-detail-account #btn-delete', deleteApartment);

function deleteApartment() {
    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM User WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Delete account '${id}' successfully.`);

            $.mobile.navigate('#load-account-page', { transition: 'none' });
        }
    });
}
// update Account.
$(document).on("vclick", "#page-detail-account #btn-update", function () {
    $.mobile.navigate("#updatedialog-account");

    var id = localStorage.getItem("currentAccountId");

    db.transaction(function (tx) {
        var query = "SELECT * FROM User WHERE Id = ?";
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var error = 'User not found';
            var username = error;
            var password = error;
            var name = error;
            var type = error;

            if (result.rows[0] != null) {
                username = result.rows[0].Username;
                password = result.rows[0].Password;
                name = result.rows[0].Name;
                type = result.rows[0].Type;


            } else {
                console.log(error);
            }

            $("#updatedialog-account #username").val(username);
            $("#updatedialog-account #password").val(password);
            $("#updatedialog-account #name").val(name);
            $("#updatedialog-account #type").val(type);

        }
    });
});

$(document).on("submit", "#frm-update", uploadAccount);

function uploadAccount(e) {
    e.preventDefault();

    var id = localStorage.getItem("currentAccountId");

    var username = $('#updatedialog-account #username').val();
    var password = $('#updatedialog-account #password').val();
    var name = $('#updatedialog-account #name').val();
    var type = $('#updatedialog-account #type').val();


    db.transaction(function (tx) {
        var query = `UPDATE User SET Username = ?, Password = ? , Name = ? , Type = ?  WHERE Id = ? `;
        tx.executeSql(query, [username, password, name, type, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {

            console.log(`update a username '${username}' successfully.`);


            $.mobile.navigate('#load-account-page', { transition: 'none' });
        }
    });
}
/// Add Comment to note account
$(document).on('submit', '#page-detail-account #frm-note', addNote);

function addNote(e) {
    e.preventDefault();

    var id = localStorage.getItem("currentAccountId");
    var message = $('#page-detail-account #frm-note #message').val();

    db.transaction(function (tx) {
        var query = `INSERT INTO CommentAccount (CommentAccount, UserId, Datetime) VALUES (?, ?, julianday('now'))`;
        tx.executeSql(query, [message, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Add new note to property '${id}' successfully.`);

            $('#page-detail-account #frm-note').trigger('reset');

            showNote();
        }
    });
}

function showNote() {
    var id = localStorage.getItem("currentAccountId");

    db.transaction(function (tx) {
        var query = `SELECT CommentAccount, datetime(Datetime, '+7 hours') AS Datetime FROM CommentAccount WHERE UserId = ?`;
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            console.log(`Get list of notes successfully.`);

            var noteList = '';
            for (let note of result.rows) {
                noteList += `<div class = 'list'>
                                <h3>${note.Datetime}</h3>
                                <h3>${note.CommentAccount}</h3>
                            </div>`;
            }

            $('#list-note').empty().append(noteList);

            console.log(`Show list of notes successfully.`);
        }
    });
}