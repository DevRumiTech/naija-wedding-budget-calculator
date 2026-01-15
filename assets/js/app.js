// --------------------
// UTILITIES
// --------------------
const formatMoney = (num) =>
    "₦" + Number(num).toLocaleString("en-NG", { maximumFractionDigits: 0 });
  
  // --------------------
  // THEME + YEAR (ALL PAGES)
  // --------------------
  const htmlEl = document.documentElement;
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) htmlEl.setAttribute("data-theme", savedTheme);
  
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  const lightBtn = document.getElementById("lightThemeBtn");
  const darkBtn = document.getElementById("darkThemeBtn");
  
  if (lightBtn && darkBtn) {
    lightBtn.onclick = () => {
      htmlEl.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    };
    darkBtn.onclick = () => {
      htmlEl.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    };
  }
  
  // --------------------
  // CALCULATOR (HOME ONLY)
  // --------------------
  const inputsDiv = document.getElementById("inputs");
  const resultsDiv = document.getElementById("results");
  
  if (inputsDiv && resultsDiv) {
  
    // --------------------
    // UI
    // --------------------
    inputsDiv.innerHTML = `
      <label>
        Guest Count
        <input type="number" id="guests" value="100" min="20" />
        <small>Minimum: 20 guests</small>
      </label>
  
      <label>
        Wedding Type
        <select id="type">
          <option value="traditional">Traditional</option>
          <option value="white">White</option>
          <option value="both">Traditional + White</option>
        </select>
      </label>
  
      <label>
        City / Region
        <select id="city">
          <option value="lagos">Lagos</option>
          <option value="abuja">Abuja</option>
          <option value="ibadan">Ibadan</option>
          <option value="benin">Benin City</option>
          <option value="owerri">Owerri</option>
          <option value="asaba">Asaba</option>
          <option value="uyo">Uyo</option>
          <option value="enugu">Enugu</option>
          <option value="ph">Port Harcourt</option>
          <option value="other">Other City</option>
        </select>
      </label>
  
      <label id="customRateWrap" style="display:none;">
        Cost Per Guest (₦)
        <input type="number" id="customRate" value="12000" min="1" />
        <small>Minimum: ₦1 per guest</small>
      </label>
    `;
  
    // --------------------
    // COST DATA
    // --------------------
    const cityRates = {
      lagos: 18000,
      abuja: 16000,
      ibadan: 12000,
      benin: 12000,
      owerri: 11000,
      asaba: 13000,
      uyo: 10000,
      enugu: 11000,
      ph: 14000,
    };
  
    const weddingMultipliers = {
      traditional: 1,
      white: 1.3,
      both: 1.6,
    };
  
    let breakdownData = {};
    let customExpenses = [];
  
    // --------------------
    // CALCULATION
    // --------------------
    function calculateBase() {
      const guestsInput = document.getElementById("guests");
      let guests = Number(guestsInput.value);
      if (guests < 20 || isNaN(guests)) guests = 20;
      guestsInput.value = guests;
  
      const type = document.getElementById("type").value;
      const city = document.getElementById("city").value;
  
      const customRateInput = document.getElementById("customRate");
      let rate =
        city === "other"
          ? Math.max(1, Number(customRateInput.value || 1))
          : cityRates[city];
  
      if (city === "other") customRateInput.value = rate;
  
      const base = guests * rate * weddingMultipliers[type];
  
      breakdownData = {
        Venue: base * 0.18,
        Catering: base * 0.35,
        Attire: base * 0.12,
        Decoration: base * 0.15,
        Media: base * 0.1,
        Entertainment: base * 0.07,
        Miscellaneous: base * 0.03,
      };
  
      renderResults();
    }
  
    // --------------------
    // RENDER RESULTS
    // --------------------
    function renderResults() {
      const breakdownTotal = Object.values(breakdownData).reduce((a, b) => a + b, 0);
      const customTotal = customExpenses.reduce((a, b) => a + b.amount, 0);
      const total = breakdownTotal + customTotal;
  
      let html = `<h3>Estimated Total: ${formatMoney(total)}</h3><ul>`;
  
      Object.keys(breakdownData).forEach((key) => {
        html += `
          <li>
            ${key}:
            <input type="number" value="${Math.round(breakdownData[key])}"
              data-key="${key}" class="edit-cost" />
          </li>
        `;
      });
  
      customExpenses.forEach((item, index) => {
        html += `
          <li>
            ${item.name}:
            <input type="number" value="${item.amount}"
              data-custom="${index}" class="edit-custom" />
          </li>
        `;
      });
  
      html += `
        </ul>
        <div style="margin-top:1rem;">
          <input type="text" id="customName" placeholder="Custom expense name" />
          <input type="number" id="customAmount" placeholder="Amount (₦)" />
          <button id="addCustom">Add Expense</button>
          <button id="resetCalc">Reset</button>
          <button id="exportPdf">Save / Export PDF</button>
        </div>
      `;
  
      resultsDiv.innerHTML = html;
      attachEvents();
    }
  
    // --------------------
    // EVENTS
    // --------------------
    function attachEvents() {
      document.querySelectorAll(".edit-cost").forEach((input) => {
        input.oninput = (e) => {
          breakdownData[e.target.dataset.key] = Number(e.target.value);
          renderResults();
        };
      });
  
      document.querySelectorAll(".edit-custom").forEach((input) => {
        input.oninput = (e) => {
          customExpenses[e.target.dataset.custom].amount = Number(e.target.value);
          renderResults();
        };
      });
  
      document.getElementById("addCustom").onclick = () => {
        const name = document.getElementById("customName").value.trim();
        const amount = Number(document.getElementById("customAmount").value);
        if (!name || amount <= 0) return;
        customExpenses.push({ name, amount });
        renderResults();
      };
  
      document.getElementById("resetCalc").onclick = () => {
        document.getElementById("guests").value = 20;
        document.getElementById("type").value = "traditional";
        document.getElementById("city").value = "lagos";
        document.getElementById("customRateWrap").style.display = "none";
        document.getElementById("customRate").value = 12000;
        customExpenses = [];
        calculateBase();
      };
  
      document.getElementById("exportPdf").onclick = () => window.print();
    }
  
    // --------------------
    // INPUT EVENTS
    // --------------------
    document.getElementById("city").onchange = (e) => {
      document.getElementById("customRateWrap").style.display =
        e.target.value === "other" ? "block" : "none";
      calculateBase();
    };
  
    inputsDiv.addEventListener("input", calculateBase);
  
    // --------------------
    // START
    // --------------------
    calculateBase();
  }
  
  