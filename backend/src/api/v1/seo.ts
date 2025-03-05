import { coreServiceLocator } from '../../serviceLocator';

const privateSettings = coreServiceLocator.get('privateSettings');



const handleRobots = function(req: Request, res) {
    let robotsTxtContent;

    if (privateSettings.ENVIRONMENT === 'production') {
        robotsTxtContent = 'User-Agent: rogerbot\nCrawl-Delay: 20\n\n' + 'User-Agent: *\nDisallow: /*?\nNoindex:  /*?';

    } else if (privateSettings.ENVIRONMENT === 'staging') {
        robotsTxtContent = 'User-Agent: rogerbot\nDisallow: /\n\n' + 'User-Agent: *\nDisallow: /*?\nNoindex:  /*?';
    }

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxtContent);
};


const handleGA = function(req: Request, res) {
    res.set('Content-Type', 'text/plain');
    res.send('google-site-verification: google11907a2edee3b022.html');
};



module.exports = function(app, callback) {

    app.get('/robots.txt', handleRobots);
    app.get('/google11907a2edee3b022.html', handleGA);

    // if (privateSettings.SITEMAP && privateSettings.SITEMAP.allowSitemap) {
    //     app.get('/sitemap.xml', handleSiteMapIndex);
    // }
    //
    // app.get('/sitemap-homes.xml', handleHomesSiteMap);
    // app.get('/sitemap-destinations.xml', handleDestinationsSiteMap);
    // app.get('/sitemap-products.xml', handleProductsSiteMap);
    // app.get('/sitemap-activities.xml', handleActivitiesSiteMap);
    // app.get('/sitemap-blogs.xml', handleBlogsSiteMap);
    //
    // app.put('/api/sitemap', basicAuthForScheduledTasks, handleSiteMapUpdate);

    callback();
};
