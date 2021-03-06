// --------------------------------------- Security ----------------------------------------------------- //

function getRandomSHA1(token)
{
    // Handles changes to $.util in SPS09
    // Calculate HMACSHA1-Value (160 Bits) which is returned as a Buffer of 20 Bytes
    // Encode ByteBuffer to Base64-String
    var hmacSha1ByteBuffer;
    if (intHanaVersion >= 9){
        hmacSha1ByteBuffer = $.security.crypto.sha1(token, Math.random().toString(36).slice(2));
    } else {
        hmacSha1ByteBuffer = $.util.crypto.hmacSha1(token, Math.random().toString(36).slice(2));
    }
    return  $.util.codec.encodeBase64(hmacSha1ByteBuffer);
}

function getDBInfo(){
    return sqlLib.executeRecordSetObj("SELECT * FROM SYS.M_SYSTEM_OVERVIEW");
}

function getUserInfo(){
    return sqlLib.executeRecordSetObj("SELECT LNAME, NAME, ACCT_TYPE, EMAIL, EMAIL_DOMAIN, USER_THEME FROM METRIC2.m2_Users WHERE user_id = " + userid);
}

function getUserSessionToken() {
    // Get the salt from the useraccount, apply it, and test the password
    var hash = sqlLib.executeScalar("SELECT HASH_SHA256 (TO_BINARY('" + password + "'), to_BINARY(DT_ADDED)) from METRIC2.M2_Users where email = '" + email + "'");
    var userID = sqlLib.executeScalar("SELECT user_id FROM metric2.m2_users WHERE email = '" + email + "' AND password = '" + hash + "'");
    var userInitialToken = getRandomSHA1(userID);
    
    // If the userID and password are correct, we will return a hashed user token otherwise the 999 number
    if (!userID){
        userInitialToken = 999;
    } else {
        // Create a session token and update the user token in the DB
        sqlLib.executeUpdate("UPDATE metric2.m2_users set user_token = '" + userInitialToken + "' WHERE user_id = " + userID);
    }
    return userInitialToken;
}

function getUserIDfromToken(usertoken){
    return sqlLib.executeScalar("SELECT user_id FROM metric2.m2_users WHERE user_token = '" + usertoken + "'");
}

function updateUserPassword(password){
    //var userid = $.request.parameters.get('userid');
    var dt = sqlLib.executeScalar("SELECT CURRENT_TIMESTAMP from DUMMY");
    password = hash(password, dt);
    var SQL = "UPDATE METRIC2.M2_USERS SET password = '" + password + "', dt_added = '" + dt + "' WHERE user_id = " + userid;
    sqlLib.executeUpdate(SQL);
    return "updated";
}

function updateUser(){
    var email = $.request.parameters.get('email');
    var lname = $.request.parameters.get('lname');
    var name = $.request.parameters.get('name');
    
    var SQL = "UPDATE METRIC2.M2_USERS SET name =  '" + name + "', lname = '" + lname + "', email = '" + email + "' WHERE user_id = " + userid;
    sqlLib.executeUpdate(SQL);
    
    try {
        var password = $.request.parameters.get('password');
        if (password.length > 0){
            updateUserPassword(password);
        }
    } catch (err) {
        //do nothing
    }
    return "updated";
}

function hash(password, dt){
    return sqlLib.executeScalar("SELECT HASH_SHA256 (TO_BINARY('" + password + "'), to_BINARY('" + dt + "')) from DUMMY");
}

function createUser(){
    var email = $.request.parameters.get('email');
    var lname = $.request.parameters.get('lname');
    var company = $.request.parameters.get('company');
    var name = $.request.parameters.get('name');
    var password = $.request.parameters.get('password');
    var recCount = 0;
    var tmpUserID = sqlLib.executeScalar("SELECT user_id FROM metric2.m2_users WHERE email = '" + email + "'");
    
    //check if user already exists
    if (tmpUserID === ''){
        //need to hash + salt the password before storing, also store the salt
        var dt = sqlLib.executeScalar("SELECT CURRENT_TIMESTAMP from DUMMY");
        password = hash(password, dt);
        var SQL = "INSERT INTO METRIC2.M2_USERS (user_ID, name, lname, email_domain, email, password, acct_type, dt_added) VALUES (metric2.user_id.NEXTVAL, '" + name + "', '" + lname + "', '" + company + "', '" + email + "', '" + password + "', '0', '" + dt + "')";
        var msg = sqlLib.executeUpdate(SQL);
        recCount = 1;
    } else {
        recCount = -1;
    }
    
    return recCount;
}

// --------------------------------------- Security ----------------------------------------------------- //