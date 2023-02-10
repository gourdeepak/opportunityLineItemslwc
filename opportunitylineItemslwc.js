import { LightningElement ,track, api, wire } from 'lwc';
import getproductsWithoutSearch from '@salesforce/apex/SearchProducts.getproductsWithoutSearch';
import getProducts from '@salesforce/apex/SearchProducts.getProducts';
import createOLI from '@salesforce/apex/SearchProducts.createOLI';
import getDeal from '@salesforce/apex/SearchProducts.getDeal';
import getLineItems from '@salesforce/apex/SearchProducts.getLineItems';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

export default class AddOpportunityLineItems extends LightningElement {

wireProductResult;
    @api recordId;
    @track objDeal;
    wiredProductResult;
    wiredDealResult;
    @track canAddProduct = true;
    @wire(getDeal, {recordid : '$recordId'})
    wiredDeal(result){
        this.wiredDealResult = result;
        if(result.data){
            this.objDeal = result.data;
          //  console.log('this.objDeal-----'+JSON.stringify(this.objDeal));
            if(this.objDeal.Stage__c == 'Advanced Received' || this.objDeal.Stage__c == 'Invoice' || this.objDeal.Stage__c == 'Closed Won' || this.objDeal.Stage__c == 'Closed Lost' ){
                this.canAddProduct = false;
              //  console.log('this.canAddProduct-------'+this.canAddProduct);
            }
        }
        else if(result.error){
          //  console.log('error---in deal obj-----'+error);
        }

    }


    @wire(getLineItems, {dealId : '$recordId'})
    wiredRecords(result){
        this.wiredProductResult = result;
        if(result.data){
            console.log('data-------'+result.data);
            
            
        }
         if(result.error){
            console.log('error-----------'+ result.error);
        }

        
    }

    



    closeModal() {
        // to close modal set isModalOpen tarck value as false
       
      //eval("$A.get('e.force:closeQuickAction').fire()");

      this.closedAura();
        
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    closedAura() {
        const value = ''; 
        const valueChangeEvent = new CustomEvent("closeAction", {       detail: { value }     });  
           // Fire the custom event     
        this.dispatchEvent(valueChangeEvent);   
    }

    // connectedCallback(){
    //     getProducts({searchKey : this.proName , dealId : '$recordId'})
    //     .then(result =>{
    //         this.productList = result;
    //         console.log('productList-------'+productList);
    //     }).catch(error=>{
    //         this.error = error;
    //     })
    // }

    @wire(getproductsWithoutSearch , {dealId : '$recordId'})
    wiredProducts(result){
        this.wireProductResult =result;
        if(result.data){
            this.productList = result.data;
           //  console.log('productList-------'+productList);
        }
        if(result.error){
            this.error = result.error;
        }
    }

    submitDetails() {
        // to close modal set isModalOpen tarck value as false
        //Add your code to call apex method or do some processing
        this.isModalOpen = false;
    }

    @track isFirstScreen = true;

    @track showtable = true;
    @track proName = '';
    @track hideSearch = true;
    @track productList =[];

    // @wire(getProducts, {searchKey : this.proName})
    // wiredData({error,data}){
    //     if(data){
    //         console.log('data------'+data);
    //         this.productList = data;
    //     }else{
    //         console.log(error);
    //     }
    // }


    handleChange(event){
        this.proName = event.target.value;
      //  console.log('this.proName------'+this.proName);
        getProducts({searchKey : this.proName, dealId : this.recordId })
        .then(result =>{
            this.productList = result;
          //  console.log('productList-------'+productList);
        }).catch(error=>{
            this.error = error;
        })
        //this.showtable = true;
    }
    
    @track selectedProducts = [];
    @track selectedProductsIds = [];

    handlecheckboxclick(event){
        var currentIndex = event.target.accessKey;
       // console.log('handlecheckboxclick  current index ----'+currentIndex);
        var selectpro = {id : event.target.value,
            Name : event.target.label,
            UnitPrice : event.target.name,
               };
        if(event.target.checked){
         //   console.log('inside if current index -------'+currentIndex)
      //  console.log('event.target.label--------'+event.target.label);
      //  console.log('event.target.value--------'+event.target.value);
            if(!this.selectedProductsIds.includes(event.target.value)){
                this.selectedProductsIds.push(event.target.value);
        // const selectpro = {id : event.target.value,
        //                  Name : event.target.label,
        //                  UnitPrice : event.target.name,
        //                     };
      //  console.log('selectpro---'+JSON.stringify(selectpro));
      //  console.log('selectpro---'+JSON.stringify(selectpro.id));
        
      //  console.log(this.selectedProductsIds.includes(selectpro.id)+'.........isincludes');
        //  if(!this.selectedProductsIds.includes(selectpro.id)){
            
        //      console.log('inside selectpro else');
              this.selectedProducts.push(selectpro);
        //  }else{
        //      console.log('duplicate product selected');
        //  }
                        }else{
                          //  console.log('duplicate product selected');
                            this.dispatchEvent(new ShowToastEvent({
                                title : 'Error',
                                message : 'Product already Selected',
                                variant : 'error',
                            }),
                            );
                        }
        
      //  console.log('this.selectedProducts--------'+JSON.stringify(this.selectedProducts));
    }else{
      //  console.log('else currentindex-----'+currentIndex);
        let index1 = this.selectedProductsIds.indexOf(event.target.value);
      //  console.log('index1------'+index1);
      //  console.log('else  selectpro-----------'+JSON.stringify(selectpro));
        // let index2 = this.selectedProducts.indexOf(selectpro);
        // console.log('index2------'+index2);
        this.selectedProductsIds.splice(index1, 1);
        this.selectedProducts.splice(index1, 1);
      //  console.log('this.selectedProducts-----'+JSON.stringify(this.selectedProducts));
    }
}

    @track oliList =[
        {
            Deal__c : '',
            Product1__c : '',
            Sales_Price__c : '',
            Quantity__c : '',             
            Discount__c : '',
            Description__c : '',
            
         //   PricebookEntryId : '',
        }
    ];

    @track showSelectedProducts = false;
    handleNextclick(){
     //   console.log('next button clicked');
     //   console.log('this.selectedProductsIds.length-------'+this.selectedProductsIds.length);
        
         if(this.selectedProductsIds.length>0){
      //  console.log('Opportunityid------------'+this.recordId);
        this.showSelectedProducts=true;
        this.hideSearch = false;
        this.isFirstScreen = false;
      //  console.log('this.showSelectedProducts-----'+this.showSelectedProducts);
     //   console.log('selected products length----'+this.selectedProducts.length);
        for(var i=0; i<this.selectedProducts.length; i++){
          //  console.log('inside loop');
            if(i>0){
            this.oliList.push(
                {
                    Deal__c : '',
                    Product1__c : '',
                    Sales_Price__c : '',
                    Quantity__c : '',             
                    Discount__c : '',
                    Description__c : '',
                }
            );
            }

          //  console.log('inside for loop');
            this.oliList[i].Sales_Price__c = this.selectedProducts[i].UnitPrice;

            if(this.oliList.length>0){
                this.showSaveButton = true;
            }
           
        }

       // console.log(' this.oliList----'+ this.oliList);

        // for(var i =0 ; i<this.selectedProducts.length ; i++){
        //     console.log('inside for loop');
        //     this.oliList[i].Sales_Price__c = this.selectedProducts[i].UnitPrice;
        // }
         //   console.log('olilist after for---'+JSON.stringify(this.oliList));
        // this.productList.pop(this.selectedProducts);
        // console.log('this.productList------'+this.productList);
    }else if(this.selectedProductsIds.length == 0){
      //  console.log('inside next else'+ this.selectedProductsIds.length);
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message : 'Select atleast one Product',
                variant : 'error',
            }),
        );
    }

    }

    handleBackClick(event){
        this.hideSearch = true;
        this.showSelectedProducts = false;
        this.isFirstScreen = true;
        this.oliList = [
            {
                Deal__c : '',
                Product1__c : '',
                Sales_Price__c : '',
                Quantity__c : '',             
                Discount__c : '',
                Description__c : '',
                
             //   PricebookEntryId : '',
            }
        ];
    }

    // handleTableLoad(event){
    //     console.log('inside load event');
    //     this.oliList[event.target.accessKey].Sales_Price__c = this.selectedProducts[event.target.accessKey].UnitPrice;
    // }


    handleInputChange(event){

        if(event.target.name === 'ProSalesPrice'){
          //  console.log('event.target.value-----'+event.target.value);
            this.oliList[event.target.accessKey].Sales_Price__c = event.target.value;
        }

        if(event.target.name ==='ProQuantity'){
          //  console.log('event.target.value----'+event.target.value);
          //  console.log('event.target.id----'+event.target.id);
         //   console.log('event.target.accessKey---'+event.target.accessKey);
          this.oliList[event.target.accessKey].Quantity__c = event.target.value;
         
         //   console.log('this.opportunityId----'+this.opportunityId);
             this.oliList[event.target.accessKey].Deal__c = this.recordId;
           // this.oliList[event.target.accessKey].PricebookEntryId = '01u5j000003MShbAAG';
          //  console.log('event.target.id----'+event.target.id);
            let productid = event.target.id;
            productid = productid.slice(0, 18);
            this.oliList[event.target.accessKey].Product1__c = productid;

            
        }
        if(event.target.name === 'ProDiscount'){
          //  console.log('event.target.value-------'+event.target.value);
            this.oliList[event.target.accessKey].Discount__c = event.target.value;

        }
        if(event.target.name === 'ProDescription'){
          //  console.log('event.target.value-------'+event.target.value);
            this.oliList[event.target.accessKey].Description__c = event.target.value;

        }
    }
    @track saveClicked = false;
    handleSave(){
        this.saveClicked = true;
      //  console.log('olilist----'+ JSON.stringify(this.oliList));
       // console.log('this.oliList.quantity------'+this.oliList.Quantity__c);

       // console.log('save clicked')
        this.template.querySelectorAll('lightning-input').forEach(element => {
            element.reportValidity();
        });
        let isQuantityfilled = true;
        for(var i = 0 ; i<this.oliList.length ; i++){
          //  console.log('inside for  this.oliList[i].Quantity__c '+ this.oliList[i].Quantity__c)
            
            if(this.oliList[i].Quantity__c == null || this.oliList[i].Quantity__c == ''){
                isQuantityfilled = false;
                this.saveClicked = false;
            }
        }
        if(isQuantityfilled == true){
        createOLI({OLIList : JSON.stringify(this.oliList)})
        .then(result=>{

          //  console.log('result--------'+JSON.stringify(result));
            this.message = JSON.stringify(result);
           // console.log('record created successfully');
            if(this.message != 'null'){
            this.dispatchEvent(
                new ShowToastEvent({
                    title : 'Success',
                    message : 'Products Added Successfully',
                    variant : 'success',

                }),

                
            );
            }else{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message : 'Error while Adding Product',
                        variant : 'error',
                    }),
                );
            }

            
                
            
            this.dispatchEvent(new CloseActionScreenEvent());
           eval("$A.get('e.force:refreshView').fire();");
            eval("$A.get('e.force:closeQuickAction').fire()");

             getRecordNotifyChange([{ recordId: this.recordId }]);
            return refreshApex(this.wireProductResult);
            return refreshApex(this.wiredProductResult);
            
        //     return getRecordNotifyChange(this.recordId);
          window.location.reload();

        })
        .catch(error =>{
         //   console.log('error------'+JSON.stringify(error));
         //   console.log('error occured');
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message : 'Error while Adding Product',
                    variant : 'error',
                }),
            );
        })
    }else{
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message : 'fill all required field',
                variant : 'error',
            }),
        );
    }
    }

    @track showSaveButton = true;

    removeRow(event){
      //  console.log('inside remove row event');
        this.selectedProducts.splice(event.target.accessKey, 1);
      //  console.log('selectedProducts-------'+this.selectedProducts);
        this.oliList.splice(event.target.accessKey, 1);
     //   console.log('this.oliList-------'+this.oliList);
        this.selectedProductsIds.splice(event.target.accessKey, 1);
     //   console.log(' this.selectedProductsIds-------'+ this.selectedProductsIds);
        if(this.oliList.length == 0){
            this.showSaveButton = false;
        }

    }

   renderedCallback() {
      return refreshApex(this.wiredDealResult);
    }

}
