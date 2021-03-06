$.import("lilabs.metric2.lib", "sql");
var sqlLib = $.lilabs.metric2.lib.sql;
var strDashboardUser = "lilabs.metric2.lib::metricuser";
var sql = $.request.parameters.get('SQL');
var step = $.request.parameters.get('SQL');

var output = ''; 

function executeUpdate(strSQL) {
    try {
        var conn = $.db.getConnection();
        var pstmt = conn.prepareStatement(strSQL);
        var updateResp = pstmt.executeUpdate();
        var strReturn = "";
        conn.commit();
        strReturn = "<span class='done'>[Done]</span>   " + strSQL;
        return strReturn;
    } catch (err) {
        return "<span class='failed'>[Error]</span>   " + strSQL + "         " + err.message;
    }
}

if (step === 'step3') {
    output += "<br /><br /> ===================    Create Schema ===================== <br />";
    output += "<br />" + executeUpdate('DROP SCHEMA METRIC2 CASCADE');
    output += "<br />" + executeUpdate('CREATE SCHEMA METRIC2');

    // Replace SYSTEM with your user for the Dashboards
    output += "<br />" + executeUpdate('DROP USER M2_SVC_ACCOUNT');
    output += "<br />" + executeUpdate('CREATE USER M2_SVC_ACCOUNT PASSWORD 7Ag6w612auiY881');
    // NB, after the user is created, you may need to log in using the user account to set the password for the first time

    output += "<br />" + executeUpdate('DROP ROLE M2_SERVICE');
    output += "<br />" + executeUpdate('CREATE ROLE M2_SERVICE');
    output += "<br />" + executeUpdate('GRANT INSERT, SELECT, UPDATE, DELETE, DROP, CREATE ANY, ALTER, EXECUTE ON SCHEMA metric2 TO M2_SERVICE');
    output += "<br />" + executeUpdate('GRANT MONITORING TO M2_SERVICE WITH ADMIN OPTION');
    output += "<br />" + executeUpdate('GRANT M2_SERVICE TO M2_SVC_ACCOUNT WITH ADMIN OPTION');
    output += "<br />" + executeUpdate('GRANT AFL__SYS_AFL_AFLPAL_EXECUTE TO M2_SERVICE');
    output += "<br />" + executeUpdate('GRANT EXECUTE ON SYSTEM.AFL_WRAPPER_ERASER to M2_SERVICE');
    output += "<br />" + executeUpdate('GRANT EXECUTE ON SYSTEM.AFL_WRAPPER_GENERATOR to M2_SERVICE');
    output += "<br />" + executeUpdate('GRANT EXECUTE ON _SYS_AFL.PAL_TS_S to M2_SERVICE');

    output += "<br />" + executeUpdate('UPDATE "_SYS_XS" ."SQL_CONNECTIONS" SET username = \'M2_SVC_ACCOUNT\' WHERE name = \'lilabs.metric2.lib::metricuser\'');
    output += "<br /><br /> Completed";
    
    
} else if (step === 'step4') {
    
    output += "<br /><br /> ===================    Create Database Objects ===================== <br />";
    //Sequences
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."ALERT_HISTORY_ID" START WITH 1');
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."ALERT_ID" START WITH 1');
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."CONNECTION_ID" START WITH 1');
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."DASHBOARD_ID" START WITH 1');
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."DASHBOARD_WIDGET_ID" START WITH 1');
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."DASHBOARD_WIDGET_PARAM_ID" START WITH 1');
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."DWP_HISTORY_ID" START WITH 1');

    // Sequences with default data
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."OPTION_ID" START WITH 200');
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."WIDGET_ID" START WITH 200');
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."WIDGET_PARAM_ID" START WITH 300');
    output += "<br />" + executeUpdate('CREATE SEQUENCE "METRIC2"."USER_ID" START WITH 2');
    
    // Tables
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_ALERT"  ( "ALERT_ID" INT CS_INT NOT NULL, "DASHBOARD_WIDGET_ID" INT CS_INT, "COND" VARCHAR(40) CS_STRING, "OPERATOR" VARCHAR(40) CS_STRING, "VALUE" REAL CS_FLOAT, "NOTIFY" VARCHAR(200) CS_STRING, "USER_ID" INT CS_INT, "STATUS" INT CS_INT DEFAULT 1, "LAST_EXECUTED" LONGDATE CS_LONGDATE DEFAULT CURRENT_TIMESTAMP, "CREATED_ON" LONGDATE CS_LONGDATE DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ( "ALERT_ID" ) ) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_ALERT_HISTORY"  ( "ALERT_HIST_ID" INT CS_INT NOT NULL, "ALERT_ID" INT CS_INT, "DASHBOARD_WIDGET_ID" INT CS_INT, "COND" VARCHAR(40) CS_STRING, "OPERATOR" VARCHAR(40) CS_STRING, "VALUE" REAL CS_FLOAT, "NOTIFY" VARCHAR(200) CS_STRING, "ACTUAL" REAL CS_FLOAT, "ADDED" LONGDATE CS_LONGDATE DEFAULT CURRENT_TIMESTAMP, "ADDED_BY" VARCHAR(50) CS_STRING, PRIMARY KEY ( "ALERT_HIST_ID" ) ) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_DASHBOARD"  ( "DASHBOARD_ID" INT CS_INT NOT NULL, "TITLE" VARCHAR(100) CS_STRING, "SUBTITLE" VARCHAR(100) CS_STRING, "DT_ADDED" LONGDATE CS_LONGDATE, "USER_ID" INT CS_INT, "REFRESH_RATE" INT CS_INT, "WIDTH" INT CS_INT, "HEIGHT" INT CS_INT, "BG_COLOR" VARCHAR(10) CS_STRING, "TV_MODE" INT CS_INT, "VIEWORDER" INT CS_INT, "SHARE_URL" VARCHAR(40) CS_STRING, "BG_URL" VARCHAR(250) CS_STRING, "TIME_ZONE" VARCHAR(50) CS_STRING, PRIMARY KEY ( "DASHBOARD_ID" ) ) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_DASHBOARD_WIDGET"  ( "DASHBOARD_WIDGET_ID" INT CS_INT NOT NULL, "DASHBOARD_ID" INT CS_INT, "WIDGET_ID" INT CS_INT, "TITLE" VARCHAR(100) CS_STRING, "WIDTH" INT CS_INT, "HEIGHT" INT CS_INT, "ROW_POS" INT CS_INT, "COL_POS" INT CS_INT, "REFRESH_RATE" INT CS_INT DEFAULT 0, "SHARE_URL" VARCHAR(600) CS_STRING, PRIMARY KEY ( "DASHBOARD_WIDGET_ID" ) )');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS"  ( "DASHBOARD_WIDGET_PARAM_ID" INT CS_INT NOT NULL, "DASHBOARD_WIDGET_ID" INT CS_INT, "PARAM_ID" INT CS_INT, "VALUE" VARCHAR(1000) CS_STRING, "WIDGET_ID" INT CS_INT, "DT_ADDED" LONGDATE CS_LONGDATE, PRIMARY KEY ( "DASHBOARD_WIDGET_PARAM_ID" ) ) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_DWP_HISTORY"  ( "DWP_HIST_ID" INT CS_INT NOT NULL, "DASHBOARD_WIDGET_PARAM_ID" INT CS_INT NOT NULL, "DT_ADDED" LONGDATE CS_LONGDATE DEFAULT CURRENT_TIMESTAMP, "VALUE" VARCHAR(100) CS_STRING, PRIMARY KEY ( "DWP_HIST_ID" ) ) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_PAL_TS_FIXEDVALS"  ( "ID" INT CS_INT ) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_USER_CONNECTIONS"  ("API_NAME" VARCHAR(100) CS_STRING, "USER_ID" INT CS_INT, "CLIENT_ID" VARCHAR(400) CS_STRING, "CLIENT_SECRET" VARCHAR(400) CS_STRING, "REFRESH_TOKEN" VARCHAR(400) CS_STRING, "ACCESS_TOKEN" VARCHAR(400) CS_STRING, "TOKEN_EXPIRES" LONGDATE CS_LONGDATE ) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_USERS"  ( "USER_ID" INT CS_INT NOT NULL, "NAME" VARCHAR(100) CS_STRING, "LNAME" VARCHAR(100) CS_STRING, "ACCT_TYPE" INT CS_INT, "EMAIL" VARCHAR(100) CS_STRING NOT NULL, "PASSWORD" VARCHAR(100) CS_STRING, "EMAIL_DOMAIN" VARCHAR(100) CS_STRING, "DT_ADDED" LONGDATE CS_LONGDATE, "USER_TOKEN" VARCHAR(100) CS_STRING, "USER_THEME" VARCHAR(10) CS_STRING, PRIMARY KEY ( "USER_ID", "EMAIL" ) ) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_WIDGET"  ( "WIDGET_ID" INT CS_INT, "NAME" VARCHAR(100) CS_STRING, "ICON_URL" VARCHAR(200) CS_STRING, "TYPE" VARCHAR(40) CS_STRING, "CODE" VARCHAR(100) CS_STRING, "CODE_TYPE" VARCHAR(100) CS_STRING, "DESCRIPTION" VARCHAR(200) CS_STRING, "WIDGET_GROUP" INT CS_INT, "HIST_ENABLED" INT CS_INT DEFAULT 0, "DEF_HEIGHT" INT CS_INT, "DEF_WIDTH" INT CS_INT) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_WIDGET_PARAM"  ( "PARAM_ID" INT CS_INT, "WIDGET_ID" INT CS_INT, "NAME" VARCHAR(100) CS_STRING, "TYPE" VARCHAR(100) CS_STRING, "VALUE_DEFAULT" VARCHAR(1000) CS_STRING, "INDEX_NO" INT CS_INT, "REQUIRED" INT CS_INT, "PLACEHOLDER" VARCHAR(100) CS_STRING, "DISPLAY_NAME" VARCHAR(100) CS_STRING, "VISIBLE" VARCHAR(10) CS_STRING, "OPTION_GROUP" INT CS_INT, "HIST_ENABLED" INT CS_INT DEFAULT 0, "HIST_DATAPOINT" VARCHAR(10) CS_STRING) ');
    output += "<br />" + executeUpdate('CREATE TABLE "METRIC2"."M2_WIDGET_PARAM_OPTIONS"  ( "OPTION_ID" INT CS_INT NOT NULL, "VALUE" VARCHAR(200) CS_STRING, "DISPLAY_VALUE" VARCHAR(200) CS_STRING, "OPTION_GROUP" INT CS_INT, PRIMARY KEY ( "OPTION_ID" ) ) ');

    // Col Tables
    output += "<br />" + executeUpdate('CREATE COLUMN TABLE "METRIC2"."M2_PAL_TS_PARAMS" ("NAME" VARCHAR(60), "INTARGS" INTEGER CS_INT, "DOUBLEARGS" DOUBLE CS_DOUBLE, "STRINGARGS" VARCHAR(100)) UNLOAD PRIORITY 0  AUTO MERGE ');
    output += "<br />" + executeUpdate('CREATE COLUMN TABLE "METRIC2"."M2_PAL_TS_RESULTS" ("ID" INTEGER CS_INT, "VALUE" DOUBLE CS_DOUBLE) UNLOAD PRIORITY 0  AUTO MERGE ');
    

    // Views
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."V_TS_DATA" ( "ID", "VALUE" ) AS SELECT TO_INT(TO_CHAR(DT_ADDED, \'HH24\')) ID, AVG(TO_REAL(a.VALUE)) VALUE FROM METRIC2.M2_DWP_HISTORY a WHERE DASHBOARD_WIDGET_PARAM_ID = 771 GROUP BY TO_INT(TO_CHAR(DT_ADDED, \'HH24\')), DASHBOARD_WIDGET_PARAM_ID ORDER BY TO_INT(TO_CHAR(DT_ADDED, \'HH24\')) ASC WITH READ ONLY ');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_V_PAL_TS_DATA" ( "ID", "VALUE" ) AS SELECT TO_INT(TO_CHAR(DT_ADDED, \'HH24\')) ID, AVG(TO_REAL(a.VALUE)) VALUE FROM METRIC2.M2_DWP_HISTORY a WHERE DASHBOARD_WIDGET_PARAM_ID = 1102 GROUP BY TO_INT(TO_CHAR(DT_ADDED, \'HH24\')), DASHBOARD_WIDGET_PARAM_ID ORDER BY TO_INT(TO_CHAR(DT_ADDED, \'HH24\')) ASC WITH READ ONLY ');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_V_PAL_RESULTS" ( "ID", "VALUE" ) AS SELECT CASE WHEN a.ID IS NOT NULL THEN a.ID ELSE b.ID END AS ID, CASE WHEN ROUND(a.VALUE,2) IS NOT NULL THEN ROUND(a.VALUE,2) ELSE ROUND(b.VALUE, 2) END VALUE FROM METRIC2.M2_V_PAL_TS_DATA a FULL JOIN METRIC2.M2_PAL_TS_RESULTS b ON (a.ID=b.ID) ORDER BY ID ASC WITH READ ONLY ');
    
    
    // Metric Data Views
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_CONNLIST" ( "Connection ID", "Host", "Port", "Client IP", "Schema", "Status" ) AS SELECT connection_id as "Connection ID", host as "Host", port as "Port", client_ip as "Client IP", current_schema_name as "Schema", connection_status as "Status" FROM (SELECT C.*, P.STATEMENT_STRING FROM SYS.M_CONNECTIONS C LEFT OUTER JOIN SYS.M_PREPARED_STATEMENTS P ON C.CURRENT_STATEMENT_ID = P.STATEMENT_ID WHERE C.CONNECTION_ID > 0 AND C.CONNECTION_STATUS = \'RUNNING\') TMP WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_ROWCOLSIZES" ( "cols", "rows" ) AS SELECT C AS "cols", R AS "rows" FROM ( SELECT ROUND(SUM(TABLE_SIZE)/1024/1024/1024,2) AS "C" 	FROM SYS.M_TABLES WHERE IS_COLUMN_TABLE = \'TRUE\'),( SELECT ROUND(SUM(TABLE_SIZE)/1024/1024/1024,2) AS "R" FROM SYS.M_TABLES WHERE IS_COLUMN_TABLE = \'FALSE\') WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_ALLSTARTED" ( "STATUS" ) AS SELECT STATUS from SYS.M_SYSTEM_OVERVIEW WHERE name = \'All Started\' AND section = \'Services\' WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_ALLSTARTED_VALUE" ( "VALUE" ) AS SELECT VALUE from SYS.M_SYSTEM_OVERVIEW WHERE name = \'All Started\' AND section = \'Services\' WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_BLOCKEDTRANS" ( "VALUE" ) AS SELECT COUNT(HOST) AS VALUE FROM SYS.M_BLOCKED_TRANSACTIONS WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_BLOCKEDTRANSLIST" ( "HOST", "SCHEMA", "OBJECT", "TYPE", "MODE" ) AS SELECT HOST, WAITING_SCHEMA_NAME AS SCHEMA, WAITING_OBJECT_NAME AS OBJECT, LOCK_TYPE AS TYPE, LOCK_MODE AS MODE FROM SYS.M_BLOCKED_TRANSACTIONS WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_CONNECTIONS" ( "STATUS" ) AS SELECT COUNT(CONNECTION_ID) as STATUS FROM SYS.M_CONNECTIONS GROUP BY connection_status ORDER BY connection_status WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_DATADISK" ( "DISK_SIZE", "DATA_SIZE", "USED_SIZE" ) AS select ROUND(d.total_size/1024/1024/1024,2) disk_size, ROUND(sum(v2.data_size)/1024/1024/1024,2) data_size, ROUND(d.used_size/1024/1024/1024,2) used_size from ( ( m_volumes as v1 join M_VOLUME_SIZES as v2 on v1.volume_id = v2.volume_id ) right outer join m_disks as d on d.disk_id = v2.disk_id ) where d.usage_type = \'DATA\' group by v1.host, d.usage_type, d.total_size,d.device_id, d.path, d.used_size order by d.device_id,v1.host WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_DB_CPU" ( "CPU" ) AS SELECT ABS(SUM(PROCESS_CPU)) as CPU from SYS.M_SERVICE_STATISTICS WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_DBMEM" ( "ALLOCATION_LIMIT", "TOTAL_MEMORY_USED_SIZE", "PEAK" ) AS select ROUND(m1.ALLOCATION_LIMIT/1024/1024/1024,2) as ALLOCATION_LIMIT, ROUND(m1.INSTANCE_TOTAL_MEMORY_USED_SIZE/1024/1024/1024) as TOTAL_MEMORY_USED_SIZE, ROUND((b1.PEAK+m1.INSTANCE_CODE_SIZE+ m1.INSTANCE_SHARED_MEMORY_ALLOCATED_SIZE)/1024/1024/1024,2)  as PEAK from SYS.M_HOST_RESOURCE_UTILIZATION m1  join (select a2.HOST as HOST, sum(ifnull (a1.INCLUSIVE_PEAK_ALLOCATION_SIZE,	 a2.HEAP_MEMORY_USED_SIZE)) as PEAK from SYS.M_SERVICE_MEMORY a2  left outer join (select HOST, PORT, INCLUSIVE_PEAK_ALLOCATION_SIZE from SYS.M_HEAP_MEMORY_RESET  where DEPTH = 0 ) as a1 on a2.HOST = a1.HOST and a2.PORT = a1.PORT group by a2.HOST) as b1 on m1.HOST = b1.HOST WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_DISTRIBUTED_VALUE" ( "VALUE" ) AS SELECT VALUE from SYS.M_SYSTEM_OVERVIEW WHERE name = \'Distributed\' AND section = \'System\' WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_FREEPHYSMEM" ( "RND" ) AS select round((USED_PHYSICAL_MEMORY + FREE_PHYSICAL_MEMORY) /1024/1024/1024, 2) AS RND from PUBLIC.M_HOST_RESOURCE_UTILIZATION WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_INSTANCEID" ( "VALUE" ) AS SELECT value from SYS.M_SYSTEM_OVERVIEW WHERE name = \'Instance ID\' AND section = \'System\' WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_INSTANCENUMBER" ( "VALUE" ) AS SELECT VALUE from SYS.M_SYSTEM_OVERVIEW WHERE name = \'Instance Number\' AND section = \'System\' WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_INVALID_CONS" ( "CNT" ) AS SELECT COUNT(USER_NAME) AS CNT FROM INVALID_CONNECT_ATTEMPTS WHERE SUCCESSFUL_CONNECT_TIME > ADD_SECONDS (CURRENT_UTCTIMESTAMP, -43200) WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_LOGDISK" ( "DISK_SIZE", "DATA_SIZE", "USED_SIZE" ) AS select ROUND(d.total_size/1024/1024/1024,2) disk_size, ROUND(sum(v2.data_size)/1024/1024/1024,2) data_size, ROUND(d.used_size/1024/1024/1024,2) used_size from ( ( m_volumes as v1 join M_VOLUME_SIZES as v2 on v1.volume_id = v2.volume_id ) right outer join m_disks as d on d.disk_id = v2.disk_id ) where d.usage_type = \'LOG\' group by v1.host, d.usage_type, d.total_size,d.device_id, d.path, d.used_size order by d.device_id,v1.host WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_PHYSICALMEM" ( "PHYSICAL_MEMORY" ) AS select ROUND(T2.PHYSICAL_MEMORY_SIZE/1024/1024/1024,2) as PHYSICAL_MEMORY from M_HOST_RESOURCE_UTILIZATION as T1 join (select M_SERVICE_MEMORY.HOST, sum(M_SERVICE_MEMORY.PHYSICAL_MEMORY_SIZE) as PHYSICAL_MEMORY_SIZE,sum(M_SERVICE_MEMORY.SHARED_MEMORY_ALLOCATED_SIZE) as SHARED_MEMORY_ALLOCATED_SIZE from SYS.M_SERVICE_MEMORY group by M_SERVICE_MEMORY.HOST) as T2 on T2.HOST = T1.HOST WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_RESIDENTMEM" ( "FREE_PHYSICAL_MEMORY", "TOTAL_MEMORY", "PHYSICAL_MEMORY", "TOTAL_PHYSICAL_MEMORY" ) AS select ROUND(T1.FREE_PHYSICAL_MEMORY/1024/1024/1024,2) as FREE_PHYSICAL_MEMORY, ROUND((T1.USED_PHYSICAL_MEMORY+ T2.SHARED_MEMORY_ALLOCATED_SIZE)/1024/1024/1024,2) as TOTAL_MEMORY, ROUND(T2.PHYSICAL_MEMORY_SIZE/1024/1024/1024,2) as PHYSICAL_MEMORY, ROUND((T1.FREE_PHYSICAL_MEMORY+T1.USED_PHYSICAL_MEMORY)/1024/1024/1024,2) as TOTAL_PHYSICAL_MEMORY from M_HOST_RESOURCE_UTILIZATION as T1 join (select M_SERVICE_MEMORY.HOST, sum(M_SERVICE_MEMORY.PHYSICAL_MEMORY_SIZE) as PHYSICAL_MEMORY_SIZE,sum(M_SERVICE_MEMORY.SHARED_MEMORY_ALLOCATED_SIZE) as SHARED_MEMORY_ALLOCATED_SIZE from SYS.M_SERVICE_MEMORY group by M_SERVICE_MEMORY.HOST) as T2 on T2.HOST = T1.HOST WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_RUNNINGCONNETIONS" ( "CNT" ) AS SELECT count(C.CONNECTION_STATUS) AS CNT FROM SYS.M_CONNECTIONS C WHERE C.CONNECTION_STATUS = \'RUNNING\' WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_SYS_MEM" ( "SM" ) AS SELECT round(sum(VALUE/1024/1024/1024),1) as SM FROM SYS.M_MEMORY WHERE NAME = \'SYSTEM_MEMORY_SIZE\' WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_SYSALERTS" ( "ALERT_DETAILS", "ALERT_RATING", "ALERT_TIMESTAMP", "HOST", "ALERT_ID", "ALERT_NAME", "ALERT_DESCRIPTION", "ALERT_USERACTION" ) AS SELECT ALERT_DETAILS, ALERT_RATING, ALERT_TIMESTAMP, \'\', ALERT_ID, ALERT_NAME, ALERT_DESCRIPTION, ALERT_USERACTION FROM _SYS_STATISTICS.STATISTICS_CURRENT_ALERTS  WHERE (ALERT_RATING =2 OR ALERT_RATING =3 OR ALERT_RATING =4 OR ALERT_RATING =5) WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_SYSOVERVIEW" ( "STATUS" ) AS SELECT STATUS FROM SYS.M_SYSTEM_OVERVIEW WHERE NAME IN (\'CPU\',\'Data\', \'Log\', \'Trace\', \'Alerts\') WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_TOTAL_CPU" ( "SM" ) AS  select ROUND(ABS(SUM(TOTAL_CPU) / COUNT(TOTAL_CPU)), 0)  AS SM from sys.m_service_statistics WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_TRACEDISK" ( "DISK_SIZE", "DATA_SIZE", "USED_SIZE" ) AS select ROUND(d.total_size/1024/1024/1024,2) disk_size, ROUND(sum(t.file_size)/1024/1024/1024,2) data_size, ROUND(d.used_size/1024/1024/1024,2) used_size from ( m_tracefiles as t right outer join m_disks as d on d.host = t.host ) where d.usage_type like \'%TRACE%\' group by d.host, d.usage_type, d.total_size,d.device_id, d.path, d.used_size order by d.device_id,d.host WITH READ ONLY');
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_USERALERTS" ( "ALERT_ID", "OPERATOR", "V1", "ACTUAL", "ALERT_TIMESTAMP", "VALUE", "NOTIFY", "COND", "TITLE" ) AS SELECT metric2.m2_alert_history.alert_id, metric2.m2_alert_history.operator, metric2.m2_alert.value v1, metric2.m2_alert_history.actual, TO_CHAR(metric2.m2_alert_history.added, \'MM/DD/YY HH:MM:SS\'), metric2.m2_alert_history.value, metric2.m2_alert_history.notify, metric2.m2_alert.cond, metric2.m2_dashboard_widget.title FROM metric2.m2_alert INNER JOIN metric2.M2_DASHBOARD_WIDGET ON metric2.m2_alert.dashboard_widget_id = metric2.m2_dashboard_widget.dashboard_widget_id  INNER JOIN metric2.m2_alert_history ON  metric2.m2_alert_history.dashboard_widget_id = metric2.m2_alert.dashboard_widget_id  WHERE metric2.m2_alert_history.alert_hist_id IN (Select distinct metric2.m2_alert_history.alert_hist_id from metric2.m2_alert_history order by alert_hist_id desc LIMIT 5) WITH READ ONLY'); 
    output += "<br />" + executeUpdate('CREATE VIEW "METRIC2"."M2_WIDGET_HANAOVERVIEW" ( "CPU", "MEM", "RUNNING", "BLOCKED", "ACTIVE", "INVALID_CONS", "DATA_DISK_SIZE", "DATA_DATA_SIZE", "DATA_USED_SIZE", "LOG_DISK_SIZE", "LOG_DATA_SIZE", "LOG_USED_SIZE" ) AS SELECT CPU.SM AS CPU, MEM.SM AS MEM, CONS.CNT AS RUNNING, BLOCKED.VALUE AS BLOCKED,  ACTIVE.STATUS AS ACTIVE,	INVALID.CNT AS INVALID_CONS, DATA.DISK_SIZE AS DATA_DISK_SIZE,  DATA.DATA_SIZE AS DATA_DATA_SIZE, DATA.USED_SIZE AS DATA_USED_SIZE, LOG.DISK_SIZE AS LOG_DISK_SIZE, LOG.DATA_SIZE AS LOG_DATA_SIZE, LOG.USED_SIZE AS LOG_USED_SIZE FROM METRIC2.M2_WIDGET_TOTAL_CPU "CPU",METRIC2.M2_WIDGET_SYS_MEM "MEM", METRIC2.M2_WIDGET_INVALID_CONS "INVALID", METRIC2.M2_WIDGET_DATADISK "DATA", METRIC2.M2_WIDGET_RUNNINGCONNETIONS "CONS", METRIC2.M2_WIDGET_BLOCKEDTRANS "BLOCKED", METRIC2.M2_WIDGET_CONNECTIONS "ACTIVE", METRIC2.M2_WIDGET_LOGDISK "LOG" LIMIT 1 WITH READ ONLY');

    // Procedures
    output += "<br />" + executeUpdate('CREATE PROCEDURE METRIC2.M2_P_WIDGET_HISTORY(v_dwid INT, v_startdt VARCHAR(30), v_enddt VARCHAR(30)) LANGUAGE SQLSCRIPT AS BEGIN SELECT TO_CHAR(metric2.m2_dwp_history.dt_added, \'YYYY\') as year, TO_CHAR(metric2.m2_dwp_history.dt_added, \'MM\') as month, TO_CHAR(metric2.m2_dwp_history.dt_added, \'DD\') as day, TO_CHAR(metric2.m2_dwp_history.dt_added, \'HH24\') as hour, TO_CHAR(metric2.m2_dwp_history.dt_added, \'MI\') as min, \'00\' as secs, TO_DECIMAL(AVG(TO_INT(metric2.m2_dwp_history.value)),2,2) as value from metric2.m2_dwp_history INNER JOIN metric2.m2_dashboard_widget_params ON metric2.m2_dwp_history.dashboard_widget_param_id = metric2.m2_dashboard_widget_params.dashboard_widget_param_id INNER JOIN metric2.m2_widget_param ON metric2.m2_widget_param.param_id = metric2.m2_dashboard_widget_params.param_id WHERE  metric2.m2_dashboard_widget_params.dashboard_widget_id = :v_dwid AND (TO_DATE(TO_CHAR(metric2.m2_dwp_history.dt_added, \'MM/DD/YYYY\'),\'MM/DD/YYYY\') between TO_DATE(:v_startdt,\'MM/DD/YYYY\')  AND TO_DATE(:v_enddt,\'MM/DD/YYYY\')) GROUP BY TO_CHAR(metric2.m2_dwp_history.dt_added, \'YYYY\'), TO_CHAR(metric2.m2_dwp_history.dt_added, \'MM\'), TO_CHAR(metric2.m2_dwp_history.dt_added, \'DD\'), TO_CHAR(metric2.m2_dwp_history.dt_added, \'HH24\'), TO_CHAR(metric2.m2_dwp_history.dt_added, \'MI\') ORDER BY day desc, hour desc, min desc; END; ');
    output += "<br />" + executeUpdate('CREATE PROCEDURE METRIC2.M2_P_DELETE_DASHBOARD(dashboard_id INT) LANGUAGE SQLSCRIPT AS BEGIN DELETE FROM METRIC2.M2_DWP_HISTORY WHERE DASHBOARD_WIDGET_PARAM_ID in (SELECT DASHBOARD_WIDGET_PARAM_ID FROM METRIC2.M2_DASHBOARD_WIDGET_PARAMS INNER JOIN METRIC2.M2_DASHBOARD_WIDGET ON METRIC2.M2_DASHBOARD_WIDGET_PARAMS.DASHBOARD_WIDGET_ID = METRIC2.M2_DASHBOARD_WIDGET.DASHBOARD_WIDGET_ID WHERE DASHBOARD_ID = :dashboard_id); DELETE FROM METRIC2.M2_DASHBOARD_WIDGET_PARAMS WHERE DASHBOARD_WIDGET_ID in (SELECT DASHBOARD_WIDGET_ID FROM METRIC2.M2_DASHBOARD_WIDGET WHERE DASHBOARD_ID = :dashboard_id); DELETE FROM metric2.m2_dashboard_widget WHERE dashboard_widget_id in (SELECT DASHBOARD_WIDGET_ID FROM METRIC2.M2_DASHBOARD_WIDGET WHERE DASHBOARD_ID = :dashboard_id); DELETE FROM metric2.m2_alert WHERE dashboard_widget_id in (SELECT DASHBOARD_WIDGET_ID FROM METRIC2.M2_DASHBOARD_WIDGET WHERE DASHBOARD_ID = :dashboard_id); DELETE FROM metric2.m2_alert_history WHERE dashboard_widget_id in (SELECT DASHBOARD_WIDGET_ID FROM METRIC2.M2_DASHBOARD_WIDGET WHERE DASHBOARD_ID = :dashboard_id); DELETE FROM METRIC2.M2_DASHBOARD WHERE DASHBOARD_ID = :dashboard_id; END; ');
    output += "<br />" + executeUpdate('CREATE PROCEDURE METRIC2.M2_P_DELETE_WIDGET(widget_id INT) LANGUAGE SQLSCRIPT AS BEGIN DELETE FROM METRIC2.M2_DWP_HISTORY WHERE DASHBOARD_WIDGET_PARAM_ID in (SELECT DASHBOARD_WIDGET_PARAM_ID FROM METRIC2.M2_DASHBOARD_WIDGET_PARAMS WHERE DASHBOARD_WIDGET_ID = :widget_id); DELETE FROM METRIC2.M2_DASHBOARD_WIDGET_PARAMS WHERE DASHBOARD_WIDGET_ID = :widget_id; DELETE FROM metric2.m2_dashboard_widget WHERE dashboard_widget_id  = :widget_id; DELETE FROM metric2.m2_alert WHERE dashboard_widget_id = :widget_id; DELETE FROM metric2.m2_alert_history WHERE dashboard_widget_id  = :widget_id; END; ');
    output += "<br />" + executeUpdate('CREATE PROCEDURE METRIC2.M2_P_HISTGENERATOR(dwp_id INT, min_Val INT, max_val INT, start_hour INT, end_hour INT, add_days INT) LANGUAGE SQLSCRIPT AS CNTR INTEGER; BEGIN CNTR := :start_hour; WHILE CNTR <= :end_hour DO INSERT INTO "METRIC2"."M2_DWP_HISTORY" VALUES ("METRIC2"."DWP_HISTORY_ID".NEXTVAL, :dwp_id, ADD_DAYS(ADD_SECONDS(CURRENT_DATE, 60*(:CNTR*60)), :add_days), TO_INT(:min_val + (:max_val-:min_val)*RAND())); CNTR := CNTR + 1; END WHILE; END; ');
    output += "<br />" + executeUpdate('CREATE PROCEDURE METRIC2.M2_P_DELETE_WIDGET_HISTORY(widget_id INT) LANGUAGE SQLSCRIPT AS BEGIN DELETE FROM METRIC2.M2_DWP_HISTORY WHERE DASHBOARD_WIDGET_PARAM_ID in (SELECT DASHBOARD_WIDGET_PARAM_ID FROM METRIC2.M2_DASHBOARD_WIDGET_PARAMS WHERE DASHBOARD_WIDGET_ID = :widget_id); END; ');
    output += "<br />" + executeUpdate('CREATE PROCEDURE METRIC2.M2_P_CLONEMETRIC(v_dwid INT, v_did INT) LANGUAGE SQLSCRIPT AS BEGIN INSERT INTO METRIC2.M2_DASHBOARD_WIDGET SELECT METRIC2.DASHBOARD_WIDGET_ID.NEXTVAL, :v_did, WIDGET_ID, TITLE, WIDTH, HEIGHT, ROW_POS, COL_POS, REFRESH_RATE, \'\' FROM metric2.m2_dashboard_widget WHERE dashboard_widget_id  = :v_dwid;  INSERT INTO METRIC2.M2_DASHBOARD_WIDGET_PARAMS SELECT METRIC2.DASHBOARD_WIDGET_PARAM_ID.NEXTVAL, METRIC2.DASHBOARD_WIDGET_ID.CURRVAL, PARAM_ID, VALUE, WIDGET_ID, DT_ADDED FROM METRIC2.M2_DASHBOARD_WIDGET_PARAMS WHERE DASHBOARD_WIDGET_ID = :v_dwid; END; ');
    output += "<br />" + executeUpdate('CREATE PROCEDURE METRIC2.M2_P_CLONEDASHBOARD(v_did INT, v_userid INT) LANGUAGE SQLSCRIPT AS BEGIN  DECLARE v_dwid BIGINT; DECLARE v_vieworder INT; DECLARE v_newdid BIGINT DEFAULT 0; DECLARE CURSOR c_cursor1 FOR SELECT DASHBOARD_WIDGET_ID FROM METRIC2.M2_DASHBOARD_WIDGET WHERE DASHBOARD_ID = :v_did;     SELECT METRIC2.DASHBOARD_ID.NEXTVAL INTO v_newdid from dummy;     SELECT (MAX(VIEWORDER) + 1) INTO v_vieworder from METRIC2.M2_DASHBOARD WHERE USER_ID = :v_userid;     INSERT INTO METRIC2.M2_DASHBOARD SELECT :v_newdid, TITLE || \' Clone\', SUBTITLE, DT_ADDED, USER_ID, REFRESH_RATE, WIDTH, HEIGHT, BG_COLOR, TV_MODE, :v_vieworder, \'\', BG_URL, \'\' FROM metric2.m2_dashboard WHERE dashboard_id  = :v_did;     FOR cur_row as c_cursor1 DO CALL METRIC2.M2_P_CLONEMETRIC(cur_row.DASHBOARD_WIDGET_ID, :v_newdid); END FOR; END; ');
    
    // Create demo user
    output += "<br />" + executeUpdate('INSERT INTO METRIC2.M2_USERS (user_ID, name, lname, email_domain, email, password, acct_type, dt_added) VALUES (1, \'Demo\', \'User\', \'Lithium Labs\', \'demo@metric2.com\', \'5749A96C37BEEF97ED177C17D625385E343399D3A1CD232BA4D59A1E5C142CAD\', \'0\', \'0123-01-01 00:00:00.0\')');
    output += "<br />" + executeUpdate('INSERT INTO METRIC2.M2_USERS (user_ID, name, lname, email_domain, email, password, acct_type, dt_added) VALUES (2, \'View\', \'Only\', \'Lithium Labs\', \'view@metric2.com\', \'5749A96C37BEEF97ED177C17D625385E343399D3A1CD232BA4D59A1E5C142CAD\', \'1\', \'0123-01-01 00:00:00.0\')');

    // Create Connections
    output += "<br />" + executeUpdate('INSERT INTO METRIC2.M2_USER_CONNECTIONS (API_NAME) VALUES (\'GoogleAPI\')');
    output += "<br />" + executeUpdate('INSERT INTO METRIC2.M2_USER_CONNECTIONS (API_NAME) VALUES (\'GithubAPI\')');

    // Widgets by Type
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (1,\'Text and Footer\',\'1.png\',\'Static\',\'widgetTextAndFooter\',\'Client\',\'Display Plain Text\',2,0,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (2,\'List\',\'2.png\',\'Query\',\'widgetList\',\'Client\',\'A Table of List data\',2,0,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (3,\'Number and Text\',\'3.png\',\'Query\',\'widgetNumberAndText\',\'Client\',\'A Large number with text below it\',2,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (4,\'All Services Started\',\'4.png\',\'Query\',\'widgetAllServicesStarted\',\'Client\',\'Displays whether the HANA Services have been started or not\',1,0,1,1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (5,\'Icon and Text\',\'5.png\',\'Query\',\'widgetIcon\',\'Client\',\'Displays an Icon of your choice and a custom SQL data point followed by Text\',2,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (6,\'Number and Changed Value\',\'6.png\',\'Query\',\'widgetNumberChange\',\'Client\',\'Displays a large number value with amount changed since last update\',2,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (7,\'Instance Details\',\'7.png\',\'Query\',\'widgetInstanceDetails\',\'Client\',\'Displays the Instance ID and Number of the Connection\',1,0,1,1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (8,\'Current Connections\',\'8.png\',\'Query\',\'widgetNumberChange\',\'Client\',\'Displays the current connections to your Database\',1,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (9,\'DB CPU Usage History\',\'9.png\',\'Query\',\'widgetHistChart\',\'Client\',\'A history of CPU for the HANA Database Instance\',1,1,1,1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (10,\'Block Transactions\',\'10.png\',\'Query\',\'widgetNumberChange\',\'Client\',\'A count of currently blocked transactions\',1,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (11,\'Blocked Transaction List\',\'11.png\',\'Query\',\'widgetList\',\'Client\',\'A list of transactions currently being blocked\',1,0,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (12,\'Component Overview\',\'12.png\',\'Query\',\'widgetComponentOverview\',\'Client\',\'A summary of the status of each core system component\',1,0,1,3)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (13,\'Memory Used\',\'13.png\',\'Query\',\'widgetUsedMemoryPie\',\'Client\',\'A pie chart showing the used and available memory\',1,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (14,\'Resident Memory Usage History\',\'14.png\',\'Query\',\'widgetHistChart\',\'Client\',\'A line chart showing the memory usage history\',1,1,1,1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (15,\'Date and Time\',\'15.png\',\'Static\',\'widgetDateTime\',\'Client\',\'A Date and Time Widget\',2,0,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (16,\'Connection History\',\'16.png\',\'Query\',\'widgetHistChart\',\'Client\',\'A historical chart showing the recent connection count\',1,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (17,\'Weather\',\'17.png\',\'Service\',\'widgetWeather\',\'Client\',\'A weather display\',7,0,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (18,\'Disk Usage\',\'18.png\',\'Query\',\'widgetBullet\',\'Client\',\'A bullet chart showing data, trace and log disk usage, volume size and disk size\',1,0,2,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (21,\'System Overview\',\'21.png\',\'Query\',\'widgetSystemOverview\',\'Client\',\'A summary of important system metrics\',1,0,1,4)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (22,\'System Type\',\'22.png\',\'Query\',\'widgetIconDistributed\',\'Client\',\'A icon showing the system type\',1,0,1,1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (23,\'Recent Unsuccessful Connections\',\'23.png\',\'Query\',\'widgetRecentUnConnections\',\'Client\',\'A recent (12 hours) count of unsuccessful connection attempts\',1,1,1,1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (24,\'DB Memory Overview\',\'24.png\',\'Query\',\'widgetDBMemoryOverview\',\'Client\',\'A summary of Database Memory details\',1,0,1,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (25,\'Resident Memory Overview\',\'25.png\',\'Query\',\'widgetResMemoryOverview\',\'Client\',\'A summary of Resident Memory details\',1,0,1,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (26,\'Ping\',\'26.png\',\'Query\',\'widgetPing\',\'Client\',\'Ping a host IP Address\',7,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (27,\'System Connections\',\'27.png\',\'Query\',\'widgetFunnel\',\'Client\',\'Displays the 3 groups of connection types\',1,0,1,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (28,\'System Alert Ticker\',\'28.png\',\'Query\',\'widgetSystemAlerts\',\'Client\',\'Displays the system alerts in a ticker format\',1,0,1,3)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (29,\'Sensor (API)\',\'29.png\',\'WebService\',\'widgetSensorAPI\',\'Client\',\'Displays a physical temperature from a sensor\',6,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (30,\'Stock Price\',\'30.png\',\'Service\',\'widgetStockPrice\',\'Client\',\'Stock Price\',7,1,1,1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (31,\'Twitter\',\'31.png\',\'Service\',\'widgetTwitter\',\'Client\',\'Displays a twitter feed from a designated user\',7,0,3,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (32,\'User Alert Ticker\',\'32.png\',\'Query\',\'widgetUserAlerts\',\'Client\',\'Displays a list of recently executed user alerts\',1,0,1,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (33,\'Sensor (Poll)\',\'33.png\',\'Service\',\'widgetSensorPoll\',\'Client\',\'Displays a value from a Sensor using poll (HTTP GET)\',6,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (34,\'Number and History\',\'34.png\',\'Query\',\'widgetHistorySmall\',\'Client\',\'Displays a value, icon and small history chart below the number\',2,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (35,\'Row and Column Table Size\',\'35.png\',\'Query\',\'widgetTableSizes\',\'Client\',\'Displays the size of the row and columns in memory\',1,0,1,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (36,\'JSON Web Service\',\'36.png\',\'Service\',\'widgetJSONService\',\'Client\',\'Client side call to a web service, and displays the value\',7,0,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (37,\'JSON Web Service Table\',\'37.png\',\'Service\',\'widgetJSONServiceTable\',\'Client\',\'Client side call to a web service, and displays the response as a table\',7,0,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (38,\'Connection List\',\'38.png\',\'Query\',\'widgetTable\',\'Client\',\'Displays a list of running connections including IP, host, schema, and status\',1,0,1,3)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (39,\'Map\',\'39.png\',\'Query\',\'widgetDataMap\',\'Client\',\'Displays a map and queries your DB for a latitude, longditude, name and value\',2,0,2,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (40,\'Progress Bar\',\'40.png\',\'Query\',\'widgetProgressBar\',\'Client\',\'Displays a progress bar from a custom SQL Script (SQL should return a percent and a value)\',2,1,1,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (41,\'RSS Feed\',\'41.png\',\'Service\',\'widgetRSSFeed\',\'Client\',\'Displays posts from a specified RSS Feed\',7,0,null,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (42,\'Image Box\',\'42.png\',\'Static\',\'widgetImageBox\',\'Client\',\'Displays a Image using the supplied URL\',2,0,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (43,\'Gauge\',\'43.png\',\'Query\',\'metricGauge\',\'Client\',\'Displays a gauge with a numeric value\',2,1,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (44,\'Clock\',\'44.png\',\'Query\',\'metricClock\',\'Client\',\'Displays a clock\',2,0,2,2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (45,\'HANA Overview\',\'45.png\',\'Query\',\'metricHANAOverview\',\'Client\',\'Displays a HANA Instance overview\',1,0,4,6)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (46,\'Label\',\'46.png\',\'Label\',\'metricLabel\',\'Client\',\'Displays a dashboard label\',2,0,null,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (47,\'US State Map\', \'47.png\',\'Query\',\'metricDataByState\',\'Client\',\'Displays a map of the US by State.\', 2, 2, 2, 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (48,\'Donut Chart\', \'48.png\',\'Query\',\'metricDonut\',\'Client\',\'Displays a donut chart.\', 2, 0, null, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (49,\'Treemap\', \'49.png\',\'Query\',\'metricTreemap\',\'Client\',\'Displays a treemap chart.\', 2, 0, null, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (50,\'World Map\', \'50.png\',\'Query\',\'metricDataByCountry\',\'Client\',\'Displays a world map.\', 2, 0, 2, 4)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (51,\'Google+ API\', \'51.png\',\'Service\',\'metricGooglePlusProfile\',\'Client\',\'Displays data from your Google + account, Connections, circles and more.\', 8, 1, 1, 1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (52,\'Github API\', \'52.png\',\'Service\',\'metricGithubProfile\',\'Client\',\'Displays data from your Github account, followers, following and repositories.\', 8, 1, 1, 1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET" VALUES (53,\'Gateway List\',\'53.png\',\'Service\',\'widgetGatewayList\',\'Client\',\'A Table of List data from a Gateway Data Source\',4,0,null,null)');

    // Widget Params
    // widgetTextAndFooter
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (4,1,\'Large Text Value\',\'Static\',\'\',100,0,\'Any form of Static Text\',\'Main Text\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (5,1,\'Footer Text Value\',\'Static\',\'\',200,0,\'Any form of Static Text\',\'Footer Text\',\'true\',null,0, null)');

// widgetList 
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (17,2,\'SQL1\',\'SQL\',\'SELECT * FROM SYS.M_SYSTEM_OVERVIEW\',200,0,\'SQL Statement for the list of data to be returned\',\'SQL Query\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (16,2,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');


// widgetNumberAndText
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (19,3,\'SQL1\',\'SQL\',\'SELECT 7 as VALUE FROM DUMMY\',200,1,\'SQL Statement for the list of data to be returned\',\'SQL Query\',\'true\',null, 1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (20,3,\'TEXT1\',\'Static\',\'\',300,0,\'Any form of Static Text\',\'Text\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (18,3,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');


// widgetAllServicesStarted
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (7,4,\'SQL1\',\'SQL\',\'SELECT VALUE FROM METRIC2.M2_WIDGET_ALLSTARTED_VALUE\',200,1,\'SQL Statement for the value of the services\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (8,4,\'SQL2\',\'SQL\',\'SELECT STATUS FROM METRIC2.M2_WIDGET_ALLSTARTED\',300,1,\'SQL Statement for Status\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (6,4,\'Server Connection\',\'OPTION\',\'Local Server\',100,0,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

// widgetIcon
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (9,5,\'ICONURL\',\'URL\',\'\',100,1,\'Optional: The font awesome name of the Icon\',\'Icon Name\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (10,5,\'SQL1\',\'SQL\',\'SELECT 1 as VALUE FROM DUMMY\',200,1,\'SQL Statement for your data point\',\'SQL Query\',\'true\',null, 1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (11,5,\'TEXT1\',\'Static\',\'\',300,1,\'Any form of Static Text\',\'Text\',\'true\',null,0, null)');

// widgetNumberChange
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (13,6,\'SQL1\',\'SQL\',\'SELECT 283 as VALUE FROM DUMMY\',200,1,\'SQL Statement for your data point\',\'SQL Query\',\'true\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (31,6,\'DECPLACE\',\'Static\',\'0\',400,1,\'Datatype of changed value (decimal places)\',\'Decimal Places\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (14,6,\'UOM1\',\'OPTION\',\'Gb\',300,0,\'Optional, Unit of measure for the changed value\',\'Text\',\'true\',2,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (12,6,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

// widgetInstanceDetails
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (22,7,\'SQL1\',\'SQL\',\'SELECT VALUE FROM METRIC2.M2_WIDGET_INSTANCEID\',200,0,\'SQL Statement for the Instance ID to be returned\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (23,7,\'SQL2\',\'SQL\',\'SELECT VALUE FROM METRIC2.M2_WIDGET_INSTANCENUMBER\',300,0,\'SQL Statement for the Instance number to be returned\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (21,7,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

// widgetFunnel
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (27,8,\'SQL1\',\'SQL\',\'SELECT CNT AS VALUE FROM METRIC2.M2_WIDGET_RUNNINGCONNETIONS\',200,0,\'SQL Statement for the number of connections to be returned\',\'SQL Query\',\'false\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (30,8,\'DECPLACE\',\'Static\',\'0\',400,1,\'Datatype of changed value (decimal places)\',\'Decimal Places\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (26,8,\'UOM1\',\'Static\',\'Users\',300,0,\'Optional, Unit of measure for the changed value\',\'Text\',\'true\',2,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (24,8,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

    //widgetHistoryChart
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (33,9,\'SQL1\',\'RANGE\',\'SELECT CPU AS VALUE FROM METRIC2.M2_WIDGET_DB_CPU\',200,0,\'SQL Statement to fetch the current CPU value\',\'SQL Query\',\'false\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (157,9,\'UOM1\',\'Static\',\'%\',300,1,\'Required, Unit of measure\',\'Text\',\'false\',2,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (35,9,\'RECLIMIT\',\'Static\',\'20\',300,1,\'Integer: Number of records to fecth from history\',\'Record Limit\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (36,9,\'CHARTTYPE\',\'OPTION\',\'line\',400,1,\'Required: line or bar\',\'Chart Type\',\'true\',1,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (32,9,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

//widgetBlockedTransactions
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (38,10,\'SQL1\',\'SQL\',\'SELECT VALUE FROM METRIC2.M2_WIDGET_BLOCKEDTRANS\',200,0,\'SQL Statement to fetch the current count of blocked transactions\',\'SQL Query\',\'false\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (37,10,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

//widgetBlockedTransactionsList
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (41,11,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_BLOCKEDTRANSLIST\',200,0,\'SQL Statement to fetch the current count of blocked transactions\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (39,11,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');


    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (44,12,\'SQL1\',\'SQL\',\'SELECT STATUS FROM METRIC2.M2_WIDGET_SYSOVERVIEW\',200,0,\'SQL Statement to fetch the status of each sys component\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (43,12,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

//widgetUsedMemoryPie
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (54,13,\'SQL1\',\'SQL\',\'SELECT RND AS VALUE FROM METRIC2.M2_WIDGET_FREEPHYSMEM\',200,0,\'SQL Statement to retrieve physical memory\',\'SQL Query\',\'false\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (56,13,\'SQL2\',\'SQL\',\'SELECT PHYSICAL_MEMORY AS VALUE FROM METRIC2.M2_WIDGET_PHYSICALMEM\',300,0,\'SQL Statement to retrieve free physical memory\',\'SQL Query\',\'false\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (45,13,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');


    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (58,14,\'SQL1\',\'RANGE\',\'SELECT PHYSICAL_MEMORY AS VALUE FROM METRIC2.M2_WIDGET_PHYSICALMEM\',200,0,\'SQL Statement to retrieve physical memory\',\'SQL Query\',\'false\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (153,14,\'UOM1\',\'Static\',\'%\',300,1,\'Required, Unit of measure\',\'Text\',\'false\',2,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (59,14,\'RECLIMIT\',\'Static\',\'20\',300,1,\'Integer: Number of records to fecth from history\',\'Record Limit\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (60,14,\'CHARTTYPE\',\'OPTION\',\'line\',400,1,\'Required: line or bar\',\'Chart Type\',\'true\',1,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (57,14,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (152,15,\'TimeZone\',\'Static\',\'\',100,0,\'Time Zone of Clock\',\'Javascript TZ Code\',\'true\',null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (63,16,\'SQL1\',\'RANGE\',\'SELECT CNT AS VALUE FROM METRIC2.M2_WIDGET_RUNNINGCONNETIONS\',200,0,\'SQL Statement to retrieve current connections\',\'SQL Query\',\'false\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (154,16,\'UOM1\',\'Static\',\'\',300,1,\'Required, Unit of measure\',\'Text\',\'false\',2,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (64,16,\'RECLIMIT\',\'Static\',\'20\',300,1,\'Integer: Number of records to fecth from history\',\'Record Limit\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (65,16,\'CHARTTYPE\',\'OPTION\',\'line\',400,1,\'Required: line or bar\',\'Chart Type\',\'true\',1,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (62,16,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');


    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (70,17,\'ZIPCODE\',\'Static\',\' \',100,1,\'Required, ZIP Code for weather feed\',\'ZIP Code\',\'true\',null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (83,18,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_DATADISK\',200,0,\'SQL Query for DATA disk details\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (85,18,\'SQL2\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_LOGDISK\',300,0,\'SQL Query for LOG disk details\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (87,18,\'SQL3\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_TRACEDISK\',400,0,\'SQL Query for TRACE disk details\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (71,18,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (76,21,\'SQL1\',\'SQL\',\'SELECT SM FROM METRIC2.M2_WIDGET_TOTAL_CPU\',200,0,\'SQL Statement to retrieve CPU Usage\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (77,21,\'SQL2\',\'SQL\',\'SELECT SM FROM METRIC2.M2_WIDGET_SYS_MEM\',300,0,\'SQL Statement to retrieve physical memory\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (79,21,\'SQL3\',\'SQL\',\'SELECT VALUE FROM METRIC2.M2_WIDGET_ALLSTARTED_VALUE\',400,0,\'SQL Statement to check if all services are started\',\'SQL Query\',\'false\',null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (80,21,\'SQL4\',\'SQL\',\'SELECT VALUE FROM METRIC2.M2_WIDGET_DISTRIBUTED_VALUE\',500,0,\'SQL Statement to check if the system is distributed\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (75,21,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');


    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (82,22,\'SQL1\',\'SQL\',\'SELECT VALUE FROM METRIC2.M2_WIDGET_DISTRIBUTED_VALUE\',200,0,\'SQL Statement to check if the system is distributed\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (81,22,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (89,23,\'SQL1\',\'SQL\',\'SELECT CNT AS VALUE FROM METRIC2.M2_WIDGET_INVALID_CONS\',200,0,\'SQL Query for unsuccessful connection attempts\',\'SQL Query\',\'false\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (88,23,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');


    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (93,24,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_DBMEM\',200,0,\'SQL Query for memory details\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (91,24,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (95,25,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_RESIDENTMEM\',200,0,\'SQL Query for memory details\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (94,25,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (97,26,\'IP\',\'Static\',\'192.168.0.1\',100,1,\'IP or DNS Name of reachable server\',\'IP/DNS Name\',\'true\',null,1, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (102,27,\'SQL1\',\'SQL\',\'SELECT STATUS FROM METRIC2.M2_WIDGET_CONNECTIONS\',200,0,\'SQL Query for Connection counts\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (100,27,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (104,28,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_SYSALERTS\',200,0,\'SQL Query for current Alerts\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (103,28,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (118,29,\'VALUE\',\'HIST\',\'\',400,1,\'Value to be displayed\',\'\',\'false\',null,1, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (106,29,\'TEXT1\',\'Static\',\'Temperature\',200,0,\'Text: The text displayed below the returned temperature\',\'Display Text\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (109,29,\'UOM1\',\'OPTION\',\' \',300,0,\'Optional, Unit of measure for the sensor value\',\'UOM\',\'true\',2,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (122,30,\'TICKER\',\'Static\',\'\',100,1,\'Stock Ticker\',\'Ticker\',\'true\',null,1, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (112,31,\'HANDLE\',\'Static\',\' \',100,1,\'Required, a twitter handle for the user\',\'@Twitter\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (113,31,\'NUMTWEETS\',\'Static\',\'5\',200,1,\'The number of tweets to display\',\'Tweet Count\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (115,31,\'WIDID\',\'Static\',\'\',300,1,\'Required: Twitter widget ID (can be created here: https://twitter.com/settings/widgets)\',\'Widget ID\',\'true\',null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (118,32,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_USERALERTS\',200,0,\'SQL Query for current user Alerts\',\'SQL Query\',\'false\',null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (125,34,\'SQL1\',\'RANGE\',\'\',200,1,\'SQL Statement for the value to be displayed and stored\',\'SQL Query\',\'true\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (124,34,\'Server Connection\',\'OPTION\',\'Local Server\',100,0,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (126,34,\'RECLIMIT\',\'Static\',\'30\',300,1,\'Integer: Number of records to fecth from history\',\'Record Limit\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (128,34,\'ICONURL\',\'URL\',\'\',500,0,\'Optional: The font awesome name of the Icon\',\'Icon Name\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (130,34,\'LINECOL\',\'COLOR\',\'#CCCCCC\',600,0,\'HTML Color: Color of the sparkline\',\'Sparkline Color\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (131,34,\'UOM1\',\'OPTION\',\' \',250,0,\'Optional, Unit of measure for the value\',\'UOM\',\'true\',2,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (134,35,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_ROWCOLSIZES\',200,1,\'SQL Query for col and row sizes in mem\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (132,35,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (135,36,\'URL\',\'Static\',\'http://ip.jsontest.com/\',100,1,\'Url of reachable web service\',\'URL\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (137,36,\'OBJKEY\',\'Static\',\'ip\',200,1,\'The object key to display\',\'Object Key\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (138,36,\'TEXT1\',\'Static\',\'\',300,1,\'Text: The text displayed below the returned\',\'Text\',\'true\',null,0, null)');


    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (139,37,\'URL\',\'Static\',\'https://api.github.com/users/paschmann\',100,1,\'Url of reachable web service\',\'URL\',\'true\',null,0, null)');


    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (140,38,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (141,38,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_CONNLIST\',200,0,\'SQL Query for connection list\',\'SQL Query\',\'false\',null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (143,39,\'SQL1\',\'SQL\',\'SELECT MET236.12135MET2 as Lat, MET2-115.17021MET2 as Long, MET2Las VegasMET2 as Label, MET210MET2 as Value FROM DUMMY\',200,0,\'SQL Query for connection list\',\'SQL Query\',\'true\',null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (144,40,\'Server Connection\',\'Connection\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (145,40,\'SQL1\',\'SQL\',\'SELECT 92 as VALUE, MET2Sales IncreaseMET2 as Label FROM DUMMY\',200,1,\'SQL Query for connection list\',\'SQL Query\',\'true\',null,1, \'VALUE\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (146,40,\'ICONURL\',\'URL\',\'\',300,0,\'Optional: The font awesome name of the Icon\',\'Icon Name\',\'true\',null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (147,41,\'URL\',\'Static\',\'\',100,1,\'http://rss.cnn.com/rss/edition.rss\',\'Feed URL\',\'true\', null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (148,41,\'FEEDCOUNT\',\'Static\',\'\',200,1,\'4\',\'Feed Count\',\'true\', null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (149,42,\'URL\',\'Static\',\'http://scn.sap.com/resources/sbs_static/2406/developer-center-picture-5-transp.png\',100,1,\'Url of Image including HTTP\',\'URL\',\'true\',null,0, null)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (151,43,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (150,43,\'SQL1\',\'SQL\',\'SELECT 1 as min, 10 as max, 5 as value, MET2SpeedMET2 as Label, MET2Motor 1MET2 as Title FROM DUMMY\',500,0,\'SQL Statement for values, requires min, max, value, Label and Title\',\'SQL Query\',\'true\',null,0, \'VALUE\')');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (153,44,\'TimeZone\',\'Static\',\'\',100,0,\'Time Zone of Clock\',\'Javascript TZ Code\',\'false\',null,0, null)');

// HANA Overview
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (170,45,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.M2_WIDGET_HANAOVERVIEW\',200,0,\'SQL Query for details\',\'SQL Query\',\'false\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (171,45,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');

// Label Widget
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (172,46,\'TEXT1\',\'Static\',\'\',100,1,\'Any form of Static Text\',\'Text\',\'true\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (173,46,\'FONTSIZE\',\'Static\',\'\',200,1,\'Font size in px\',\'Font Size\',\'true\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (174,46,\'FONTCOLOR\',\'COLOR\',\'\',300,1,\'Font color in Hex (e.g #333333)\',\'Font Color\',\'true\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (175,46,\'FONTALIGN\',\'OPTION\',\'\',400,1,\'Font alignment (e.g left, center, right)\',\'Font Alignment\',\'true\',4,0,null)');

// US State Map Widget
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (177,47,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (176,47,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.TMP_STATE_SALES\',200,0,\'SQL Query for details\',\'SQL Query\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (178,47,\'TEXT1\',\'Static\',\'\',300,1,\'Any form of Static Text\',\'Text\',\'true\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (179,47,\'UOM1\',\'OPTION\',\' \',400,0,\'Optional, Unit of measure for the value\',\'UOM\',\'true\',2,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (192,47,\'HEXCOLOR1\',\'COLOR\',\'#DEEDF6\',500,0,\'Required, color in Hex (e.g #DEEDF6)\',\'Min Color\',\'true\',2,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (193,47,\'HEXCOLOR2\',\'COLOR\',\'#2A89C1\',500,0,\'Required, color in Hex (e.g #2A89C1)\',\'Max Color\',\'true\',2,0, null)');


// Donut Chart
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (180,48,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (181,48,\'SQL1\',\'SQL\',\'SELECT STATE_NAME as LABEL, SUM(VALUE) as VALUE FROM METRIC2.TMP_STATE_SALES GROUP BY STATE_NAME ORDER BY SUM(VALUE) DESC LIMIT 5\',200,0,\'SQL Query for details\',\'SQL Query\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (182,48,\'UOM1\',\'OPTION\',\' \',400,0,\'Optional, Unit of measure for the value\',\'UOM\',\'true\',2,0, null)');

// Treemap
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (183,49,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (184,49,\'SQL1\',\'SQL\',\'SELECT STATE_NAME as LABEL, SUM(VALUE) as VALUE FROM METRIC2.TMP_STATE_SALES GROUP BY STATE_NAME ORDER BY SUM(VALUE) DESC\',200,0,\'SQL Query for details\',\'SQL Query\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (185,49,\'GROUP\',\'Static\',\'\',300,0,\'Optional, Column name group for Treemap categories, should be returned by SQL\',\'Grouping Column\',\'true\',2,0, null)');

// 50. World Map
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (186,50,\'Server Connection\',\'OPTION\',\'Local Server\',100,1,\'Local Server\',\'Server Connection\',\'true\',3,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (187,50,\'SQL1\',\'SQL\',\'SELECT * FROM METRIC2.TMP_COUNTRY_SALES\',200,0,\'SQL Query for details\',\'SQL Query\',\'true\',null,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (188,50,\'TEXT1\',\'Static\',\'\',300,1,\'Any form of Static Text\',\'Text\',\'true\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (189,50,\'UOM1\',\'OPTION\',\' \',400,0,\'Optional, Unit of measure for the value\',\'UOM\',\'true\',2,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (190,50,\'HEXCOLOR1\',\'COLOR\',\'#DEEDF6\',500,0,\'Required, color in Hex (e.g #DEEDF6)\',\'Min Color\',\'true\',2,0, null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (191,50,\'HEXCOLOR2\',\'COLOR\',\'#2A89C1\',500,0,\'Required, color in Hex (e.g #2A89C1)\',\'Max Color\',\'true\',2,0, null)');

// 51. Google API
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (194,51,\'TEXT1\',\'Static\',\'\',300,1,\'Any form of Static Text\',\'Text\',\'true\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (195,51,\'GoogleAPI\',\'OAUTH\',\'OAUTH\',100,0,\'\',\'Google API Access\',\'false\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (196,51,\'URL\',\'OPTION\',\' \',300,0,\'Required, Backend API Call to make\',\'Google API\',\'true\',5,0, null)');

// 52. Github
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (197,52,\'GithubAPI\',\'OAUTH\',\'OAUTH\',100,0,\'\',\'Github API Access\',\'false\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (198,52,\'URL\',\'OPTION\',\' \',300,0,\'Required, Backend API Call to make\',\'Github API\',\'true\',6,0, null)');

// 53. Gateway List
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (199,53,\'USERNAME\',\'Static\',\'\',100,1,\'Required, Gateway Username\',\'Gateway Username\',\'true\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (200,53,\'PASSWORD\',\'Static\',\'\',200,1,\'Required, Gateway Password\',\'Gateway Password\',\'true\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (201,53,\'SERVER\',\'Static\',\'\',300,1,\'Required, Gateway Server URL\',\'Gateway Server URL\',\'true\',null,0,null)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM" VALUES (202,53,\'SERVICE\',\'OPTION\',\' \',400,0,\'Required, Gateway Service\',\'Gateway Data Source\',\'true\',7,0, null)');


    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (1,\'line\',\'Line\',1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (2,\'bar\',\'Bar\',1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (3,\'°F\',\'°F\',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (4,\'°C\',\'°C\',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (5,\'ms\',\'ms\',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (6,\'s\',\'s\',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (7,\'sec\',\'sec\',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (8,\'min\',\'min\',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (9,\'hr\',\'hr\',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (10,\'ft\',\'ft\',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (11,\'m\',\'m\',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (12,\'localserver\',\'Local Server\',3)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (13,\' \',\' \',2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (14, \'$\', \'$\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (15, \'$M\', \'$M\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (16, \'Gal/Day\', \'Gal/Day\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (17, \'l/Day\', \'l/Day\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (18, \'t/Day\', \'t/Day\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (19, \'t/s\', \'t/s\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (20, \'kg/s\', \'kg/s\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (21, \'lbs/s\', \'lbs/s\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (22, \'mph\', \'mph\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (23, \'km\', \'km\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (24, \'ft/s\', \'ft/s\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (25, \'m/s\', \'m/s\', 2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (26, \'left\', \'left\', 4)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (27, \'center\', \'center\', 4)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (28, \'right\', \'right\', 4)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (29, \'https://www.googleapis.com/plus/v1/people/me circledByCount\', \'My Profile: Circled By Count\', 5)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (30, \'https://www.googleapis.com/plus/v1/people/me/people/collection?collection=connected totalItems\', \'My Profile: Connection Count\', 5)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (33, \'https://www.googleapis.com/plus/v1/people/me/circles circledByCount\', \'My Profile: Circled By Count\', 5)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (31, \'https://api.github.com/users/followers followers\', \'My Profile: Followers\', 6)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (32, \'https://api.github.com/users/followers public_repos\', \'My Profile: Public Repo Count\', 6)');

    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_WIDGET_PARAM_OPTIONS" VALUES (34, \'/sap/public/ping\', \'Gateway Ping\', 7)');


    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (1)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (2)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (3)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (4)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (5)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (6)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (7)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (8)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (9)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (10)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (11)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (11)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (12)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (13)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (14)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (15)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (16)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (17)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (18)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (19)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (20)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (21)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (22)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_PAL_TS_FIXEDVALS" VALUES (23)');

    output += "<br /><br />Completed";
    
    
} else if (step === "step5") {
    output += "<br /><br /> ===================    Create Demo Dashboards ===================== <br />";
    
    //Sales Table
    output += "<br />" + executeUpdate('CREATE COLUMN TABLE "METRIC2"."TMP_COUNTRY_SALES" ("COUNTRY" VARCHAR(60), "VALUE" REAL CS_FLOAT, "COUNTRY_NAME" NVARCHAR(50) DEFAULT \'NVARCHAR\', "MONTH" INTEGER CS_INT, "YEAR" INTEGER CS_INT)');
    output += "<br />" + executeUpdate('CREATE COLUMN TABLE "METRIC2"."TMP_STATE_SALES" ("STATE" VARCHAR(60), "VALUE" REAL CS_FLOAT, "STATE_NAME" NVARCHAR(50) DEFAULT \'NVARCHAR\', "MONTH" INTEGER CS_INT, "YEAR" INTEGER CS_INT)');
    
    //Add Sales Data
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_COUNTRY_SALES" VALUES (\'AE\',10000,\'Arab Emerits\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_COUNTRY_SALES" VALUES (\'ZA\',202000,\'South Africa\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_COUNTRY_SALES" VALUES (\'AU\',283874,\'Australia\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_COUNTRY_SALES" VALUES (\'CA\',1228830,\'Canada\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_COUNTRY_SALES" VALUES (\'RU\',4552610,\'Russia\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_COUNTRY_SALES" VALUES (\'ZW\',188273,\'Zimbabwe\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_COUNTRY_SALES" VALUES (\'NA\',200000,\'Namibia\',1,2014)');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ga\',865445,\'Georgia\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ga\',625355,\'Georgia\',2,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ga\',188737,\'Georgia\',3,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ar\',593741,\'Arkansas\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ca\',6193740,\'California\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'fl\',193741,\'Florida\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'hi\',293741,\'Hawaii\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'hi\',293741,\'Hawaii\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'id\',343741,\'Idaho\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ia\',393741,\'Iowa\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'in\',23741,\'Indianpolis\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ka\',355462,\'Kansas\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ky\',988767,\'Kentucky\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'me\',266533,\'Maine\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ma\',123223,\'Maryland\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'mi\',121998,\'Michigan\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'mn\',998762,\'Minnesota\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'mt\',547662,\'Montana\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ne\',223492,\'Nebraska\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'nv\',665244,\'Nevada\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'nh\',182773,\'New Hamshire\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'nj\',928837,\'New Jersey\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'nm\',192883,\'New Mexico\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ny\',392883,\'New York\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'nc\',492883,\'North Carolina\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'nd\',192883,\'North Dakota\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'oh\',123883,\'Ohio\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ok\',223883,\'Oklahoma\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'or\',323883,\'Oregan\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'pa\',823883,\'Pennsylvania\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ri\',723883,\'Rhode Island\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'sc\',923883,\'South Carolina\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'sd\',113883,\'South Dakota\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'tn\',213883,\'Tennessee\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'tx\',113883,\'Texas\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ut\',413883,\'Utah\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'vt\',213883,\'Vermont\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'va\',218773,\'Virginia\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'wa\',418773,\'Washington\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'wv\',518773,\'West Virginia\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'wi\',198773,\'Wisconsin\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'wy\',998773,\'Wyoming\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'co\',199837,\'Colorado\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'az\',569837,\'Arizona\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'al\',989837,\'Alabama\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'ak\',882731,\'Alaska\',1,2014)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."TMP_STATE_SALES" VALUES (\'AE\',10000,\'Arab\',12,2014)');

    
    //Dashboards
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD" VALUES (22,\'My IT Systems\',\'\',NULL,1,NULL,NULL,NULL,NULL,NULL,1,\'\',NULL,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD" VALUES (23,\'HANA Dashboard\',\'\',NULL,1,NULL,NULL,NULL,NULL,NULL,2,\'\',NULL,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD" VALUES (2,\'Sales Dashboard\',\'\',NULL,1,NULL,NULL,NULL,NULL,NULL,3,\'\',NULL,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD" VALUES (3,\'Internet Of Things\',\'\',NULL,1,NULL,NULL,NULL,NULL,NULL,4,\'\',NULL,NULL)');
    
    //Dashboard Metrics
    //My IT Systems
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (119,22,4,\'All Service Started\',1,1,5,5,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1118,119,7,\'SELECT VALUE FROM METRIC2.M2_WIDGET_ALLSTARTED_VALUE\',4,\'2014-12-05 12:37:59.6740000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1119,119,6,\'localserver\',4,\'2014-12-05 12:37:59.7910000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1120,119,8,\'SELECT STATUS FROM METRIC2.M2_WIDGET_ALLSTARTED\',4,\'2014-12-05 12:37:59.9410000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (120,22,7,\'Instance Details\',1,1,5,6,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1121,120,22,\'SELECT VALUE FROM METRIC2.M2_WIDGET_INSTANCEID\',7,\'2014-12-05 12:38:00.1930000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1122,120,21,\'localserver\',7,\'2014-12-05 12:38:00.2950000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1123,120,23,\'SELECT VALUE FROM METRIC2.M2_WIDGET_INSTANCENUMBER\',7,\'2014-12-05 12:38:00.3770000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (121,22,8,\'Current Connections\',1,1,7,7,60,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1124,121,24,\'localserver\',8,\'2014-12-05 12:38:00.5290000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1125,121,27,\'SELECT CNT as VALUE FROM METRIC2.M2_WIDGET_RUNNINGCONNETIONS\',8,\'2014-12-05 12:38:00.5770000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1126,121,30,\'0\',8,\'2014-12-05 12:38:00.6600000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1127,121,26,\'Users\',8,\'2014-12-05 12:38:00.7450000\')');
    
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (122,22,12,\'Component Overview\',3,1,1,1,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1128,122,44,\'SELECT STATUS FROM METRIC2.M2_WIDGET_SYSOVERVIEW\',12,\'2014-12-05 12:38:00.9110000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1129,122,43,\'localserver\',12,\'2014-12-05 12:38:01.0470000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (123,22,15,\'Local Time\',1,1,5,7,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1130,123,152,\'UTC\',15,\'2014-12-05 12:38:01.1800000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (124,22,21,\'System Overview\',4,1,1,5,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1131,124,75,\'localserver\',21,\'2014-12-05 12:38:01.2970000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1132,124,76,\'SELECT SM FROM METRIC2.M2_WIDGET_TOTAL_CPU\',21,\'2014-12-05 12:38:01.3270000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1133,124,77,\'SELECT SM FROM METRIC2.M2_WIDGET_SYS_MEM\',21,\'2014-12-05 12:38:01.4470000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1134,124,80,\'SELECT VALUE FROM METRIC2.M2_WIDGET_DISTRIBUTED_VALUE\',21,\'2014-12-05 12:38:01.4950000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1135,124,79,\'SELECT VALUE FROM METRIC2.M2_WIDGET_ALLSTARTED_VALUE\',21,\'2014-12-05 12:38:01.5940000\')');
    
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (125,22,35,\'HANA PRD Tables Sizes\',2,1,7,3,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1136,125,132,\'localserver\',35,\'2014-12-05 12:38:01.7450000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1137,125,134,\'SELECT * FROM METRIC2.M2_WIDGET_ROWCOLSIZES\',35,\'2014-12-05 12:38:01.8300000\')');
    
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (126,22,17,\'Las Vegas Weather\',1,1,3,5,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1138,126,70,\' 89104\',17,\'2014-12-05 12:38:02.0250000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (127,22,30,\'SAP Stock Price\',1,1,7,5,360,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1139,127,122,\'SAP\',30,\'2014-12-05 12:38:02.2440000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (164,22,31,\'@metricsquared\',2,3,3,1,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1278,164,112,\' @metricsquared\',31,\'2014-12-05 12:38:02.3780000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1279,164,115,\'385571773112012800\',31,\'2014-12-05 12:38:02.4630000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1280,164,113,\'6\',31,\'2014-12-05 12:38:02.5800000\')');
    
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (129,22,27,\'Connections\',2,1,3,6,60,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1143,129,102,\'SELECT STATUS FROM METRIC2.M2_WIDGET_CONNECTIONS\',27,\'2014-12-05 12:38:02.6790000\')');
    
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (130,22,9,\'CPU Usage\',1,1,7,6,60,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1144,130,32,\'localserver\',9,\'2014-12-05 12:38:02.9130000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1145,130,36,\'line\',9,\'2014-12-05 12:38:03.0480000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1146,130,35,\'20\',9,\'2014-12-05 12:38:03.1810000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1147,130,33,\'SELECT CPU as VALUE FROM METRIC2.M2_WIDGET_DB_CPU\',9,\'2014-12-05 12:38:03.2310000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1148,130,157,\'MET3\',9,\'2014-12-05 12:38:03.3250000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (168,22,47,\'Speed by State\',2,2,3,3,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1294,168,177,\'localserver\',47,\'2015-01-17 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1295,168,176,\'SELECT * FROM METRIC2.TMP_STATE_SALES\',47,\'2015-01-17 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1296,168,178,\'Ping\',47,\'2015-01-17 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1297,168,179,\' \',47,\'2015-01-17 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1298,168,192,\'#DEEDF6\',47,\'2015-01-17 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1299,168,193,\'#2A89C1\',47,\'2015-01-17 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (174,22,3,\'SQL Statement\',1,1,1,4,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1312,174,18,\'localserver\',3,\'2015-04-28 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1313,174,19,\'SELECT 7 as VALUE FROM DUMMY\',3,\'2015-04-28 00:00:00.0000000\')');
    
    
    //Hana Dashboard
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (131,23,45,\'HANA Overview\',6,4,1,1,10,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1149,131,171,\'localserver\',45,\'2014-12-05 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1150,131,170,\'SELECT * FROM METRIC2.M2_WIDGET_HANAOVERVIEW\',45,\'2014-12-05 00:00:00.0000000\')');
    
    
    
    //Sales Dashboard
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (106,2,46,\'\',7,1,1,1,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1090,106,174,\'#666\',46,\'2014-12-03 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1091,106,172,\'My Sales Dashboard\',46,\'2014-12-03 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1092,106,175,\'center\',46,\'2014-12-03 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1093,106,173,\'50px\',46,\'2014-12-03 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (52,2,44,\'World Clock\',2,2,4,3,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (138,52,153,\'\',44,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (139,52,152,\'\',44,\'2014-09-29 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (26,2,34,\'Europe Sales\',2,1,8,1,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (78,26,124,\'localserver\',34,\'2014-09-27 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (79,26,125,\'SELECT RAND() * 100 as VALUE FROM DUMMY\',34,\'2014-09-27 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (80,26,131,\'$M\',34,\'2014-09-27 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (81,26,126,\'30\',34,\'2014-09-27 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (82,26,128,\'bar-chart\',34,\'2014-09-27 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (83,26,130,\'#F55B4C\',34,\'2014-09-27 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (33,2,34,\'North America Sales\',2,1,2,4,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (94,33,124,\'localserver\',34,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (95,33,125,\'SELECT RAND() * 10 as VALUE FROM DUMMY\',34,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (96,33,131,\'$M\',34,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (97,33,126,\'30\',34,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (98,33,128,\'\',34,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (99,33,130,\'#1fb5ad\',34,\'2014-09-29 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (36,2,30,\'GOOG Stock Price\',1,1,2,3,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (103,36,122,\'GOOG\',30,\'2014-09-29 00:00:00.0000000\')');
    
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (37,2,31,\'@metricsquared\',2,3,2,1,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (104,37,112,\'@metricsquared\',31,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (105,37,113,\'6\',31,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (106,37,115,\'385571773112012800\',31,\'2014-09-29 00:00:00.0000000\')');

    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (175,2,47,\'Sales by State\',2,2,2,6,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1314,175,177,\'localserver\',47,\'2014-12-31 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1315,175,178,\'Net Revenue\',47,\'2014-12-31 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1316,175,179,\'$\',47,\'2014-12-31 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1317,175,176,\'SELECT * FROM METRIC2.TMP_STATE_SALES WHERE MONTH = 1 AND Year = 2014\',47,\'2014-12-31 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1318,175,192,\'#DEEDF6\',47,\'2014-12-31 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (1319,175,193,\'#2A89C1\',47,\'2014-12-31 00:00:00.0000000\')');
    
    //IoT
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (7,3,29,\'Temp\',1,1,1,1,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (23,7,106,\'Temperature\',29,\'2014-09-27 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (24,7,109,\'°C\',29,\'2014-09-27 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (25,7,118,\'\',29,\'2014-09-27 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (54,3,15,\'Date and Time\',1,1,3,2,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (140,54,153,\'\',15,\'2014-09-29 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (63,3,41,\'RSS Data\',2,3,1,6,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (169,63,147,\'http://rss.cnn.com/rss/edition.rss\',41,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (170,63,148,\'8\',41,\'2014-09-29 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (40,3,29,\'Flow Valve 1\',2,1,1,3,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (116,40,106,\'Warning\',29,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (117,40,109,\'Gal/Day\',29,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (118,40,118,\'\',29,\'2014-09-29 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (42,3,17,\'Weather @ 28012\',1,1,3,4,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (122,42,70,\' 28012\',17,\'2014-09-29 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (43,3,26,\'Server Ping\',1,1,3,3,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (123,43,97,\'192.168.0.1\',26,\'2014-09-29 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (44,3,36,\'JSON Service Data\',1,1,3,1,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (124,44,135,\'http://ip.jsontest.com/\',36,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (125,44,137,\'ip\',36,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (126,44,138,\'My IP Address\',36,\'2014-09-29 00:00:00.0000000\')');
    
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (47,3,43,\'Production Line 1\',1,1,7,5,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (130,47,151,\'localserver\',43,\'2014-09-29 00:00:00.0000000\')');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (131,47,150,\'SELECT 1 as min\, 10 as max\, 5 as value\, MET2SpeedMET2 as Label\, MET2Motor 1MET2 as Title FROM DUMMY\',43,\'2014-09-29 00:00:00.0000000\')');
    
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET" VALUES (49,3,42,\'Web Cam 1\',4,3,5,1,0,NULL)');
    output += "<br />" + executeUpdate('INSERT INTO "METRIC2"."M2_DASHBOARD_WIDGET_PARAMS" VALUES (134,49,149,\'http://intercepts.wpengine.com/wp-content/uploads/2012/11/P8A-121115-Boeing-trip-179b-1024x7191.jpg\',42,\'2014-09-29 00:00:00.0000000\')');
    
    output += "<br /> Completed";
}

$.response.contentType = "text/html";
$.response.setBody(output);