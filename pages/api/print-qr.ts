import { NextApiRequest, NextApiResponse } from "next";
// import {chromium } from "playwright";
// yarn add playwright -D if you need to install playwright
// resized outputs to 2.385" at 600dpi

export default async function handler(req: NextApiRequest, res: NextApiResponse){

    // const browser = await chromium.launch()
    // const page = await browser.newPage({
    //     viewport: {width: 1000,height: 1000}
    // })
    // for (let i = 1501; i < 2001; i++) {
    //     await page.goto(`http://localhost:3000/screenshot/qr?id=${i}`)
    //     await page.locator('id=card').screenshot({path: `qr/${i}.png`, omitBackground: true})
    // }

    // await browser.close()

    res.status(200).json({success: true})


}