# -*- coding: utf-8 -*-
import json

import scrapy
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.firefox.options import Options
from selenium.common.exceptions import TimeoutException

class ZomatoOffersSpider(scrapy.Spider):
    name = "zomatoOffers"
    spider_type = 'zomato'

    def __init__(self):
        options = Options()
        options.headless = False
        self.driver = webdriver.Firefox(options=options)
        # self.wait = WebDriverWait(self.driver, 10)

    def start_requests(self):
        crawl_number_of_pages = 1
        urls = [
            'https://www.zomato.com/dubai/restaurants?offers=1&page=1',
        ]
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        offers = []
        offers_json = {
            'spider_results': {
                'spider_type': ZomatoOffersSpider.spider_type,
                'results': []
            }
        }

        # use selenium to browse all infinite pages
        self.driver.get(response.url)
        # self.scroll_until_loaded()

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