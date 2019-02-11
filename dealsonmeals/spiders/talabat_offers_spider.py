import scrapy
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

class TalabatOffersSpider(scrapy.Spider):
    name = "talabatOffers"

    def __init__(self):
        self.driver = webdriver.Firefox()
        self.wait = WebDriverWait(self.driver, 10)

    def start_requests(self):
        urls = [
            'https://www.talabat.com/uae/restaurants/1256/difc',
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        offers = []

        # use selenium to browse all infinite pages
        self.driver.get(response.url)
        self.scroll_until_loaded()
        
        # extract all the elements with special offers
        # We use selenium here as scrappy cannot see
        elems = self.driver.find_elements_by_xpath('//img[@alt="Talabat Offers"]/..')

        # append all the elements to a list
        for elem in elems:
            offers.append(u'%s' % elem.find_element_by_xpath('./../..').text)
        
        page = response.url.split("/")[-2]
        filename = 'listings-area-%s.txt' % page
        with open(filename, 'wb') as f:
            for offer in offers:
                f.write(offer.encode('utf-8').strip())
                f.write('\n')
                f.write('\n')
                f.write('\n')

        self.log('Saved file %s' % filename)

        # DONE. Quit.
        self.driver.quit();

    def scroll_until_loaded(self):
        check_height = self.driver.execute_script("return document.body.scrollHeight;")
        i = 0
        while i <= 1:
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            try:
                self.wait.until(lambda driver: self.driver.execute_script("return document.body.scrollHeight;")  > check_height)
                check_height = self.driver.execute_script("return document.body.scrollHeight;") 
            except TimeoutException:
                break
            i += 1
        print ">>>> looped %d times" % i