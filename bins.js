import puppeteer from "puppeteer";
import fs from "fs"



(async () => {
    
//launch browser
const browser = await puppeteer.launch({ 
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'] 
});
const page = await browser.newPage();
const result = [];

// Navigate to council bin collection website
await page.goto('https://www.west-dunbarton.gov.uk/recycling-and-waste/bin-collection-day/')

//set screen size
await page.setViewport({width: 1080, height: 1024});

//click cookie banner

await page.locator('button.btn:nth-child(2)').click();

 // Type into search box
 await page.type('#inputPostcode', 'G83 9DR');

 //click go
 await page.locator('button.btn-primary:nth-child(1)').click();


//select dropdown

await page.locator('#uprn').click();
await page.locator('#uprn').click();
for (let i = 0; i < 9; i++) {
  await page.keyboard.down("ArrowDown");
}

// Click Go
await page.locator('.btn-success').click()

//Scrape Round Name
// const roundtext = await page.waitForSelector('div.round-info:nth-child(1) > div:nth-child(2)',);
// const roundName = await roundtext?.evaluate(el => el.textContent);
// const dayText = await page.waitForSelector('div.round-info:nth-child(1) > div:nth-child(3) > span:nth-child(1)')
// const day = await dayText?.evaluate(el => el.textContent);
// const datetext = await page.waitForSelector('div.round-info:nth-child(1) > div:nth-child(3) > span:nth-child(2)')
// const date = await datetext?.evaluate(el => el.textContent); 
// console.log('This weeks bin is' ,roundName ,'on', day,'the',date);

   // Wait for the results to load
   await page.waitForSelector('.round-info', { timeout: 10000 }).catch(e => {
     console.log("Timeout waiting for .round-info selector:", e.message);
   });
   
   // First debug: Check what's on the page
   const pageContent = await page.evaluate(() => {
     // Log some debugging information to check what we have
     const rounds = document.querySelectorAll('.round-info');
     console.log("Found round-info elements:", rounds.length);
     
     // Return page content for debugging
     return {
       html: document.body.innerHTML,
       roundInfoCount: rounds.length
     };
   });
   
   console.log(`Found ${pageContent.roundInfoCount} round-info elements`);
   
   // If we found round-info elements, extract the data using individual selectors
   if (pageContent.roundInfoCount > 0) {
     // Extract data with individual selectors to avoid scope issues
     const binData = await page.evaluate(() => {
       const results = [];
       const rounds = document.querySelectorAll('.round-info');
       
       rounds.forEach(round => {
         try {
           const binTypeElement = round.querySelector('div:nth-child(2)');
           const dayElement = round.querySelector('div:nth-child(3) > span:nth-child(1)');
           const dateElement = round.querySelector('div:nth-child(3) > span:nth-child(2)');
           
           if (binTypeElement && dayElement && dateElement) {
             results.push({
               binType: binTypeElement.textContent.trim(),
               day: dayElement.textContent.trim(),
               date: dateElement.textContent.trim()
             });
           } else {
             console.log("Missing elements in a round-info section");
             console.log("- binTypeElement found:", !!binTypeElement);
             console.log("- dayElement found:", !!dayElement);
             console.log("- dateElement found:", !!dateElement);
           }
         } catch (error) {
           console.log("Error processing round:", error);
         }
       });
       
       return results;
     });
     
     console.log("Extracted bin data:", binData);
     
     // Write data to JSON file
     fs.writeFile('binCollections.json', JSON.stringify(binData, null, 2), (err) => {
       if (err) {
         console.log("Error writing JSON file:", err);
       } else {
         console.log("Bin collection data saved to binCollections.json");
       }
     });
   } else {
     // Alternative approach: Try to extract directly like your commented-out code
     const roundName = await page.$eval('div.round-info:nth-child(1) > div:nth-child(2)', el => el.textContent.trim())
       .catch(e => console.log("Error getting roundName:", e.message));
     
     const day = await page.$eval('div.round-info:nth-child(1) > div:nth-child(3) > span:nth-child(1)', el => el.textContent.trim())
       .catch(e => console.log("Error getting day:", e.message));
     
     const date = await page.$eval('div.round-info:nth-child(1) > div:nth-child(3) > span:nth-child(2)', el => el.textContent.trim())
       .catch(e => console.log("Error getting date:", e.message));
     
     console.log('Directly extracted: bin type:', roundName, 'on', day, 'the', date);
     
     if (roundName && day && date) {
       const binData = [{ binType: roundName, day, date }];
       fs.writeFile('binCollections.json', JSON.stringify(binData, null, 2), (err) => {
         if (err) {
           console.log("Error writing JSON file:", err);
         } else {
           console.log("Bin collection data saved to binCollections.json");
         }
       });
     } else {
       console.log("Failed to extract bin data");
     }
   }
   
   // Close the browser
   await browser.close();
 })();
