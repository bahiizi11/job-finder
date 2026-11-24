# NextSkill

NextSkill helps students decide which skill to learn next. Search a skill or job title, pick a country, and see how many jobs are open, the average salary, a salary chart and real job listings.

- **Live app:** https://www.arsenetech.tech
- **Demo video:** https://youtu.be/I0_i-6aMPPA

## Features

- Search by skill or job title, with an optional city and 8 countries
- Sort by relevance, newest or salary; filter by minimum salary, full-time or no senior roles
- Job count, average salary and a salary chart
- Filter loaded results by company or location
- Clear error messages and a responsive layout

## API

This app uses the **Adzuna Jobs API**: https://developer.adzuna.com/overview

- `/jobs/{country}/search` for listings, job count and average salary
- `/jobs/{country}/histogram` for the salary chart

The API keys stay on the server. The browser calls the Flask route `/api/jobs`, and Flask adds the keys from a `.env` file, which is listed in `.gitignore`. Searches are cached for 10 minutes to stay within the free limit (250 requests per day).

## Run locally

```bash
git clone https://github.com/bahiizi11/job-finder.git
cd job-finder
python -m venv venv
venv\Scripts\activate          # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file (see `.env.example`) with your keys from https://developer.adzuna.com:

```
ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
```

Run `python app.py` and open http://127.0.0.1:5000

## Deployment

| Server | Role | IP |
|---|---|---|
| web-01 | App server | 3.9.176.3 |
| web-02 | App server | 13.135.169.145 |
| lb-01 | Load balancer | 13.40.115.169 |

On **web-01 and web-02**:

1. Clone the repo, create the venv, install the requirements and add `.env` (same as running locally).
2. Run the app with Gunicorn as a systemd service, `/etc/systemd/system/nextskill.service`:

```ini
[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/job-finder
ExecStart=/home/ubuntu/job-finder/venv/bin/gunicorn --workers 2 --bind 127.0.0.1:5000 app:app
Restart=always
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now nextskill
```

3. Make Nginx a reverse proxy to Gunicorn, in `/etc/nginx/sites-available/default`:

```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_hide_header X-Served-By;
}
```

Nginx also adds an `X-Served-By` header with the server's hostname.

To update after a push: `git pull` and `sudo systemctl restart nextskill`

## Load balancer

HAProxy on lb-01 redirects HTTP to HTTPS, handles SSL for www.arsenetech.tech, and shares traffic between both servers with round robin:

```
backend web_servers
    balance roundrobin
    server 7337-web-01 3.9.176.3:80 check
    server 7337-web-02 13.135.169.145:80 check
```

`check` stops traffic to a server that goes down. The page footer shows "Served by web-01/web-02", so you can see the load balancer switching.

## Challenges

1. **API errors:** a typo (`htpps`) and unsaved `.env` values. I found them by printing the real error in the terminal.
2. **Hidden boxes still showing:** CSS `display: grid` overrode `hidden`, so I added a `[hidden]` rule.
3. **API rate limit:** fixed with a 10-minute cache.
4. **Service not starting on web-02:** typos in the service file, found with `journalctl`.
5. **Load balancer using an old IP:** I updated the HAProxy backend.
6. **CodeVibe score:** it shows a high AI % from typo fixes, with 0 AI events. See `codevibe-reports/NOTE.md`.

## Acknowledgements

- [Adzuna](https://www.adzuna.com) for the jobs API
- Flask, Requests, python-dotenv and Gunicorn
- Nginx, HAProxy and Let's Encrypt
- MDN Web Docs
- African Leadership University
