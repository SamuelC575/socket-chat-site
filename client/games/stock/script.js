const startButton = document.getElementById('startButton');

let running = false;
let chartOn = false;
let money = 2000;
let pause = false;

let initialized = false;

let interval;
let state;


startButton.addEventListener('click', () => {
    if (!running) {
        money = ((Math.round(money / 2 * 1000)) / 1000);

        startButton.textContent = "Pause";
        running = true;

        pause = false;

        buyInput.disabled = false;
        sellInput.disabled = false;
        delayInput.disabled = false;
        startButton.classList.remove('glow')

        start();
        return;
    }

    if (state) {
        pause = !pause;
        startButton.textContent = pause ? "Unpause" : "Pause";
    }
});


function start() {
    if (!initialized) {
        initOnce();
        initialized = true;
    }

    if (state && state.chart) {
        state.chart.remove(); // IMPORTANT: destroys canvas properly
    }

    if (interval) {
        clearInterval(interval);
        interval = null;
    }

    state = createState();

    pause = false;
    startButton.textContent = "Pause";

    interval = setInterval(loop, state.delay);
}

/* ---------------- LOOP ---------------- */

function loop() {
    if (pause || !state) return;

    updatePrice();

    state.now += 1;

    state.series.update({
        time: state.now,
        value: state.price
    });

    if (state.price <= 10) {
        state.series.update({
            time: state.now,
            value: -1000
        });

        document.getElementById("money").textContent = "BANKRUPT";
        money = -999999;
        endLoop();
    }
}


function endLoop() {
    running = false;
    chartOn = true;
    pause = false;
    startButton.textContent = "Start";
    startButton.classList.add('glow');

    buyInput.disabled = true;
    sellInput.disabled = true;
    delayInput.disabled = true;

    buyInput.textContent = "";
    sellInput.textContent = "";
    delayInput.textContent = "";

    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}


/* ---------------- INIT ONCE ---------------- */

function initOnce() {
    const buyInput = document.getElementById("buyInput");
    const sellInput = document.getElementById("sellInput");
    const delayInput = document.getElementById("delayInput");

    const buyButton = document.getElementById('buyButton');
    const sellButton = document.getElementById('sellButton');
    const cashoutButton = document.getElementById('cashoutButton');

    const menu1Button = document.getElementById('menu1Button');
    const menu2Button = document.getElementById('menu2Button');

    buyInput.addEventListener("input", filterInput);
    sellInput.addEventListener("input", filterInput);
    delayInput.addEventListener("input", filterInput);

    buyButton.addEventListener("click", buyShares);
    sellButton.addEventListener("click", sellShares);
    cashoutButton.addEventListener("click", cashout);

    menu1Button.addEventListener('click', function () {
        showMenu('menu1Button', 'menu1');
    });

    menu2Button.addEventListener('click', function () {
        showMenu('menu2Button', 'menu2');
    });

    menu3Button.addEventListener('click', function () {
        showMenu('menu3Button', 'menu3');
    });




}


/* ---------------- STATE ---------------- */

function createState() {
    const chart = LightweightCharts.createChart(
        document.getElementById("chart"),
        {
            width: 1700,
            height: 600,
            layout: {
                background: { color: "rgb(0, 0, 0)" },
                textColor: "rgb(255, 255, 255)"
            },
            grid: {
                vertLines: { color: "rgb(255, 255, 255)" },
                horzLines: { color: "rgb(90, 90, 90)" }
            }
        }
    );

    const lineSeries = chart.addLineSeries({
        color: "green"
    });

    return {
        price: 500,
        velocity: 0,
        change: 20,

        buyAmount: 0,
        sellAmount: 0,
        shareAmount: 0,

        delay: 100,
        now: Math.floor(Date.now() / 1000),

        chart,
        series: lineSeries
    };
}


/* ---------------- PRICE ---------------- */

function updatePrice() {
    const random =
        (Math.random() - 0.5) * state.change * 0.001;

    state.velocity += random;
    state.velocity *= 0.95;

    state.price *= 1 + state.velocity;

    if (!isFinite(state.price)) {
        state.price = 500;
        state.velocity = 0;
    }

    state.price = Math.round(state.price * 1000) / 1000;
}


/* ---------------- BUY / SELL / CASHOUT ---------------- */

function buyShares() {
    const price = state.price;

    if (money > price * state.buyAmount) {
        money -= price * state.buyAmount;
        state.shareAmount += state.buyAmount;
    } else if (money > 0) {
        let possible = Math.floor((money / price) * 1000) / 1000;
        money -= possible * price;
        state.shareAmount += possible;
    }

    updateUI();
}


function sellShares() {
    const price = state.price;

    if (state.sellAmount <= state.shareAmount) {
        state.shareAmount -= state.sellAmount;
        money += state.sellAmount * price;
    } else {
        money += state.shareAmount * price;
        state.shareAmount = 0;
    }

    updateUI();
}


function cashout() {
    money += state.shareAmount * state.price;
    state.shareAmount = 0;

    updateUI();

    endLoop();
}



function updateUI() {
    money = Math.round(money * 1000) / 1000;
    if (money < 0) money = 0;

    document.getElementById("money").textContent = `$${money}`;
    document.getElementById("shares").textContent =
        `Shares: ${state.shareAmount.toFixed(3)}`;
}



function filterInput(event) {
    const INPUT = event.target;
    let value = INPUT.value.replace(/[^0-9.]/g, "");

    const parts = value.split(".");
    if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
    }

    INPUT.value = value;

    if (!state) return;

    if (INPUT.id === "buyInput") state.buyAmount = Number(value);
    if (INPUT.id === "sellInput") state.sellAmount = Number(value);

    if (INPUT.id === "delayInput") {
        state.delay = Number(value);

        clearInterval(interval);
        interval = setInterval(loop, state.delay);
    }
}



function showMenu(buttonId, menuId) {
    document.querySelectorAll(".menu").forEach(m => m.classList.remove("active"));
    document.querySelectorAll(".menuButton").forEach(b => b.classList.remove("active"));

    document.getElementById(menuId).classList.add("active");
    document.getElementById(buttonId).classList.add("active");
}