FROM joyzoursky/python-chromedriver:3.7-selenium
ENV TZ=Asia/Jakarta
RUN apt-get install -y tzdata
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python","-u","scrapper.py"]