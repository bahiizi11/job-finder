const form = document.getElementById("search-form");
const message= document.getElementById("message");
const summary=  document.getElementById("summary");
const results= document.getElementById("results");
const filterBox= document.getElementById("filter");

const CURRENCIES = {
    gb: "GBP" , us: "USD" , za: "ZAR" , ca: "CAD",
    au: "AUD" , in: "INR" , de: "EUR" , fr: "EUR",
};

let currentJobs =[];
let currentCountry ="gb";

function money(amount) {
    if(!amount) {
        return "Not listed";
    }
    return new Intl.NumberFormat("en",{
        style: "currency",
        currency: CURRENCIES[currentCountry],
        maximumFractionDigits: 0,
    }).format(amount);
}

function plainText(html){
    return new DOMParser().parseFromString(html || "", "text/html").body.textContent;
    }

    function showMessage(text, isError) {
        message.textContent = text;
        message.className = isError ? "error" : "";
    }

    function drawChart(salaries) {
        const chart = document.getElementById("salary-chart");
        chart.innerHTML = "<h3>Salary spread</h3>";
        const entries = Object.entries(salaries);
        if (entries.length === 0) {
            chart.innerHTML += "<p>No salary data for this search.</p>";
            return;
        }
        const highest = Math.max(...entries.map(([, count]) => count));
        entries.forEach(([salary, count]) => {
            const row = document.createElement("div");
            row.className = "bar-row";
            const label = document.createElement("span");
            label.className= "bar-label";
            label.textContent = money(Number(salary)) + "+";
            const bar = document.createElement("div");
            bar.className = "bar";
            bar.style.width = (count / highest) * 100 + "%";
            bar.title = count + " jobs";
            row.append(label, bar);
            chart.appendChild(row); 
        });
    }
    
    function drawJobs(jobs) {
        results.innerHTML = "";
        if(jobs.length === 0){
            results.innerHTML = "<p>No jobs match. Try a broader search.</p>";
            return;
        }
        jobs.forEach((job) => {
            const card = document.createElement("article");
            card.className = "job";

            const title = document.createElement("h3");
            title.textContent = plainText(job.title);

            const info = document.createElement("p");
            info.textContent = `${job.company?.display_name || "Unknown company"} - ${job.location?.display_name || ""}`;

            const pay = document.createElement("p");
            pay.textContent= `Salary: ${money(job.salary_min)} - ${money(job.salary_max)}`;
            
            const date = document.createElement("p");
            date.textContent = `Posted: ${new Date(job.created).toLocaleDateString()}`;

            const link = document.createElement("a");
            link.href = job.redirect_url;
            link.target = "_blank";
            link.rel = "noopener";
            link.textContent = "View and apply ";

            card.append(title, info, pay, date,link);
            results.appendChild(card);
        });
     }  

     form.addEventListener("submit", async (event) => {
        event.preventDefault();
        currentCountry = document.getElementById("country").value;

        const params = new URLSearchParams({
            what: document.getElementById("what").value,
            where: document.getElementById("where").value,
            country: currentCountry, 
            sort_by: document.getElementById("sort").value,
            salary_min: document.getElementById("salary-min").value,
        });
        if (document.getElementById("full-time").checked) {
            params.set("full_time", "1");
        }
        if (document.getElementById("no-senior").checked) {
            params.set("what_exclude", "senior lead principal");
        }

        showMessage("Searching...", false);
        summary.hidden = true;
        filterBox.hidden = true;
        results.innerHTML = "";

        try {
            const response = await fetch(`/api/jobs?${params}`);
            const data = await response.json();
            document.getElementById("server").textContent = `Served by ${response.headers.get("X-Served-By")}`;
            if (!response.ok) {
                showMessage(data.error, true);
                return;
            }
            currentJobs = data.jobs;
            showMessage("", false);
            document.getElementById("job-count").textContent = data.count.toLocaleString();
            document.getElementById("avg-salary").textContent = money(data.mean);
            drawChart(data.salaries);
            summary.hidden = false;
            filterBox.hidden =false;
            filterBox.value="";
            drawJobs(currentJobs);
        } catch (error) {
            showMessage("Could not reach the server. Check your connection and try again.", true); 
        }
    });

    filterBox.addEventListener("input", () => {
        const text = filterBox.value.toLowerCase();
        const matches = currentJobs.filter((job) =>
        `${job.company?.display_name} ${job.location?.display_name}`.toLowerCase().includes(text)
    );
    drawJobs(matches);
});    
    
