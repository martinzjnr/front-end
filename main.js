document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Toggle mobile menu
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    document.body.style.overflow = navMenu.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close mobile menu when clicking a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Add scroll shadow and background opacity effect
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 0) {
      navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
      navbar.style.background = "rgba(16, 18, 27, 0.95)";
    } else {
      navbar.style.boxShadow = "none";
      navbar.style.background = "rgba(16, 18, 27, 0.8)";
    }
  });

  // Add touch support for mobile devices
  let touchStartY = 0;
  let touchEndY = 0;

  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.changedTouches[0].screenY;
    },
    false
  );

  document.addEventListener(
    "touchend",
    (e) => {
      touchEndY = e.changedTouches[0].screenY;
      if (touchEndY < touchStartY && window.scrollY === 0) {
        navbar.style.transform = "translateY(-100%)";
      } else if (touchEndY > touchStartY) {
        navbar.style.transform = "translateY(0)";
      }
    },
    false
  );
});

// Initialize particles background
document.addEventListener("DOMContentLoaded", function () {
  const particlesContainer = document.getElementById("epg-particles");
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.className = "epg-particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDuration = Math.random() * 20 + 10 + "s";
    particle.style.animationDelay = Math.random() * 5 + "s";
    particlesContainer.appendChild(particle);
  }

  // Add live market data update simulation
  setInterval(updateMarketStats, 3000);
});

// Simulate market stats updates
function updateMarketStats() {
  const stats = document.querySelectorAll(".epg-stat-value");
  stats.forEach((stat) => {
    if (
      stat.parentElement
        .querySelector(".epg-stat-label")
        .textContent.includes("/")
    ) {
      const currentValue = parseFloat(
        stat.textContent.replace("$", "").replace(",", "")
      );
      const change = (Math.random() - 0.5) * 100;
      const newValue = currentValue + change;
      stat.textContent = "$" + newValue.toFixed(2);

      const changeElement =
        stat.parentElement.querySelector(".epg-stat-change");
      if (change > 0) {
        changeElement.textContent =
          "+" + ((change / currentValue) * 100).toFixed(2) + "%";
        changeElement.className = "epg-stat-change epg-positive";
      } else {
        changeElement.textContent =
          ((change / currentValue) * 100).toFixed(2) + "%";
        changeElement.className = "epg-stat-change epg-negative";
      }
    }
  });
}

// Add hover effects for buttons
document.querySelectorAll(".epg-cta-button").forEach((button) => {
  button.addEventListener("mousemove", (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    button.style.setProperty("--x", x + "px");
    button.style.setProperty("--y", y + "px");
  });
});

// Add intersection observer for scroll animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("epg-visible");
      }
    });
  },
  { threshold: 0.1 }
);

document
  .querySelectorAll(".epg-highlight-card, .epg-feature-item, .epg-stat-item")
  .forEach((el) => {
    observer.observe(el);
  });

// Add this to your JavaScript file
class CryptoPriceTracker {
  constructor() {
    this.prices = {};
    this.ws = null;
    this.updateInterval = null;
    this.init();
  }

  async init() {
    await this.fetchInitialPrices();
    this.setupWebSocket();
    this.setupUpdateInterval();
  }

  async fetchInitialPrices() {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"
      );
      const data = await response.json();
      this.updatePrices(data);
    } catch (error) {
      console.error("Error fetching initial prices:", error);
    }
  }

  setupWebSocket() {
    const wsUrl =
      "wss://stream.binance.com:9443/ws/btcusdt@trade/ethusdt@trade";
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const symbol = data.s.toLowerCase().replace("usdt", "");
      const price = parseFloat(data.p);

      if (this.prices[symbol]) {
        this.prices[symbol].price = price;
        this.updateUI(symbol);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.setupWebSocket(), 5000);
    };
  }

  setupUpdateInterval() {
    this.updateInterval = setInterval(() => this.fetchInitialPrices(), 60000);
  }

  updatePrices(data) {
    for (const [coin, values] of Object.entries(data)) {
      this.prices[coin] = {
        price: values.usd,
        change: values.usd_24h_change,
      };
      this.updateUI(coin);
    }
  }

  updateUI(coin) {
    const card = document.querySelector(`[data-symbol="${coin}"]`);
    if (!card) return;

    const priceElement = card.querySelector(".epg-coin-price");
    const changeElement = card.querySelector(".epg-price-change");

    const price = this.prices[coin].price;
    const change = this.prices[coin].change;

    priceElement.textContent = `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    changeElement.textContent = `${change >= 0 ? "+" : ""}${change.toFixed(
      2
    )}%`;
    changeElement.className = `epg-price-change ${
      change >= 0 ? "positive" : "negative"
    }`;

    card.classList.add("epg-price-update");
    setTimeout(() => card.classList.remove("epg-price-update"), 500);
  }
}

// Initialize the price tracker when the document is ready
document.addEventListener("DOMContentLoaded", () => {
  new CryptoPriceTracker();
});

// Add this to your JavaScript file
// Make sure to include vanilla-tilt.js library
document.addEventListener("DOMContentLoaded", () => {
  // Initialize tilt effect on feature cards
  VanillaTilt.init(document.querySelectorAll(".epg-feature-card"), {
    max: 5,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
    scale: 1.02,
  });
});

// Add this to your JavaScript file
document.addEventListener("DOMContentLoaded", () => {
  // Animate warning cards on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  document.querySelectorAll(".epg-warning-card").forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    observer.observe(card);
  });

  // Add click handler for report button
  const reportButton = document.querySelector(".epg-report-button");
  if (reportButton) {
    reportButton.addEventListener("click", () => {
      // Add your report functionality here
      alert("Report feature coming soon!");
    });
  }
});



// investment plans 

document.addEventListener('DOMContentLoaded', function() {
    const planData = {
        basic: { dailyProfit: 0.20, duration: 1 },
        standard: { dailyProfit: 0.30, duration: 1 },
        premium: { dailyProfit: 0.65, duration: 2 },
        elite: { dailyProfit: 0.80, duration: 2 }
    };

    const calculators = document.querySelectorAll('.epg_inv_x8k2_calc_input');
    
    calculators.forEach(calculator => {
        calculator.addEventListener('input', function() {
            const planCard = this.closest('.epg_inv_x8k2_plan_card');
            const planType = planCard.dataset.plan;
            const profitDisplay = planCard.querySelector('.epg_inv_x8k2_profit_value');
            const amount = parseFloat(this.value) || 0;
            
            if (amount < parseFloat(this.min) || amount > parseFloat(this.max)) {
                profitDisplay.style.color = '#ff4444';
                profitDisplay.textContent = 'Invalid Amount';
                return;
            }

            const { dailyProfit, duration } = planData[planType];
            const totalProfit = amount * dailyProfit * duration;
            
            profitDisplay.style.color = '#0099ff';
            profitDisplay.textContent = `$${totalProfit.toFixed(2)}`;

            // Add animation effect
            profitDisplay.style.transform = 'scale(1.1)';
            setTimeout(() => {
                profitDisplay.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // Add button click effect
    const investButtons = document.querySelectorAll('.epg_inv_x8k2_invest_btn');
    investButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planCard = this.closest('.epg_inv_x8k2_plan_card');
            const input = planCard.querySelector('.epg_inv_x8k2_calc_input');
            const amount = parseFloat(input.value) || 0;

            if (amount < parseFloat(input.min) || amount > parseFloat(input.max)) {
                alert('Please enter a valid investment amount within the plan range.');
                return;
            }

            // Add your investment processing logic here
            alert('Investment process initiated! Our team will contact you shortly.');
        });
    });

    // Add hover effects for features
    const features = document.querySelectorAll('.epg_inv_x8k2_feature');
    features.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
        });
        feature.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
});











// Initialize Vanilla-tilt.js for 3D card effect
VanillaTilt.init(document.querySelectorAll(".epg-feature-card"), {
  max: 15,
  speed: 400,
  glare: true,
  "max-glare": 0.2,
});

// Mini Chart Animation
const initMiniChart = () => {
  const ctx = document.getElementById('epg-mini-chart').getContext('2d');
  const gradientFill = ctx.createLinearGradient(0, 0, 0, 60);
  gradientFill.addColorStop(0, 'rgba(100, 255, 218, 0.3)');
  gradientFill.addColorStop(1, 'rgba(100, 255, 218, 0)');

  const generateData = () => {
    return Array.from({length: 20}, () => Math.random() * 50 + 25);
  };

  const chartData = {
    labels: Array.from({length: 20}, (_, i) => i),
    datasets: [{
      data: generateData(),
      borderColor: '#64ffda',
      borderWidth: 2,
      fill: true,
      backgroundColor: gradientFill,
      tension: 0.4,
      pointRadius: 0
    }]
  };

  const config = {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  };

  const chart = new Chart(ctx, config);

  // Update chart data periodically
  setInterval(() => {
    chart.data.datasets[0].data = generateData();
    chart.update('none');
  }, 2000);
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initMiniChart();
});

// Animate chat bubbles
const animateChatBubbles = () => {
  const bubbles = document.querySelectorAll('.epg-chat-bubble');
  bubbles.forEach((bubble, index) => {
    bubble.style.opacity = '0';
    setTimeout(() => {
      bubble.style.opacity = '1';
    }, index * 500);
  });
};

// Animate market bars
const animateMarketBars = () => {
  const bars = document.querySelectorAll('.epg-market-bar');
  bars.forEach((bar) => {
    bar.style.width = '0';
    setTimeout(() => {
      bar.style.width = '60%';
    }, 300);
  });
};

// Initialize animations
setInterval(animateChatBubbles, 5000);
animateMarketBars();








// butfktrjgrdujh
// Add ripple effect to buttons
const ctaButtons = document.querySelectorAll('.epg-mobile-cta-btn');

ctaButtons.forEach(button => {
  button.addEventListener('click', function(e) {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      pointer-events: none;
      width: 100px;
      height: 100px;
      left: ${x - 50}px;
      top: ${y - 50}px;
      transform: scale(0);
      animation: epg-ripple-effect 0.6s ease-out;
    `;

    button.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  });
});



// Hide/Show on scroll
let lastScrollTop = 0;
const ctaContainer = document.getElementById('epgMobileCta');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > lastScrollTop) {
    // Scrolling down
    ctaContainer.style.transform = 'translateY(100%)';
  } else {
    // Scrolling up
    ctaContainer.style.transform = 'translateY(0)';
  }
  
  lastScrollTop = scrollTop;
});











