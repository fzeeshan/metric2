CREATE VIEW "METRIC2"."M2_WIDGET_DATADISK" ( "DISK_SIZE", "DATA_SIZE", "USED_SIZE" ) AS select ROUND(d.total_size/1024/1024/1024,2) disk_size, ROUND(sum(v2.data_size)/1024/1024/1024,2) data_size, ROUND(d.used_size/1024/1024/1024,2) used_size from ( ( m_volumes as v1 join M_VOLUME_SIZES as v2 on v1.volume_id = v2.volume_id ) right outer join m_disks as d on d.disk_id = v2.disk_id ) where d.usage_type = 'DATA' group by v1.host, d.usage_type, d.total_size,d.device_id, d.path, d.used_size order by d.device_id,v1.host WITH READ ONLY