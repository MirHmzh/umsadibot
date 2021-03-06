FROM joyzoursky/python-chromedriver:3.7-selenium

COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python","-u","scrapper.py"]