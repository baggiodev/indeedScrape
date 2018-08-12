const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
//creates a new jobs csv file so no repeat data
fs.writeFile("jobs.csv","",function(err){
    if (err) throw err;
});
//does the inital get request for all the href for locations
axios.get("https://www.indeed.jobs/career/Home#locations").then(function(res) {
    //loads cheerio to grab each mosaic
    let $ = cheerio.load(res.data);
    let cvs
    //runs through each mosaicimagelinkitem
    $(".mosaicImageLinksItem").each(function(i,e){
        let href = e.attribs.href;
        let span = $(this).children("span").text();
        //does another get request for the individual location 
        axios.get(href).then(function(res){
            //so I can use jQuery on this page
            let $ = cheerio.load(res.data);
            //a little recursion to see if theres a next button on the page
            function parseIT(nextHref){
                console.log(nextHref);
                axios.get(nextHref).then(function(res){
                    let $ = cheerio.load(res.data);
                    nextHref = $(".listPagination").children("a:contains('Next')").attr("href")
                    $(".listSingleColumnItem").each(function(index,element){
                        let href = $(this).children().children().attr("href");
                        let text = $(this).children().children().text().trim();
                        text = text.replace(/\s+/g," ")
                        text = text.replace(/,/g," ")
                        let title = text.match(/^.+-/g);
                        title = title[0]
                        let location = text.replace(/^.+-/g,"");
                        title = title.trim()
                        title = title.slice(0,-1);
                        title = title.trim()
                        cvs = `${title}, ${href}, ${location}\n`
                        fs.appendFile("jobs.csv",cvs,function(err){
                            if (err) throw err
                        });
                    });
                    if($(".listPagination").children("a:contains('Next')").attr("href")!=null){
                        parseIT(nextHref)
                    }else{
                        console.log("Done");
                    }
                })
            }
            //checks to see if there are multiple pages
            if($(".listPagination").children().length>0){
                //looks for the href with the next page
                let nextHref = $(".listPagination").children("a:contains('Next')").attr("href")
                //calls the recursive function
                parseIT(nextHref)
            }else{
                console.log("Done");
            }
            //does page 1 parse
            $(".listSingleColumnItem").each(function(index,element){
                //grabs href
                let href = $(this).children().children().attr("href");
                //grabs the text inside the href
                let text = $(this).children().children().text().trim();
                //replaces any multispace with just 1 space
                text = text.replace(/\s+/g," ")
                //replaces any commas with spaces to make parseing it easier
                text = text.replace(/,/g," ")
                //grab anything before a -
                let title = text.match(/^.+-/g);
                //make it into a string
                title = title[0]
                //replace anything before an - with nothing to grab the location
                let location = text.replace(/^.+-/g,"");
                //trim just in case
                title = title.trim()
                //get rid of the last character which is -
                title = title.slice(0,-1);
                //trim just in case
                title = title.trim()
                //create a giant string 
                cvs = `${title}, ${href}, ${location}\n`
                //append to the csv file
                fs.appendFile("jobs.csv",cvs,function(err){
                    if (err) throw err
                });
            })
        })
    });
})
