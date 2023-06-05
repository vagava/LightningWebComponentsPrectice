public with sharing class OMEX_CustomLookup_ctr 
{
    @AuraEnabled(cacheable = false)
    public static List<SObject> findRecords(String searchKey, String objectName, String searchFields, String orderByField)
    {
        String key = searchKey + '%';

        String QUERY = 'SELECT Id, ' + searchFields + ' FROM ' + objectName + ' WHERE ';

        List<String> searchFieldsList = searchFields.split(',');

        Integer count = 0;

        for (String searchField : searchFieldsList)
        {
            if( count == 0)
            {
                QUERY += searchField + ' LIKE :key ';
            }
            else 
            {
                QUERY += 'OR ' + searchField + ' LIKE :key ';
            }

            count++;
        }

        QUERY += 'ORDER BY ' + orderByField + ' ASC LIMIT 15';

        System.debug(System.LoggingLevel.DEBUG, QUERY);

        List<SObject> sObjectList = Database.query(QUERY);

        return sObjectList;
    }

    @AuraEnabled(cacheable = false)
    public static List<SObject> getRecordByField(String value, String objectName, String conditionaldField, String searchFields)
    {
        String QUERY = 'SELECT Id, ' + searchFields + ' FROM ' + objectName + ' WHERE ' + conditionaldField + ' = :value LIMIT 1';

        System.debug(System.LoggingLevel.DEBUG, QUERY);

        List<SObject> sObjectList = Database.query(QUERY);

        return sObjectList;
    }

    @AuraEnabled(cacheable = true)
    public static List<SObject> getRecordByFieldDataList(List<String> dataList, String objectName, String conditionaldField, String searchFields)
    {
        String QUERY = 'SELECT Id, ' + searchFields + ' FROM ' + objectName + ' WHERE ' + conditionaldField + ' IN :dataList LIMIT 15';

        System.debug(System.LoggingLevel.DEBUG, QUERY);

        List<SObject> sObjectList = Database.query(QUERY);

        return sObjectList;
    }
}