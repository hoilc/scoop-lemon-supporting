import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(request, response) {
    response.setHeader('Vercel-CDN-Cache-Control', 'max-age=600');

    const dateRe = /\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}/g;

    const {pan, list, file, action} = request.query;

    const resp = await fetch(
        `http://c5.ysepan.com/f_ht/ajcx/wj.aspx?cz=dq&jsq=0&mlbh=${list}&wjpx=1&_dlmc=${pan}&_dlmm=`,
        {
            headers: {
                "Referer": 'http://c5.ysepan.com/f_ht/ajcx/000ht.html?bbh=1172'
            }
        }
    );

    const body = await resp.text();

    const encodedDetail = body.split(']').slice(-1);

    const decodedDetail = Buffer.from(encodedDetail[0], 'base64').toString('utf8');

    const $ = cheerio.load(decodedDetail);

    const filelist = $('li.xwj');
    console.log(`listed ${filelist.length} file(s)`);

    const matched = filelist.map(function(i, el) {
        const link = $(this).find('a').first();
        if (link.text() === file) {
            return {
                url: link.attr('href'),
                last_updated: $(this).text().match(dateRe)[0],
            };
        }
    }).get();

    console.log(`matched ${matched.length} file(s)`);

    if (matched.length > 0) {
        if (action === 'download') {
            console.log(`redirect to ${matched[0].url}`);
            return response.redirect(308, matched[0].url);
        } else if (action === 'lastupdated') {
            console.log(`last updated at ${matched[0].last_updated}`);
            return response.end(matched[0].last_updated);
        }
    }

    return response.status(404).end('404 Not Found');
}
