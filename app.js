
const axios = require("axios");
const cheerio = require("cheerio");


axios.get("https://www.indeed.jobs/career/Home#locations").then(function(res) {
    let $ = cheerio.load(res.data);
    let cvs = "";
    $(".mosaicImageLinksItem").each(function(i,e){
        let string;
        let href = e.attribs.href;
        let span = $(this).children("span").text();
        console.log(`href: ${href} span: ${span}`);
        axios.get(href).then(function(res){
            let $ = cheerio.load(res.data);
            $(".listSingleColumnItem").each(function(index,element){
                let href = $(this).children().children().attr("href");
                let text = $(this).children().children().text().trim();
                text = text.replace(/\s+/g," ")
                let title = text.match(/^.+-/g);
                title = title[0]
                let location = text.replace(/^.+-/g,"");
                title = title.trim()
                title = title.slice(0,-1);
                title = title.trim()
                console.log("original: "+text);
                console.log("title: "+title);
                console.log("location: "+location);
                console.log("href: "+href)
            })
        })
    });
})
