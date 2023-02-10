public class SearchProducts {
    
    @AuraEnabled(cacheable = true)
    public static Deal__c getDeal(string recordid){
        Deal__c dl = [select id, name , Stage__c from deal__c where id =: recordid];
        return dl;
    }
    
    @AuraEnabled(cacheable = true)
    public static list<product__c> getproductsWithoutSearch(string dealId){
        system.debug('dealId------'+dealId);
        list<line_item__c> createdLineItems = [select id, product1__c from line_item__c where Deal__c =: dealId];
        system.debug('createdLineItems-------'+createdLineItems);
        set<id> productsIds = new set<id>();
        if(createdLineItems.size()>0){
            for(line_item__c li :createdLineItems){
                system.debug('li,product'+ li.product1__c);
                productsIds.add(li.product1__c);
            }
        }
        list<Product__c> productlist2 = [select id, Name, Unit_Price__c, Sale_Price__c,  Product_Code__c, Product_Family__c from Product__c where id not in : productsIds];
            return productlist2;
    }
    
    
    @AuraEnabled(cacheable = true)
    public static list<Product__c> getProducts(string searchKey, string dealId){
        system.debug('dealId------'+dealId);
        list<line_item__c> createdLineItems = [select id, product1__c from line_item__c where Deal__c =: dealId];
        system.debug('createdLineItems-------'+createdLineItems);
        set<id> productsIds = new set<id>();
        if(createdLineItems.size()>0){
            for(line_item__c li :createdLineItems){
                system.debug('li,product'+ li.product1__c);
                productsIds.add(li.product1__c);
            }
        }
        system.debug('productsIds-----'+productsIds);
        
        list<product__c> productlist = new list<product__c>();
        if(searchKey != null && searchKey != ''){
        string keyString = '%'+ searchKey +'%';
        productlist = [select id, Name, Unit_Price__c, Discount__c, Product_Code__c, Product_Family__c from Product__c where (Name like : keyString or Product_Code__c like : keyString or Product_Family__c like : keyString) and id not in : productsIds];
        
        }else{
            productlist = [select id, Name, Unit_Price__c, Sale_Price__c,  Product_Code__c, Product_Family__c from Product__c where id not in : productsIds];
            
        }
       return productlist;
    }
    
    @AuraEnabled(cacheable = false)
    public static List<Line_Item__c> createOLI(String OLIList){
        try{
            list<Product__c> productlist2 = [select id, Name, Unit_Price__c, Sale_Price__c,  Product_Code__c from Product__c];
            
            map<id,string> productIdtoNameMap = new map<id,string>();
            for(product__c pd : productlist2){
                if(!productIdtoNameMap.containsKey(pd.id)){
                    productIdtoNameMap.put(pd.id, pd.name);
                }
            }
            
          //  for()
            
        List<Line_Item__c> oppProductList=(List<Line_Item__c>)JSON.deserialize(OLIList, List<Line_Item__c>.Class);
   		list<Line_Item__c> newolilist = new list<Line_Item__c>();
            if(!oppProductList.isEmpty()){
            for(Line_Item__c oli : oppProductList){
                if(oli.Deal__c != null  && oli.Product1__c != null  && oli.Quantity__c != null  ){
                Line_Item__c newoli = new Line_Item__c();
                newoli.Deal__c = oli.Deal__c;
                newoli.Product1__c  = oli.Product1__c;
                newoli.Name  = productIdtoNameMap.get(oli.Product1__c);
                //newoli.PricebookEntryId = productTpPriceBookmap.get(oli.Product2Id);
                newoli.Sales_Price__c = oli.Sales_Price__c;
                newoli.Quantity__c = oli.Quantity__c;
                newoli.Discount__c = oli.Discount__c;
                newoli.Description__c = oli.Description__c;
                newolilist.add(newoli);
            }
            }
        }
            system.debug('newolilist------'+newolilist);
            insert newolilist;
            return newolilist;
        }catch(DmlException e){
            system.debug('message------'+e.getMessage());
            return null;
        }
    }
    
    @AuraEnabled(cacheable = true)
    public static List<Line_Item__c> getLineItems(string dealId){
        if(dealId != null && dealId != ''){
            List<Line_Item__c> dealLineItems = [Select Id, Name, Product1__c, Sales_Price__c, Quantity__c, Discount__c, Description__c from Line_Item__c where Deal__c =: dealId];
            return dealLineItems;
        }else{
            return null;
        }
    }
    
    @AuraEnabled
    public static list<line_item__c> deleteLineItem(string lineItemId){
        if(lineItemId != null && lineItemId != ''){
            list<line_item__c> lineItemToDelete = [select id, name from line_item__c where id =: lineItemId];
            system.debug('lineItemToDelete-------'+lineItemToDelete);
            delete lineItemToDelete;
            return lineItemToDelete;
        }else{
            return null;
        }
    }
    
    @AuraEnabled
    public static list<line_item__c> updateLineItems(string updatedLineItems){
         List<Line_Item__c> oppProductList=(List<Line_Item__c>)JSON.deserialize(updatedLineItems, List<Line_Item__c>.Class);
          list<line_item__c> lineItemsTpUpdate = new list<line_item__c>();
        set<line_item__c> uniqueLineItems = new set<line_item__c>();
        for(line_item__c newLi : oppProductList){
           // line_item__c oldli = (line_item__c)trigger.oldmap.get(newLi.Id);
           // system.debug('oldli--------'+oldli);
            if(newLi != null ){
                uniqueLineItems.add(newLi);
            }
        }
        system.debug('uniqueLineItems size---'+uniqueLineItems.size());
         lineItemsTpUpdate.addAll(uniqueLineItems);
        system.debug('lineItemsTpUpdate size---'+lineItemsTpUpdate.size());
        
		system.debug('lineItemsTpUpdate------------------'+lineItemsTpUpdate);        
        if(lineItemsTpUpdate.size()>0){
            database.update(lineItemsTpUpdate, false);
            return lineItemsTpUpdate;
        }else{
            return null;
        }
    }
    
 /*    public class MainWrapper{
        public string opportunityId;
        public list<Line_Item__c> lineItemsList;
        
        public MainWrapper(string oppId, list<Line_Item__c> LIList){
            this.opportunityId = oppId;
            this.lineItemsList = LIList;
        }
    }
    
   @AuraEnabled(cacheable = true)
    public static void getLineItems(string dealId){
        list<Line_Item__c> dealLineItems = [select id, name, product1__c, deal__c from line_item__c where deal__c =: dealId];
        
    } */
    
    

}
