function writeReceipts() {
  var targetFolder = DriveApp.getFoldersByName("Costco Receipts").next()
  var targetFolderIterator = targetFolder.getFilesByType("image/png")
  var destinationFolder = DriveApp.getFoldersByName("Processed Receipts").next()
  while (targetFolderIterator.hasNext()){
    var targetFile = targetFolderIterator.next()
    var target = targetFile.getBlob()
    var resource = {
      title: target.getName(),
      mimeType: target.getContentType()
    };
    var options = {
      ocr: true
    };
    var docFile = Drive.Files.insert(resource, target, options);
    var doc = DocumentApp.openById(docFile.id);
    var rawText = doc.getBody().getText()
    console.log(rawText)

    var productText = rawText.match("Member [0-9]*((\n.*)*)\nSUBTOTAL")[1]
    productText = productText.replace(RegExp("\n","g")," ")
    var productItems = productText.split(RegExp("([0-9]*\\.[0-9][0-9])"))
    console.log(productItems)
/*
    var priceText = rawText.match(" TOTAL((\n.*)*)\n--")[1]
    priceText = priceText.replace(RegExp("\n","g")," ")
    priceText = priceText.replace(RegExp("\\\)","g")," ")
    var priceItems = priceText.split(RegExp(" ([0-9]*\.[0-9]*)[-| ]"))
    console.log(priceItems)
*/
    var excelFile = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1LBaMe5K54Kzm13a2_-S5vv7aVChDI9oRIBMjxIYUyFc/edit#gid=0")
    excelFile.insertSheet()
    var targetSheet = excelFile.getActiveSheet()
    for(var i = 0; i < (productItems.length - 1)/2; i++){
      targetSheet.getRange("A"+ (i+1)).setValue(productItems[2*i].match(RegExp("[0-9]+")))
      targetSheet.getRange("B"+ (i+1)).setValue(productItems[2*i].match("[0-9]+(.*)")[1])
      targetSheet.getRange("C"+ (i+1)).setValue(productItems[2*i+1])
      targetSheet.getRange("D"+ (i+1)).setFormula("=IF(REGEXMATCH(TEXT(B"+(i+1)+",\"0\"),\"[a-zA-Z]\"),1,-1)")
      //console.log(productItems[2*i+1] + " " + productItems[2*i+2] + " " + priceItems[2*i+1] + " " + priceItems[2*i+2])  
    }
    
    //destinationFolder.addFile(targetFile)
    //targetFolder.removeFile(targetFile)
    Drive.Files.remove(docFile.id)
  }
}