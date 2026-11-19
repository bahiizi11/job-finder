import os
import socket
import time

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request

load_dotenv()

app= Flask(__name__, static_folder="static",static_url_path="")

BASE_URL = "https://api.adzuna.com/v1/api/jobs"
COUNTRIES ={"gb", "us", "za", "ca", "au", "in","de", "fr"}
ALLOWED ={"what", "where", "sort_by", "salary_min", "full_time", "what_exclude"}
CACHE_SECONDS= 600
cache = {}


def adzuna(path,params):
    keys = {"app_id": os.getenv("ADZUNA_APP_ID"), "app_key": os.getenv("ADZUNA_APP_KEY")}
    response = requests.get(f"{BASE_URL}/{path}", params={**params, **keys}, timeout=10)
    response.raise_for_status()
    return response.json()


@app.after_request
def add_server_name(response):
    response.headers["X-Served-By"] = socket.gethostname()
    return response


@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/api/jobs")
def jobs():
    country= request.args.get("country", "gb")
    if country not in COUNTRIES:
        return jsonify(error="Unsupported country."), 400

    params= {k: v.strip() for k, v in request.args.items() if k in ALLOWED and v.strip()}
    if not params.get("what"):
        return jsonify(error="please enter a skill or a job title."), 400
    params["results_per_page"]= 20

    cache_key=(country, tuple(sorted(params.items())))
    saved= cache.get(cache_key)
    if saved and time.time() - saved["time"] < CACHE_SECONDS:
        return jsonify(saved["data"])

    try:
        search = adzuna(f"{country}/search/1",params)
        histogram = adzuna(f"{country}/histogram", {"what":params["what"]})
    except requests.RequestException as error:
        print(error)
        return jsonify(error="The job service is unavailable right now. Please try again later."), 502

    data ={
        "count": search.get("count",0),
        "mean": search.get("mean"),
        "jobs": search.get("results", []),
        "salaries": histogram.get("histogram", {}),
    }
    cache[cache_key] = {"time": time.time(), "data": data}
    return jsonify(data)


if __name__ =="__main__":
    app.run(debug=True)


