import { LightningElement,track, api , wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import { refreshApex } from '@salesforce/apex';
import getDeal from '@salesforce/apex/SearchProducts.getDeal';
import getLineItems from '@salesforce/apex/SearchProducts.getLineItems';
import deleteLineItem from '@salesforce/apex/SearchProducts.deleteLineItem';
import updateLineItems from '@salesforce/apex/SearchProducts.updateLineItems';
export default class EditAndDeleteLineItems extends LightningElement {
    @api recordId;
    //console.log(this.recordId);
    wiredDealResult;
    wiredProductResult;
    @track objDeal;
    @track canEditProduct = true;
    @wire(getDeal, {recordid : '$recordId'})
    wiredDeal(result){   
        try{
            this.wiredDealResult = result;        
            if(result.data){
                this.objDeal = result.data;
            // console.log('this.objDeal-----'+JSON.stringify(this.objDeal));
                if(this.objDeal.Stage__c == 'Advanced Received' || this.objDeal.Stage__c == 'Invoice' || this.objDeal.Stage__c == 'Closed Won' || this.objDeal.Stage__c == 'Closed Lost' ){
                    this.canEditProduct = false;
                //   console.log('this.canAddProduct-------'+this.canEditProduct);
                }

                
            }
            else if(result.error){
             console.log('error---in deal obj-----'+result.error);
            }
        }catch(error){
           // console.log('...'+error);
        }     
        

    }
    closedAura() {
        const value = ''; 
        //alert('LWC.....');
        const valueChangeEvent = new CustomEvent("closeAction", {       detail: { value }     });  
           // Fire the custom event     
        this.dispatchEvent(valueChangeEvent);   
    }


 renderedCallback() {
    return refreshApex(this.wiredProductResult);
        
 }
    @track showTable = false;
    @track dealLineItemsToCreate = [
        {
            Id : '',
            Name : '',
            Product1__c : '',
            Sales_Price__c : '',
            Quantity__c : '',
            Discount__c : '',
            Description__c : '',
        }
    ];
    @track lineItemList;
    @track Sales_Price__c;

    @wire(getLineItems, {dealId : '$recordId'})
    wiredRecords(result){
        try{
            this.wiredProductResult = result;
        if(result.data){
           // console.log('data-------'+result.data);
            this.showTable = true;
            this.lineItemList = result.data;
            //this.dealLineItemsToCreate  = this.lineItemList;
            //this.objLineItemlist.push(lineItemList);
           // console.log('this.lineitemslist--------'+ this.lineItemList);

            for(var i = 0; i<this.lineItemList.length; i++){
               // console.log('inside for loop');
               
               if(i>0 ){
                this.dealLineItemsToCreate.push(
                    {
                        Id : '',
                        Name : '',
                        Product1__c : '',
                        Sales_Price__c : '',
                        Quantity__c : '',
                        Discount__c : '',
                        Description__c : '',
                    }
                );
                }
    
                this.dealLineItemsToCreate[i].Id = this.lineItemList[i].Id;
                this.dealLineItemsToCreate[i].Name = this.lineItemList[i].Name;
                this.dealLineItemsToCreate[i].Product1__c = this.lineItemList[i].Product1__c;
                this.dealLineItemsToCreate[i].Sales_Price__c = this.lineItemList[i].Sales_Price__c;
                this.dealLineItemsToCreate[i].Quantity__c = this.lineItemList[i].Quantity__c;
                this.dealLineItemsToCreate[i].Discount__c = this.lineItemList[i].Discount__c;
                this.dealLineItemsToCreate[i].Description__c = this.lineItemList[i].Description__c;
              //  console.log('this.dealLineItemsToCreate-----'+this.dealLineItemsToCreate);

            

           

            }
        
            
        }else if(result.error){
            console.log('error-----------'+ result.error);
        }    
        }catch(error){
                console.log('.....'+error);
        }
        

        
    }

   // @track objLineItemlist = [...this.lineItemList];
   @track showSave = true;

    deleteLineItem(event){
       // console.log('event.target.accessKey-----------'+event.target.accessKey);
        let currentIndex = event.target.accessKey;

     //   console.log('event.target.ID-----------'+event.target.id);
        var selectedlineItemId = event.target.id.slice(0,18);
        deleteLineItem({lineItemId : selectedlineItemId})
        .then(result => {
         //   console.log('line item deleted');
            // const objLIlist = [...this.lineItemList];
            // objLIlist.splice(event.target.accessKey, 1);
            // this.lineItemList = objLIlist;
         //   console.log('currentindex----------'+currentIndex);
           let temp =  this.dealLineItemsToCreate.splice(currentIndex, 1);
        //   console.log('temp-----'+JSON.stringify(temp));
           // console.log('lineitem list after splice-----'+ JSON.stringify(this.lineItemList));
         //   console.log('deallineitem list after splice-----'+ JSON.stringify(this.dealLineItemsToCreate));
        
            this.dispatchEvent( new ShowToastEvent ({
                title : 'Success',
                message : 'Line Item Deleted Successfully',
                variant : 'success'
            }),
            );
            eval("$A.get('e.force:refreshView').fire();");
            return refreshApex(this.wiredProductResult);

        })
        .catch(error => {
         //   console.log('error------------'+error);
        });

      //  console.log('this.dealLineItemsToCreate.length------'+this.dealLineItemsToCreate.length);

       if(this.dealLineItemsToCreate.length == 1){
           this.showSave = false;
       }

    }

    handleCancelClick(){
        this.dispatchEvent(new CloseActionScreenEvent());
        this.closedAura();
        return refreshApex(this.wiredDealResult)
        
    }

    
    
    
    


    handleInputChange(event){
       // console.log('label-------'+event.target.label);
       // console.log('accesskey------'+event.target.accessKey);
       // console.log('lineItem list-------------'+this.lineItemList);
       // console.log('dealLineItemsToCreate------'+JSON.stringify(this.dealLineItemsToCreate));
        if(event.target.label === 'SalesPrice'){
         //   console.log('inside sales price if ')
           //const objLineItemlist =  [...this.lineItemList];
           //console.log('objLineItemlist-------'+JSON.stringify(objLineItemlist));
           this.dealLineItemsToCreate[event.target.accessKey].Sales_Price__c = event.target.value;
            // console.log(' objLineItemlist[event.target.accessKey].Sales_Price__c-----'+ objLineItemlist[event.target.accessKey].Sales_Price__c);
            // this.lineItemList = objLineItemlist;
          //  console.log('this.dealLineItemsToCreate-------'+JSON.stringify(this.dealLineItemsToCreate));
            //dealLineItemsToCreate.push([...lineItemList]);
        }
        if(event.target.label === 'Quantity'){
          //  console.log('event.target.value of quantity------'+event.target.value);
            this.dealLineItemsToCreate[event.target.accessKey].Quantity__c = event.target.value;
        }
        if(event.target.label === 'Discount'){
          //  console.log('event.target.value of Discount------'+event.target.value);
            this.dealLineItemsToCreate[event.target.accessKey].Discount__c = event.target.value;
        }
        if(event.target.label === 'Description'){
            this.dealLineItemsToCreate[event.target.accessKey].Description__c = event.target.value;
        }

       // console.log('line item input change-----'+ JSON.stringify(this.dealLineItemsToCreate));

    }

    updateLineItems(){
        updateLineItems({updatedLineItems : JSON.stringify(this.dealLineItemsToCreate)})
        .then(result => {
            console.log('update successfull -------'+result);
            
            this.dispatchEvent( new ShowToastEvent ({
                title : 'Success',
                message : 'Line Item updated Successfully',
                variant : 'success'
            }),
            );
            
            this.dispatchEvent(new CloseActionScreenEvent());
            eval("$A.get('e.force:refreshView').fire();")
            this.closedAura();
            return refreshApex(this.wiredProductResult);
            
           // return  window.location.reload();
            
        })
        .catch(error => {
            console.log('error-----------'+JSON.stringify(error));
            this.dispatchEvent( new ShowToastEvent ({
                title : 'Error',
                message : 'Error while updating line item',
                variant : 'error'
            }),
            );
        })
    }

}
