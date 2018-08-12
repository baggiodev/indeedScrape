
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
fs.writeFile("jobs.csv","",function(err){
    if (err) throw err;
});
axios.get("https://www.indeed.jobs/career/Home#locations").then(function(res) {
    let $ = cheerio.load(res.data);
    let cvs = "";
    $(".mosaicImageLinksItem").each(function(i,e){
        let cvs
        let href = e.attribs.href;
        let span = $(this).children("span").text();
        axios.get(href).then(function(res){
            let $ = cheerio.load(res.data);
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
            console.log($(".listPagination").children().length>0)
            if($(".listPagination").children().length>0){
                let nextHref = $(".listPagination").children("a:contains('Next')").attr("href")
                parseIT(nextHref)
            }else{
                console.log("Done");
            }
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
            })
        })
    });
})
