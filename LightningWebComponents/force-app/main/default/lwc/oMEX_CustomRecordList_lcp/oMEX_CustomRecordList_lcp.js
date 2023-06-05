import { LightningElement, api } from 'lwc';

export default class OMEX_CustomRecordList_lcp extends LightningElement 
{
    @api record;
    @api fieldname;
    @api iconname;

    handleSelect(e)
    {
        e.preventDefault();
        const selectedRecord = new CustomEvent(
            "select",
            {
                detail : this.record.Id
            }
        );
        this.dispatchEvent(selectedRecord);
    }
}