# 📊 RiskLens — Real-Time Risk Intelligence Dashboard

**Hackathon Project — IIT Kanpur CredTech Hackathon 2025**  
[👉 Repository Link](https://github.com/AYUSHTRIPATHI0/Risklens.git)

---

## 🚀 Overview
Traditional credit rating and risk assessment systems are **slow, opaque, and reactive**.  
**RiskLens** changes that by delivering a **real-time, explainable risk index** powered by financial market data, macroeconomic indicators, and news sentiment.  

It provides **analysts, investors, and regulators** with transparent, data-driven insights into company-level and sector-level risk — updated daily.

---

## 🔑 Core Features

### 1. Dynamic Risk Index & Heatmap
- 📌 **What it does:**  
  The main gauge shows a **real-time aggregate risk index (0–100)**.  
  A heatmap below provides a detailed view of **individual company scores** and their changes over **1, 7, 30, and 90 days**.  
- ⚡ **Powered by:** Alpha Vantage API (`TIME_SERIES_DAILY`).

---

### 2. Driver Breakdown
- 📌 **What it does:**  
  A **radial chart** explains what drives the score.  
  Factors include:  
  - **Volatility** (price fluctuations)  
  - **Liquidity** (trading volume)  
  - **Macroeconomic** (Federal Funds Rate)  
  - **Sentiment** (tone of financial headlines)  
- ⚡ **Powered by:** Alpha Vantage API (time series, Fed Funds Rate) + News API (`/v2/everything`).

---

### 3. Smart Alerts
- 📌 **What it does:**  
  Flags **significant daily changes (>8 points)** in risk score.  
  Each alert highlights the **company** and the **main trigger** (e.g., spike in volatility).  
- ⚡ **Powered by:** Alpha Vantage API (`TIME_SERIES_DAILY`).

---

### 4. Narrative Evidence Cards
- 📌 **What it does:**  
  Shows **latest financial news headlines** with sentiment scores, providing the **story behind the numbers**.  
- ⚡ **Powered by:** News API (`/v2/everything`).

---

### 5. Scenario Explorer
- 📌 **What it does:**  
  An **interactive simulator** where users apply hypothetical shocks (e.g., interest rate ↑, FX ↓).  
  Results show how the **risk index** would react across companies.  
- ⚡ **Powered by:** Client-side simulation (baseline from Alpha Vantage).  

---

## 🖥️ Tech Stack

- **Frontend:** Next.js, React, TailwindCSS  
- **Backend:** FastAPI (Python), Dockerized services  
- **Data Sources:**  
  - [Alpha Vantage API](https://www.alphavantage.co/) (stock series, macro indicators)  
  - [News API](https://newsapi.org/) (financial headlines & sentiment)  
- **Visualization:** Recharts, D3.js  
- **Deployment:** Vercel (frontend), Render/Railway (backend)

---

## ⚡ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/AYUSHTRIPATHI0/Risklens.git
   cd Risklens
