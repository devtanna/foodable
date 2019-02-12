# -*- coding: utf-8 -*-
import json

import scrapy
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.firefox.options import Options
from selenium.common.exceptions import TimeoutException

class TalabatOffersSpider(scrapy.Spider):
    name = "talabatOffers"

    def __init__(self):
        options = Options()
        options.headless = True
        self.driver = webdriver.Firefox(options=options)
        self.wait = WebDriverWait(self.driver, 10)

    def start_requests(self):
        urls = [
            'https://www.talabat.com/uae/restaurants/1256/difc',
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        offers = []
        offers_json = {
            'spider_results': {
                'spider_type': 'talabat',
                'results': []
            }
        }

        # use selenium to browse all infinite pages
        self.driver.get(response.url)
        self.scroll_until_loaded()
        
        location_id = response.url.split('/')[-2]
        location_pretty_name = response.url.split('/')[-1]

        # extract all the elements with special offers
        # We use selenium here as scrappy cannot see
        elems = self.driver.find_elements_by_xpath('//img[@alt="Talabat Offers"]/..')

        # append all the elements to a list
        results = []
        for elem in elems:
            raw_item = u'%s' % elem.find_element_by_xpath('./../..').text
            offers.append(raw_item)

            name_with_area, cuisine, ratings_number, payment_method, delivery_details, offer, _ = raw_item.split('\n')

            result_item = {
                'restaurant_location_pretty_name': location_pretty_name,
                'restaurant_location_pretty_id': '%s' % location_id,
                'restaurant_pretty_name': name_with_area.split(',')[0].encode('utf-8').strip(),
                'restaurant_cuisine_pretty_name': cuisine.encode('utf-8').strip(),
                'restaurant_offer': offer.encode('utf-8').strip(),
                'restaurant_delivery_details': delivery_details.encode('utf-8').strip(),
            }

            results.append(result_item)
        offers_json['spider_results']['results'] = results

        # construct file
        filename = 'results-listings-area-%s.json' % location_id
        # write json to file
        with open(filename, 'wb') as outfile:
            json.dump(offers_json, outfile, sort_keys = True, indent = 2, ensure_ascii = False)

        self.log('Saved file %s' % filename)
        # DONE. Quit.
        self.driver.quit();

    def scroll_until_loaded(self):
        check_height = self.driver.execute_script("return document.body.scrollHeight;")
        i = 0
        while True:
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            try:
                self.wait.until(lambda driver: self.driver.execute_script("return document.body.scrollHeight;")  > check_height)
                check_height = self.driver.execute_script("return document.body.scrollHeight;") 
            except TimeoutException:
                break
            i += 1
        print ">>>> looped %d times" % i