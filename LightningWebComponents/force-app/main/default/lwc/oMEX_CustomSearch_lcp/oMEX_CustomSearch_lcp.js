import { LightningElement, api, track } from 'lwc';

export default class OMEX_CustomSearch_lcp extends LightningElement 
{
    @api fieldLabel;
    @api fieldPlaceholder;
    @api required = false;
    @api fieldValue;
    @api fieldId;

    @track fieldValueUpdate;

    handleBlur(e)
    {
        e.preventDefault();

        const blurEvent = new CustomEvent(
            'blur', 
            {
                detail: e.detail
            }
        );

        this.dispatchEvent(blurEvent);
    }

    handleChange(e) 
    {
        e.preventDefault();

        const searchEvent = new CustomEvent(
            'change', 
            {
                detail: e.detail.value
            }
        );

        this.dispatchEvent(searchEvent);
    }

    @api isValid() 
    {
        if (this.required) 
        {
            this.template.querySelector('lightning-input-field').reportValidity();
        }
    }
}