import { LightningElement, api, track} from 'lwc';
import findRecords from '@salesforce/apex/OMEX_CustomLookup_ctr.findRecords';
import getRecordByField from '@salesforce/apex/OMEX_CustomLookup_ctr.getRecordByField';
import getRecordByFieldDataList from '@salesforce/apex/OMEX_CustomLookup_ctr.getRecordByFieldDataList';

export default class OMEX_CustomLookup_lcp extends LightningElement 
{
    @track records;
    @track error;
    @track selectedRecord;
    @track haveRecords;
    @track showSpinner;
    @track haveRecordsFromOrder = false;
    @api fieldValue;
    @api index;
    @api fieldId;
    @api relationshipfield;
    @api allProducts;
    @api iconname = "standard:product";
    @api objectName = 'Product2';
    @api searchFields = 'Name,OMEX_CodigoEAN__c,OMEX_Codigo__c';
    @api conditionaldField = 'OMEX_Codigo__c';
    @api orderByField  = 'OMEX_Codigo__c';

    constructor()
    {
        super();
        this.records = [];
        this.haveRecords = false;
        this.showSpinner = false;
    }

    connectedCallback()
    {
        this.getProductsFromOrder(false, '');

        if(this.isNotBlank(this.fieldValue))
        {
            getRecordByField(
                {
                    value : this.fieldValue, 
                    objectName : this.objectName, 
                    conditionaldField: this.conditionaldField,
                    searchFields : this.searchFields
                }
            )
            .then(result => 
                {
                    this.records = result;

                    if(this.isNotBlank(this.records))
                    {
                        this.selectedRecord = this.records[0];

                        if(this.selectedRecord != undefined && this.selectedRecord.hasOwnProperty('Id'))
                        {
                            if(!this.haveRecordsFromOrder)
                            {
                                this.records = [];
                            }

                            this.haveRecords = false;
                            this.showSpinner = false;

                            let detail = { 
                                productId : this.selectedRecord.Id,
                                productPLU: this.selectedRecord.OMEX_Codigo__c,
                                fieldId : this.fieldId,
                            };

                            const selectedRecordEvent = new CustomEvent(
                                "selectedrec",
                                {
                                    detail : detail
                                }
                            );
    
                            this.dispatchEvent(selectedRecordEvent);
                        }
                    }

                    this.error = undefined;
            })
            .catch(error => 
            {
                this.records = [];
                this.error = error;
                console.error(error);
            });
        }
    }

    handleOnchange(event)
    {
        const searchKey = event.detail.value;

        if(this.isNotBlank(searchKey) && searchKey.length > 0)
        {
            this.haveRecords = true;
            this.showSpinner = true; 

            if(this.haveRecordsFromOrder)
            {
                this.getProductsFromOrder(true, searchKey);
                
            }
            else
            {
                findRecords(
                    {
                        searchKey : searchKey, 
                        objectName : this.objectName, 
                        searchFields : this.searchFields,
                        orderByField: this.orderByField
                    }
                )
                .then(result => 
                    {
                        this.records = result;

                        if(this.isNotBlank(this.records))
                        {
                            let fields = this.searchFields.split(',');

                            for(let i=0; i < this.records.length; i++)
                            {
                                const rec = this.records[i];

                                for(let j=0; j < fields.length; j++)
                                {
                                    let field = fields[j];
                                    this.records[i][field] = rec[field];
                                }
                            }

                            if(this.records.length > 0)
                            {
                                this.haveRecords = true;
                                this.showSpinner = false;
                            }
                        }
                        else
                        {
                            this.haveRecords = false;
                            this.showSpinner = false;
                        }

                        this.error = undefined;
                })
                .catch(error => 
                {
                    this.records = [];
                    this.haveRecords = false;
                    this.error = error;
                    console.error(error);
                });
            }
        }
        else
        {
            this.records = [];
            this.haveRecords = false;
        }
    }

    handleOnblur(e)
    {
        const component = this;
        setTimeout(
            (e) => 
                {
                    component.haveRecords = false;
                    component.showSpinner = false;
                }, 
        500);
    }

    handleSelect(event)
    {
        const selectedRecordId = event.detail;

        this.selectedRecord = this.records.find( record => record.Id === selectedRecordId );
        
        if(!this.haveRecordsFromOrder)
        {
            this.records = [];
        }

        this.haveRecords = false;
        this.showSpinner = false;

        let detail = { 
            productId : selectedRecordId,
            productPLU: this.selectedRecord.OMEX_Codigo__c,
            fieldId : this.fieldId,
        };

        const selectedRecordEvent = new CustomEvent(
            "selectedrec",
            {
                detail : detail
            }
        );

        this.dispatchEvent(selectedRecordEvent);
    }

    handleRemove(event)
    {
        event.preventDefault();

        this.selectedRecord = false;

        if(!this.haveRecordsFromOrder)
        {
            this.records = [];
        }

        this.error = undefined;
        this.haveRecords = false;
        this.showSpinner = false;

        let detail = { 
            productId : undefined,
            productPLU: undefined,
            fieldId : this.fieldId,
        };

        const selectedRecordEvent = new CustomEvent(
            "selectedrec",
            {
                detail : detail
            }
        );
        
        this.dispatchEvent(selectedRecordEvent);
    }

    isNotBlank(value)
    {
        if(typeof value !== undefined && value != null && value !== 'undefined' && value != '' && value.length > 0)
        {
            return true
        }

        return false;
    }

    getProductsFromOrder(showList, searchKey)
    {
        if(this.isNotBlank(this.allProducts) && this.allProducts.length > 0)
        {
            let allProductsPLUs = [];

            for(let i=0; i < this.allProducts.length; i++)
            {
                if(this.allProducts[i].hasOwnProperty('PLU'))
                {
                    allProductsPLUs.push(this.allProducts[i].PLU);
                }
            }
            
            if(allProductsPLUs.length > 0)
            {

                getRecordByFieldDataList(
                    {
                        dataList : allProductsPLUs, 
                        objectName : this.objectName, 
                        conditionaldField : this.conditionaldField,
                        searchFields: this.searchFields
                    }
                )
                .then(result => 
                    {
                        this.records = result;

                        if(this.isNotBlank(this.records))
                        {
                            let fields = this.searchFields.split(',');

                            for(let i=0; i < this.records.length; i++)
                            {
                                const rec = this.records[i];

                                for(let j=0; j < fields.length; j++)
                                {
                                    let field = fields[j];
                                    this.records[i][field] = rec[field];
                                }
                            }

                            this.haveRecordsFromOrder = true;

                            this.showProductsListFromOrder(showList, searchKey);
                        }

                        this.error = undefined;
                })
                .catch(error => 
                {
                    this.records = [];
                    this.haveRecords = false;
                    this.haveRecordsFromOrder = false;
                    this.error = error;
                    console.error(error);
                });
            }
            else
            {
                this.haveRecordsFromOrder = false;
            }
        }
    }

    showProductsListFromOrder(showList, searchKey)
    {
        if(this.isNotBlank(this.records))
        {
            if(this.isNotBlank(searchKey))
            {
                this.records = this.records.filter((product) => 
                {
                    let searchKeyReg = '^' + searchKey;
                    let regex = new RegExp(searchKeyReg, 'i');
                    return regex.test(product.OMEX_Codigo__c);
                });

                if(this.records.length > 0 && showList)
                {
                    this.haveRecords = true;
                }
            }

            this.showSpinner = false
        }
        else
        {
            this.haveRecords = false;
            this.showSpinner = false;
        }
    }
}