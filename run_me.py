#! /usr/bin/env python -u
# coding=utf-8
import urllib2
import settings

__author__ = 'xl'

from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template("index.html", webcam_addr=settings.webcam_addr)

@app.route('/get/<path:url>')
def get(url):
    print(url)
    response = urllib2.urlopen(url)
    html = response.read()
    return html

if __name__ == '__main__':
    host = "0.0.0.0" if settings.allow_remote_connection else "127.0.0.1"
    app.run(port=settings.port, debug=settings, host=host)