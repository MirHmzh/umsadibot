import time
import os
from datetime import datetime
import sys
import threading
import requests
import mysql.connector
from datetime import date
from selenium import webdriver
from pyquery import PyQuery as pq
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

bot_token = os.environ.get('BOT_TOKEN')

try:
    mydb = mysql.connector.connect(
        host=os.environ.get('DB_HOST'),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASS'),
        database=os.environ.get('DB_NAME')
    )
    print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+" DB Connected")
except Exception as e:
    print(datetime.now().strftime("%d/%m/%Y %H:%M:%S"))
    print(e)

mycursor = mydb.cursor()

today = date.today()
date_today = today.strftime("%d/%m/%Y")

options = webdriver.ChromeOptions()
if os.environ.get('ENV') == 'dev':
	options.add_argument("user-data-dir=/Users/amirudeen/Engineering/umsadibot_engine/chromeprofile")
else:
	options.add_argument("user-data-dir=/app/chromeprofile")
	options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
chrome_prefs = {}
options.experimental_options["prefs"] = chrome_prefs
chrome_prefs["profile.default_content_settings"] = {"images": 2}
if os.environ.get('ENV') == 'dev':
	chrome_path = r"/Users/amirudeen/Engineering/umsadibot_engine/chromedriver"
	driver = webdriver.Chrome(chrome_path, options=options)
	driver.maximize_window()
else:
	driver = webdriver.Chrome(options=options)

driver.set_page_load_timeout(15);

try:
	driver.get('https://sipresmawa.umsida.ac.id/mobile/login1.php')
except Exception as e:
	print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+" Failed to visiting login page, will try again")

print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+" Logged in")
try:
    print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+" Filling username")
    element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="text"]'))
    )
    driver.find_element_by_css_selector('input[type="text"]').send_keys(os.environ.get('SIPRES_USER'))
except TimeoutException:
    print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+' Unable to interract with username input after 10s')

try:
    print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+" Filling password")
    element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="password"]'))
    )
    driver.find_element_by_css_selector('input[type="password"]').send_keys(os.environ.get('SIPRES_PASS'))
except TimeoutException:
    print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+' Unable to interract with password input after 10s')

try:
    element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, 'button[name="login"]'))
    )
    driver.find_element_by_css_selector('button[name="login"]').click()
except TimeoutException:
    print('Unable to interract with submit login button after 10s')

past_event_title = []

def setInterval(func,time):
    e = threading.Event()
    while not e.wait(time):
        func()

def broadcast(evends):
	print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+" Broadcasting event")
	global mycursor
	mycursor.execute("SELECT subscriber FROM subscriber")

	myresult = mycursor.fetchall()
	# evends = [{'judul': 'Latihaaan Keterampilan Manajemen Mahasiswa Tingkat Dasar', 'kuota': '0 Kuota', 'tarif': 'Rp. 35.000', 'jadwal': '06 March 21', 'img': 'https://sipresmawa.umsida.ac.id/kegiatan/file/brosur/100827063620210306.jpeg'}, {'judul': 'Webinar Internasional "Modernisasi Pendidikan dalam Perspektif Said Nursi dan KH Ahmad Dahlan"', 'kuota': '0 Kuota', 'tarif': 'Rp. 0', 'jadwal': '09 March 21', 'img': 'https://sipresmawa.umsida.ac.id/kegiatan/file/brosur/020127060720210309.png'}, {'judul': 'WEBINAR KEPENULISAN', 'kuota': '0 Kuota', 'tarif': 'Rp.', 'jadwal': '20 March 21', 'img': 'https://sipresmawa.umsida.ac.id/kegiatan/file/brosur/040927060720210320.png'}, {'judul': 'Seminar Online Dakwah dalam Islam', 'kuota': '233 Kuota', 'tarif': 'Rp. 10.000', 'jadwal': '17 March 21', 'img': 'https://sipresmawa.umsida.ac.id/kegiatan/file/brosur/040727060720210317.png'}, {'judul': 'Peranan Bank Syariah Indonesia Terhadap Pengembangan Perekonomian Indonesia Berstandar Syariah', 'kuota': '0 Kuota', 'tarif': 'Rp. 0', 'jadwal': '06 March 21', 'img': 'https://sipresmawa.umsida.ac.id/kegiatan/file/brosur/030627060720210306.jpeg'}, {'judul': 'Seminar Nasional Fakultas Sains dan Teknologi UMSIDA “Pemanfaatan Renewable Energy Dalam Bidang Industri dan Pertanian Untuk Kesejahteraan Masyarakat yang Berkelanjutan”', 'kuota': '401 Kuota', 'tarif': 'Rp. 50.000', 'jadwal': '25 March 21', 'img': 'https://sipresmawa.umsida.ac.id/kegiatan/file/brosur/100127060720210325.jpeg'}, {'judul': 'ESSAY COMPETITION Peran Mahasiswa Dalam Perubahan Perilaku', 'kuota': '0 Kuota', 'tarif': 'Rp. 0', 'jadwal': '06 March 21', 'img': 'https://sipresmawa.umsida.ac.id/kegiatan/file/brosur/020927060720210306.jpg'}, {'judul': 'WEBINAR Metodelogi Penulisan Karya Ilmiah dan Tugas Akhir', 'kuota': '0 Kuota', 'tarif': 'Rp. 0', 'jadwal': '13 March 21', 'img': 'https://sipresmawa.umsida.ac.id/kegiatan/file/brosur/020927060720210313.jpg'}]
	for subscriber in myresult:
		requests.get('https://api.telegram.org/bot'+bot_token+'/sendMessage?chat_id='+subscriber[0]+'&text=Update SIPRESMAWA '+datetime.now().strftime("%d/%m/%Y %H:%M:%S")+', event baru cek dewe ya. Sing kuotane banyak pokoke')
		for evend in evends:
	  		kepsen = "Judul : "+evend['judul']+"\nKuota : "+evend['kuota']+"\nTarif : "+evend['tarif']+"\nJadwal : "+evend['jadwal']
	  		r =requests.get('https://api.telegram.org/bot'+bot_token+'/sendPhoto?chat_id='+subscriber[0]+'&photo='+evend['img']+'&caption='+kepsen)

def get_event():
	print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+" Parsing event")
	try:
		driver.get('https://sipresmawa.umsida.ac.id/mobile/daftar_kegiatan.php')
	except Exception as e:
		print(datetime.now().strftime("%d/%m/%Y %H:%M:%S")+" Failed to visiting event page")
	dom = driver.find_elements_by_class_name('col-md-3')
	events = []
	events_title = []
	global past_event_title
	for doms in dom:
		raw_comment = doms.get_attribute("innerHTML")
		splice1 = raw_comment.replace("<!-- DIRECT CHAT PRIMARY -->", "")
		splice2 = splice1.replace("<!-- /.box-header -->", "")
		splice3 = splice2.replace("<!-- Conversations are loaded here -->", "")
		splice4 = splice3.replace("<!-- ", "")
		splice5 = splice4.replace("-->", "")

		raw = pq(splice5)

		judul = raw('table tr:nth-child(1) td:nth-child(1) div center b').text()
		kuota = raw('table tbody tr:nth-child(2) td:nth-child(2) font b').text()
		tarif = raw('table tbody tr:nth-child(1) td:nth-child(2)').text()
		jadwal = raw('table tbody tr:nth-child(3) td:nth-child(2) i').text()
		raw_img = raw('.box-body div center a img').attr('src')
		img = raw_img.replace("..","https://sipresmawa.umsida.ac.id")
		judul = judul.replace("&", "dan")

		events_title.append(judul);
		events.append({
			'judul' : judul,
			'kuota' : kuota,
			'tarif' : tarif,
			'jadwal' : jadwal,
			'img' : img,
		});

	if ''.join(map(str, past_event_title)) != ''.join(map(str, events_title)):
		broadcast(events)

	past_event_title = events_title

get_event()
setInterval(get_event, 300)

driver.quit()