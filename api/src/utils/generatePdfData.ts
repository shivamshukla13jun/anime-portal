import path from 'path';
import ejs from 'ejs';
import * as puppeteer from 'puppeteer';
import config from 'config';
const broserconfig=config.isProduction?{
    executablePath: '/usr/bin/chromium-browser',
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
    ]
}: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
}
async function generatePDFData({template, data, retries=3, delay=5000,async=false}: {template: string, data: Record<string, any>, retries?: number, delay?: number,async?: boolean}): Promise<string> {
    const templatePath = path.resolve(template);
    const templateDir = path.dirname(templatePath);
    data.serverUrl = config.NODE_ENV !== 'development' ? process.env.PRODUCTIONURL as string : process.env.DEVELOPMENTURL as string;
    const renderHtml = async(): Promise<string> => {
        return new Promise((resolve, reject) => {
            ejs.renderFile(templatePath, data, {
                root: templateDir,
                async: async,
                views: [templateDir],
                rmWhitespace: true
            }, (err, str) => {
                if (err) reject(err);
                else resolve(str);
            });
        });
    };

    const createPDF = async (): Promise<string> => {
        try {
            const html = await renderHtml();
            const browser = await puppeteer.launch(broserconfig);
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfData = await page.pdf({
                printBackground: true,
                format:"A4",
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();
            return Buffer.from(pdfData).toString('base64');
        } catch (error) {
            console.warn('Error generating PDF:', error);
            throw error;
        }
    };

    const retryOperation = async (
        operation: () => Promise<string>,
        retries: number,
        delay: number
    ): Promise<string> => {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await operation();
            } catch (err) {
                if (attempt < retries - 1) {
                    console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw new Error(`All ${retries} attempts failed.`);
                }
            }
        }
        throw new Error("Unexpected error: retryOperation reached an unreachable point.");
    };

    return retryOperation(createPDF, retries, delay);
}



export { generatePDFData };