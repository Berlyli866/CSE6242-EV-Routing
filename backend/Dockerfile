FROM python:3.7

ADD . /flaskApp
WORKDIR /flaskApp

# RUN apk add --update py-pip 
RUN apt-get update
RUN apt-get -y install libc-dev
RUN apt-get -y install build-essential
RUN pip install -U pip 

RUN pip install --no-cache-dir numpy==1.16.2 
RUN pip install --no-cache-dir pandas==0.24.2 
RUN pip install --no-cache-dir -r requirements.txt
COPY . /flaskApp

CMD python app.py