// Theme Toggle Functionality
// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('themeToggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Set initial theme
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
  
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    // Save theme preference
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
});


const StorageManager = {
    // Save estimate with offline timestamp
    saveEstimate: function(estimateData) {
        try {
            const estimates = this.getSavedEstimates();
            estimateData.id = Date.now().toString();
            estimateData.timestamp = new Date().toISOString();
            estimateData.isOffline = !navigator.onLine;
            
            estimates.unshift(estimateData);
            localStorage.setItem('roadEstimates', JSON.stringify(estimates));
            
            this.showOfflineStatus();
            return true;
        } catch (error) {
            console.error('Failed to save estimate:', error);
            return false;
        }
    },

    // Get all saved estimates
    getSavedEstimates: function() {
        try {
            const estimates = localStorage.getItem('roadEstimates');
            return estimates ? JSON.parse(estimates) : [];
        } catch (error) {
            console.error('Failed to get estimates:', error);
            return [];
        }
    },

    // Clear all history
    clearAllHistory: function() {
        try {
            localStorage.removeItem('roadEstimates');
            this.showOfflineStatus();
            return true;
        } catch (error) {
            console.error('Failed to clear history:', error);
            return false;
        }
    },

    // Export history as CSV
    exportHistory: function() {
        const estimates = this.getSavedEstimates();
        if (estimates.length === 0) {
            alert('No estimates to export!');
            return;
        }

        let csv = 'Intervention Type,Material Type,Quantity,Total Cost,Date\n';
        estimates.forEach(estimate => {
            csv += `"${estimate.interventionType}","${estimate.materialType}",${estimate.quantity},${estimate.totalCost},"${estimate.timestamp}"\n`;
        });

        this.downloadCSV(csv, 'road_estimates_export.csv');
    },

    // Download CSV file
    downloadCSV: function(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    // Show offline status indicator
    showOfflineStatus: function() {
        const statusElement = document.getElementById('offlineStatus') || this.createOfflineStatus();
        statusElement.textContent = navigator.onLine ? '✅ Online' : '⚠️ Working Offline';
        statusElement.className = navigator.onLine ? 'online-status' : 'offline-status';
    },

    // Create offline status element
    createOfflineStatus: function() {
        const statusElement = document.createElement('div');
        statusElement.id = 'offlineStatus';
        statusElement.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 1001;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(statusElement);
        return statusElement;
    }
};

// Network status detection
window.addEventListener('online', function() {
    StorageManager.showOfflineStatus();
    // Sync any pending data when coming online
    syncPendingData();
});

window.addEventListener('offline', function() {
    StorageManager.showOfflineStatus();
    showOfflineWarning();
});

function showOfflineWarning() {
    if (!document.getElementById('offlineWarning')) {
        const warning = document.createElement('div');
        warning.id = 'offlineWarning';
        warning.className = 'offline-warning';
        warning.innerHTML = '⚠️ You are currently offline. Your data will be saved locally and synced when connection returns.';
        document.querySelector('.estimator-card').prepend(warning);
    }
}

function syncPendingData() {
    // Here you can add synchronization with a backend when online
    const warning = document.getElementById('offlineWarning');
    if (warning) {
        warning.remove();
    }
    console.log('Syncing data...');
}

// Initialize offline status when page loads
document.addEventListener('DOMContentLoaded', function() {
    StorageManager.showOfflineStatus();
    if (!navigator.onLine) {
        showOfflineWarning();
    }
});


// Smooth Scrolling Function
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Add smooth scrolling to all navigation links
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    scrollToSection(targetId);
  });
});

// Form Elements
const estimatorForm = document.getElementById("estimatorForm");
const resultsSection = document.getElementById("resultsSection");
let costChart = null;

// AI Recommendations Database
const recommendations = {
  "Speed Breaker": {
    Urban:
      "For urban speed breakers, use rubber or plastic materials to reduce noise pollution. Install reflective strips for better night visibility in high-traffic areas.",
    Rural:
      "In rural areas, concrete speed breakers are durable and cost-effective. Ensure proper warning signage 100m before installation for driver safety.",
    Highway:
      "Highway speed breakers should be designed for higher speeds. Use gradual elevation changes and bright reflective materials for maximum safety.",
    Residential:
      "Residential areas benefit from rubber speed breakers that reduce noise. Consider decorative elements to blend with surroundings while maintaining effectiveness.",
  },
  "Guard Rail": {
    Urban:
      "Urban guard rails should prioritize pedestrian safety with smooth edges and anti-climb features. Use corrosion-resistant materials for longevity.",
    Rural:
      "Rural guard rails need weather resistance. Galvanized steel provides longevity with minimal maintenance requirements in varying weather conditions.",
    Highway:
      "Highway barriers require high-impact resistance. Use concrete or heavy-duty steel with proper anchoring systems to protect vehicles at high speeds.",
    Residential:
      "Residential guard rails can incorporate aesthetic elements while maintaining safety standards. Consider decorative metal options that complement the neighborhood.",
  },
  "Road Signage": {
    Urban:
      "Urban signage requires high-visibility retroreflective materials. Consider LED enhancement for critical intersections and heavy traffic areas.",
    Rural:
      "Rural signs need weather durability and enhanced reflectivity for low-light conditions. Use larger sizes for better visibility at distance.",
    Highway:
      "Highway signage must meet strict visibility standards. Use Type XI retroreflective sheeting and proper mounting heights for high-speed visibility.",
    Residential:
      "Residential signage can be smaller but should maintain clarity. Use vandal-resistant materials in accessible areas to prevent damage.",
  },
  "Street Light": {
    Urban:
      "Urban lighting should use LED technology with smart controls. Consider 30-35 lux illumination levels for pedestrian areas to ensure safety.",
    Rural:
      "Rural lighting benefits from solar-powered LED systems. Battery backup ensures reliability during power outages in remote areas.",
    Highway:
      "Highway lighting requires high-intensity LED fixtures with uniform distribution. Mount at 12-15m height for optimal coverage and visibility.",
    Residential:
      "Residential lighting should balance safety with light pollution concerns. Use warm LED temperatures (3000K) and directional fixtures.",
  },
  "Zebra Crossing": {
    Urban:
      "Urban crossings need thermoplastic paint with anti-slip properties. Add LED road studs for enhanced night visibility in busy pedestrian areas.",
    Rural:
      "Rural crossings require high-contrast materials. Use reflective paint and consider raised crossing design for natural speed control.",
    Highway:
      "Highway pedestrian crossings should include overhead lighting and flashing warning systems for maximum safety at high-speed locations.",
    Residential:
      "Residential crossings can incorporate artistic elements while maintaining standard visibility requirements for safe pedestrian movement.",
  },
  "Traffic Signal": {
    Urban:
      "Urban signals benefit from LED technology with countdown timers. Integrate with traffic management systems for optimization and flow management.",
    Rural:
      "Rural signals should have backup power systems and larger lens sizes for better daytime visibility in areas with unreliable power.",
    Highway:
      "Highway signals require redundant systems and overhead mounting for maximum visibility at high speeds. Include warning signs before signals.",
    Residential:
      "Residential signals can use smaller profiles with pedestrian-friendly features like audio signals and extended crossing times for safety.",
  },
};

// Timeline Calculation System
const timelineDatabase = {
  "Speed Breaker": {
    baseDays: 2,
    perUnit: 0.5,
    phases: {
      planning: 1,
      procurement: 2,
      sitePrep: 1,
      construction: 1,
      quality: 0.5,
      approval: 0.5,
    },
    locationMultipliers: {
      Urban: 1.2,
      Rural: 0.9,
      Highway: 1.5,
      Residential: 1.1,
    },
  },
  "Guard Rail": {
    baseDays: 3,
    perUnit: 0.8,
    phases: {
      planning: 2,
      procurement: 3,
      sitePrep: 2,
      construction: 2,
      quality: 1,
      approval: 1,
    },
    locationMultipliers: {
      Urban: 1.3,
      Rural: 1.0,
      Highway: 1.6,
      Residential: 1.2,
    },
  },
  "Road Signage": {
    baseDays: 1,
    perUnit: 0.2,
    phases: {
      planning: 0.5,
      procurement: 1,
      sitePrep: 0.5,
      construction: 0.5,
      quality: 0.3,
      approval: 0.2,
    },
    locationMultipliers: {
      Urban: 1.1,
      Rural: 0.8,
      Highway: 1.3,
      Residential: 1.0,
    },
  },
  "Street Light": {
    baseDays: 4,
    perUnit: 1.2,
    phases: {
      planning: 2,
      procurement: 4,
      sitePrep: 2,
      construction: 3,
      quality: 1,
      approval: 1,
    },
    locationMultipliers: {
      Urban: 1.1,
      Rural: 1.2,
      Highway: 1.4,
      Residential: 1.0,
    },
  },
  "Zebra Crossing": {
    baseDays: 2,
    perUnit: 0.4,
    phases: {
      planning: 1,
      procurement: 2,
      sitePrep: 1,
      construction: 1,
      quality: 0.5,
      approval: 0.5,
    },
    locationMultipliers: {
      Urban: 1.3,
      Rural: 0.9,
      Highway: 1.5,
      Residential: 1.1,
    },
  },
  "Traffic Signal": {
    baseDays: 5,
    perUnit: 1.5,
    phases: {
      planning: 3,
      procurement: 5,
      sitePrep: 2,
      construction: 4,
      quality: 2,
      approval: 2,
    },
    locationMultipliers: {
      Urban: 1.2,
      Rural: 1.1,
      Highway: 1.6,
      Residential: 1.0,
    },
  },
};

// Timeline recommendations database
const timelineRecommendations = {
  "Speed Breaker": {
    Urban:
      "Urban speed breakers require traffic management plans. Schedule work during low-traffic hours (10 AM - 3 PM) to minimize disruption.",
    Rural:
      "Rural projects can proceed continuously. Consider weather conditions and plan for material delivery delays.",
    Highway:
      "Highway installations require night work and proper safety measures. Allocate extra time for safety protocols.",
    Residential:
      "Coordinate with residents and schedule work during weekdays to avoid weekend disturbances.",
  },
  "Guard Rail": {
    Urban:
      "Urban guard rails need pedestrian safety measures. Work in sections to maintain traffic flow.",
    Rural:
      "Rural guard rails can be installed faster but consider terrain challenges and equipment access.",
    Highway:
      "Highway guard rails require lane closures. Plan for night work and proper signage.",
    Residential:
      "Residential areas need careful planning to avoid blocking driveways and access routes.",
  },
  "Road Signage": {
    Urban:
      "Urban signage installation is quick but requires traffic management. Use mobile teams for efficiency.",
    Rural:
      "Rural signage may require longer travel times between locations. Plan routes efficiently.",
    Highway:
      "Highway signs need proper safety setups. Work during low-traffic periods.",
    Residential:
      "Residential signs can be installed quickly with minimal disruption.",
  },
  "Street Light": {
    Urban:
      "Urban lighting requires electrical work coordination. Plan for underground cable laying time.",
    Rural:
      "Rural projects may need solar installations. Consider weather-dependent work schedules.",
    Highway:
      "Highway lighting requires specialized equipment and night work schedules.",
    Residential:
      "Residential lighting can be scheduled during daytime with proper community notice.",
  },
  "Zebra Crossing": {
    Urban:
      "Urban crossings need traffic diversion plans. Use quick-drying materials for minimal disruption.",
    Rural:
      "Rural crossings can be completed quickly with proper material preparation.",
    Highway:
      "Highway pedestrian crossings require extensive safety measures and night work.",
    Residential:
      "Residential crossings should be scheduled when children are in school to ensure safety.",
  },
  "Traffic Signal": {
    Urban:
      "Urban signals require coordination with traffic police and utility companies. Plan for extended timelines.",
    Rural:
      "Rural signals may need power line extensions. Include utility work in timeline.",
    Highway:
      "Highway signals require sophisticated equipment and extended safety protocols.",
    Residential:
      "Residential signals need community coordination and careful timing to minimize disruption.",
  },
};

// Environmental Impact Calculator
const environmentalDatabase = {
  Concrete: {
    carbonPerUnit: 0.15, // kg CO2 per kg
    waterPerUnit: 5, // liters per kg
    transportation: 0.02, // kg CO2 per km per kg
    maintenance: 0.05, // kg CO2 per year per kg
  },
  Asphalt: {
    carbonPerUnit: 0.08,
    waterPerUnit: 2,
    transportation: 0.015,
    maintenance: 0.08,
  },
  Metal: {
    carbonPerUnit: 2.5,
    waterPerUnit: 20,
    transportation: 0.03,
    maintenance: 0.02,
  },
  Plastic: {
    carbonPerUnit: 3.0,
    waterPerUnit: 15,
    transportation: 0.01,
    maintenance: 0.01,
  },
  Composite: {
    carbonPerUnit: 1.2,
    waterPerUnit: 8,
    transportation: 0.02,
    maintenance: 0.03,
  },
};

// Eco-friendly alternatives database
const ecoAlternatives = {
  Concrete: [
    {
      name: "Recycled Concrete Aggregate",
      benefit: "Uses 95% recycled materials, reduces landfill waste",
      impact: "Carbon reduction: 60%",
      icon: "🔄",
    },
    {
      name: "Geopolymer Concrete",
      benefit: "Uses industrial byproducts, lower energy consumption",
      impact: "Carbon reduction: 80%",
      icon: "🏭",
    },
  ],
  Asphalt: [
    {
      name: "Warm Mix Asphalt",
      benefit: "Lower production temperature, reduced emissions",
      impact: "Carbon reduction: 30%",
      icon: "🌡️",
    },
    {
      name: "Recycled Asphalt Pavement",
      benefit: "Reuses existing materials, conserves resources",
      impact: "Carbon reduction: 50%",
      icon: "♻️",
    },
  ],
  Metal: [
    {
      name: "Recycled Steel",
      benefit: "Uses scrap metal, significantly lower energy",
      impact: "Carbon reduction: 75%",
      icon: "🔩",
    },
    {
      name: "Aluminum Alloy",
      benefit: "Lighter weight, corrosion resistant, recyclable",
      impact: "Carbon reduction: 40%",
      icon: "⚖️",
    },
  ],
  Plastic: [
    {
      name: "Recycled Plastic Lumber",
      benefit: "Diverts plastic waste, durable and maintenance-free",
      impact: "Carbon reduction: 70%",
      icon: "🪵",
    },
    {
      name: "Bio-based Polymers",
      benefit: "Renewable sources, biodegradable options",
      impact: "Carbon reduction: 60%",
      icon: "🌽",
    },
  ],
  Composite: [
    {
      name: "Natural Fiber Composites",
      benefit: "Uses bamboo, hemp, or jute fibers",
      impact: "Carbon reduction: 50%",
      icon: "🎋",
    },
    {
      name: "Recycled Composite Materials",
      benefit: "Combines multiple recycled materials",
      impact: "Carbon reduction: 45%",
      icon: "🔄",
    },
  ],
};

// Environmental recommendations
const environmentalRecommendations = {
  "Speed Breaker": {
    Urban:
      "Consider rubber speed breakers with recycled content. Install solar-powered warning signs to reduce ongoing energy consumption.",
    Rural:
      "Use locally sourced natural materials where possible. Implement rainwater harvesting during construction.",
    Highway:
      "Optimize material transportation routes. Use reflective materials that require less maintenance.",
    Residential:
      "Choose permeable materials to support groundwater recharge. Incorporate green spaces around installations.",
  },
  "Guard Rail": {
    Urban:
      "Select galvanized steel for longevity. Use powder coating instead of paint to reduce VOC emissions.",
    Rural:
      "Consider timber alternatives from sustainable sources. Implement wildlife-friendly designs.",
    Highway:
      "Use high-recycled-content steel. Optimize installation to minimize habitat disruption.",
    Residential:
      "Choose aesthetically pleasing designs that blend with environment. Use recycled plastic composites.",
  },
  "Road Signage": {
    Urban:
      "Use LED signage with solar power. Select aluminum with high recycled content.",
    Rural:
      "Implement solar-powered signs. Use durable materials to reduce replacement frequency.",
    Highway:
      "Choose retroreflective materials that require less energy for illumination. Optimize sign placement.",
    Residential:
      "Use smaller, more frequent signs with eco-friendly materials. Consider wooden posts from sustainable sources.",
  },
  "Street Light": {
    Urban:
      "Install LED fixtures with smart controls. Use solar-powered options where feasible.",
    Rural:
      "Implement solar LED lighting. Use motion sensors to reduce energy consumption.",
    Highway:
      "Choose high-efficiency LEDs with proper shielding. Implement smart lighting systems.",
    Residential:
      "Use warm-colored LEDs to reduce light pollution. Install timers and dimmers.",
  },
  "Zebra Crossing": {
    Urban:
      "Use thermoplastic with recycled content. Install solar-powered pedestrian signals.",
    Rural:
      "Choose durable, low-maintenance materials. Use natural stone or recycled aggregates.",
    Highway:
      "Implement high-visibility materials with long lifespan. Use LED road studs.",
    Residential:
      "Use permeable paving materials. Incorporate artistic elements with eco-friendly paints.",
  },
  "Traffic Signal": {
    Urban:
      "Install LED signals with solar backup. Use smart traffic management systems.",
    Rural:
      "Implement solar-powered systems. Use efficient controllers to minimize energy use.",
    Highway:
      "Choose durable materials with high recycled content. Implement vehicle detection systems.",
    Residential:
      "Use energy-efficient LED signals. Install pedestrian-friendly timing systems.",
  },
};

// ==================== AUTO-CALCULATE MATERIAL COSTS ====================
const materialCostDatabase = {
  Concrete: {
    min: 4000,
    max: 5000,
    unit: "per cubic meter",
    description: "Standard concrete mix for construction",
  },
  Asphalt: {
    min: 3500,
    max: 4500,
    unit: "per ton",
    description: "Bituminous asphalt for road surfaces",
  },
  Metal: {
    min: 60000,
    max: 70000,
    unit: "per ton",
    description: "Structural steel for guard rails and supports",
  },
  Plastic: {
    min: 110000,
    max: 130000,
    unit: "per ton",
    description: "Recycled plastic for eco-friendly solutions",
  },
  Composite: {
    min: 80000,
    max: 90000,
    unit: "per ton",
    description: "Fiber-reinforced composite materials",
  },
};

// Auto-fill material cost when material type is selected
document.getElementById("materialType").addEventListener("change", function () {
  const selectedMaterial = this.value;
  const materialCostInput = document.getElementById("materialCost");

  if (selectedMaterial && materialCostDatabase[selectedMaterial]) {
    const materialData = materialCostDatabase[selectedMaterial];
    const avgCost = Math.round((materialData.min + materialData.max) / 2);

    // Set the calculated average cost
    materialCostInput.value = avgCost;

    // Show cost range information
    showMaterialCostInfo(selectedMaterial);

    // Show notification
    showNotification(
      `💰 ${selectedMaterial} cost auto-filled: ₹${avgCost.toLocaleString()}`
    );
  } else if (selectedMaterial) {
    // Clear if no data available
    materialCostInput.value = "";
    hideMaterialCostInfo();
  }
});

// Show material cost information
function showMaterialCostInfo(materialType) {
  const materialData = materialCostDatabase[materialType];
  let infoContainer = document.getElementById("materialCostInfo");

  if (!infoContainer) {
    infoContainer = document.createElement("div");
    infoContainer.id = "materialCostInfo";
    infoContainer.className = "material-cost-info";

    // Insert after material cost input
    const materialCostGroup = document
      .querySelector("#materialCost")
      .closest(".form-group");
    materialCostGroup.appendChild(infoContainer);
  }

  infoContainer.innerHTML = `
    <div class="cost-range">
      <span class="range-label">💡 Typical Price Range:</span>
      <span class="range-value">₹${materialData.min.toLocaleString()} - ₹${materialData.max.toLocaleString()} ${
    materialData.unit
  }</span>
    </div>
    <div class="material-description">${materialData.description}</div>
    <div class="cost-note">You can adjust this value based on your specific requirements</div>
  `;

  infoContainer.style.display = "block";
}

function hideMaterialCostInfo() {
  const infoContainer = document.getElementById("materialCostInfo");
  if (infoContainer) {
    infoContainer.style.display = "none";
  }
}

// Also update labor cost based on intervention type
document
  .getElementById("interventionType")
  .addEventListener("change", function () {
    const selectedIntervention = this.value;
    const laborCostInput = document.getElementById("laborCost");

    if (selectedIntervention) {
      const laborCosts = {
        "Speed Breaker": 1500,
        "Guard Rail": 2500,
        "Road Signage": 800,
        "Street Light": 3500,
        "Zebra Crossing": 1200,
        "Traffic Signal": 5000,
      };

      if (laborCosts[selectedIntervention]) {
        laborCostInput.value = laborCosts[selectedIntervention];
        showNotification(
          `👷 ${selectedIntervention} labor cost suggested: ₹${laborCosts[
            selectedIntervention
          ].toLocaleString()}`
        );
      }
    }
  });

// ==================== COST SAVING TIPS ====================
function showCostSavingTips(interventionType, materialType, totalCost) {
  const materialTips = {
    Concrete:
      "💡 Use recycled concrete aggregate to save 15-20% on material costs",
    Asphalt:
      "💡 Consider warm mix asphalt technology for 20-30% energy savings",
    Metal:
      "💡 Use galvanized steel instead of stainless steel to reduce costs by 40%",
    Plastic:
      "💡 Local recycled plastic composites can save 25% and are eco-friendly",
    Composite:
      "💡 Natural fiber composites reduce costs by 30% and are sustainable",
  };

  const interventionTips = {
    "Speed Breaker":
      "🛑 Rubber speed breakers have 50% lower maintenance costs than concrete",
    "Guard Rail":
      "🚧 Powder coating increases lifespan by 5 years vs regular painting",
    "Road Signage":
      "🪧 Aluminum composite panels offer better durability at lower cost",
    "Street Light":
      "💡 Solar LED lights can reduce electricity costs by 80% annually",
    "Zebra Crossing":
      "🚶 Thermoplastic paint lasts 3x longer than regular road paint",
    "Traffic Signal":
      "🚦 LED signals use 85% less energy than incandescent bulbs",
  };

  // Remove existing tips if any
  const existingTips = document.querySelector(".cost-saving-tips");
  if (existingTips) {
    existingTips.remove();
  }

  let tipHTML = `
    <div class="cost-saving-tips">
      <h5>💰 Smart Cost Saving Tips</h5>
      <div class="tips-grid">
  `;

  // Add material-specific tip
  if (materialTips[materialType]) {
    tipHTML += `<div class="tip-item">${materialTips[materialType]}</div>`;
  }

  // Add intervention-specific tip
  if (interventionTips[interventionType]) {
    tipHTML += `<div class="tip-item">${interventionTips[interventionType]}</div>`;
  }

  // Add general tips
  tipHTML += `
        <div class="tip-item">📦 Bulk purchasing can save 10-15% on material costs</div>
        <div class="tip-item">🏗️ Local materials reduce transportation costs by 20-30%</div>
        <div class="tip-item">🌱 Eco-friendly options often have better long-term savings</div>
      </div>
      <div class="tips-footer">
        <small>💡 These are estimated savings based on industry standards</small>
      </div>
    </div>
  `;

  // Insert before the chart container
  const chartContainer = document.querySelector(".chart-container");
  if (chartContainer) {
    chartContainer.insertAdjacentHTML("beforebegin", tipHTML);
  } else {
    // Fallback: insert before results actions
    const resultsActions = document.querySelector(".results-actions");
    if (resultsActions) {
      resultsActions.insertAdjacentHTML("beforebegin", tipHTML);
    }
  }
}

// History Management System
let projectHistory = StorageManager.getSavedEstimates();

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  updateHistoryDisplay();
  updateHistoryStats();
});

// Form Submission Handler
estimatorForm.addEventListener("submit", (e) => {
  e.preventDefault();
  calculateEstimate();
});

// Main Calculation Function
function calculateEstimate() {
  // Get all form values
  const interventionType = document.getElementById("interventionType").value;
  const materialType = document.getElementById("materialType").value;
  const quantity = parseFloat(document.getElementById("quantity").value);
  const locationType = document.getElementById("locationType").value;
  const laborCost = parseFloat(document.getElementById("laborCost").value);
  const materialCost = parseFloat(
    document.getElementById("materialCost").value
  );

  // Validate all inputs
  if (
    !interventionType ||
    !materialType ||
    !quantity ||
    !locationType ||
    !laborCost ||
    !materialCost
  ) {
    alert("⚠️ Please fill in all fields before calculating!");
    return;
  }

  if (quantity <= 0 || laborCost < 0 || materialCost < 0) {
    alert("⚠️ Please enter valid positive numbers!");
    return;
  }

  // Calculate total costs
  const totalMaterialCost = materialCost * quantity;
  const totalLaborCost = laborCost * quantity;
  const grandTotal = totalMaterialCost + totalLaborCost;

  // Currency formatting function
  const formatCurrency = (amount) => {
    return (
      "₹" +
      amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  // Display calculated results
  document.getElementById("totalMaterialCost").textContent =
    formatCurrency(totalMaterialCost);
  document.getElementById("totalLaborCost").textContent =
    formatCurrency(totalLaborCost);
  document.getElementById("grandTotal").textContent =
    formatCurrency(grandTotal);

  // Update display fields
  updateDisplayFields(
    interventionType,
    materialType,
    quantity,
    locationType,
    materialCost,
    laborCost
  );

  // Get and display AI recommendation
  const recommendation = recommendations[interventionType][locationType];
  document.getElementById("recommendation").textContent = recommendation;

  showCostSavingTips(interventionType, materialType, grandTotal);

  // Calculate and display timeline
  const totalDuration = updateTimeline(interventionType, quantity);
  document.getElementById("displayDuration").textContent =
    totalDuration + " day" + (totalDuration !== 1 ? "s" : "");

  // Calculate and display environmental impact
  updateEnvironmentalImpact(
    interventionType,
    materialType,
    quantity,
    locationType,
    materialCost
  );

  // Show results section with smooth animation
  resultsSection.style.display = "block";
  resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Create or update cost breakdown chart
  createCostChart(totalMaterialCost, totalLaborCost);
}

// Update display fields function
function updateDisplayFields(
  interventionType,
  materialType,
  quantity,
  locationType,
  materialCost,
  laborCost
) {
  // Update display fields
  document.getElementById("displayIntervention").textContent = interventionType;
  document.getElementById("displayMaterial").textContent = materialType;
  document.getElementById("displayLocation").textContent = locationType;
  document.getElementById("displayQuantity").textContent = quantity + " units";
  document.getElementById("displayQuantity2").textContent = quantity + " units";
  document.getElementById("materialPerUnit").textContent =
    "₹" + parseFloat(materialCost).toLocaleString("en-IN");
  document.getElementById("laborPerUnit").textContent =
    "₹" + parseFloat(laborCost).toLocaleString("en-IN");
}

// Chart Creation Function
function createCostChart(materialCost, laborCost) {
  const ctx = document.getElementById("costChart").getContext("2d");

  // Destroy existing chart if it exists
  if (costChart) {
    costChart.destroy();
  }

  // Create new pie chart
  costChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Material Cost", "Labor Cost"],
      datasets: [
        {
          data: [materialCost, laborCost],
          backgroundColor: ["#A8E6CF", "#2E7D32"],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              family: "Poppins",
              size: 14,
            },
            padding: 15,
            color: getComputedStyle(document.body).getPropertyValue(
              "--text-dark"
            ),
          },
        },
        title: {
          display: true,
          text: "Cost Breakdown",
          font: {
            family: "Poppins",
            size: 16,
            weight: "bold",
          },
          padding: 20,
          color: getComputedStyle(document.body).getPropertyValue(
            "--dark-forest-green"
          ),
        },
      },
    },
  });
}

// Calculate project timeline
function calculateTimeline(interventionType, quantity, locationType) {
  const interventionData = timelineDatabase[interventionType];
  if (!interventionData) return null;

  const locationMultiplier =
    interventionData.locationMultipliers[locationType] || 1;

  // Calculate base duration
  const baseDuration = interventionData.baseDays;
  const unitDuration = interventionData.perUnit * quantity;
  const totalBaseDays = (baseDuration + unitDuration) * locationMultiplier;

  // Calculate phase durations
  const phases = { ...interventionData.phases };
  Object.keys(phases).forEach((phase) => {
    phases[phase] = Math.ceil(phases[phase] * locationMultiplier);
  });

  // Calculate phase totals
  const prepDuration = phases.planning + phases.procurement;
  const constructionDuration = phases.sitePrep + phases.construction;
  const completionDuration = phases.quality + phases.approval;
  const totalDuration =
    prepDuration + constructionDuration + completionDuration;

  return {
    totalDuration: Math.ceil(totalDuration),
    prepDuration: Math.ceil(prepDuration),
    constructionDuration: Math.ceil(constructionDuration),
    completionDuration: Math.ceil(completionDuration),
    phases: phases,
    recommendation:
      timelineRecommendations[interventionType]?.[locationType] ||
      "Plan accordingly based on local conditions and resource availability.",
  };
}

// Update timeline display in results
function updateTimelineDisplay(interventionType, quantity, locationType) {
  const timelineData = calculateTimeline(
    interventionType,
    quantity,
    locationType
  );

  if (!timelineData) {
    // Hide timeline section if no data
    const timelineSection = document.querySelector(".timeline-section");
    if (timelineSection) {
      timelineSection.style.display = "none";
    }
    return;
  }

  // Show timeline section
  const timelineSection = document.querySelector(".timeline-section");
  if (timelineSection) {
    timelineSection.style.display = "block";
  }

  // Update main timeline cards
  document.getElementById(
    "totalDuration"
  ).textContent = `${timelineData.totalDuration} days`;
  document.getElementById(
    "prepDuration"
  ).textContent = `${timelineData.prepDuration} days`;
  document.getElementById(
    "constructionDuration"
  ).textContent = `${timelineData.constructionDuration} days`;
  document.getElementById(
    "completionDuration"
  ).textContent = `${timelineData.completionDuration} days`;

  // Create timeline visualization
  createTimelineVisualization(timelineData);
}

// Create timeline visualization
function createTimelineVisualization(timelineData) {
  const timelineViz = document.getElementById("timelineVisualization");

  if (!timelineViz) {
    console.log("Timeline visualization container not found");
    return;
  }

  const phases = [
    {
      name: "Planning & Permits",
      days: timelineData.phases.planning,
      icon: "📋",
    },
    {
      name: "Material Procurement",
      days: timelineData.phases.procurement,
      icon: "📦",
    },
    {
      name: "Site Preparation",
      days: timelineData.phases.sitePrep,
      icon: "👷",
    },
    {
      name: "Construction",
      days: timelineData.phases.construction,
      icon: "🏗️",
    },
    { name: "Quality Checks", days: timelineData.phases.quality, icon: "✅" },
    { name: "Final Approval", days: timelineData.phases.approval, icon: "📝" },
  ];

  // Create timeline visualization HTML
  timelineViz.innerHTML = `
    <div class="timeline-visual">
      ${phases
        .map(
          (phase) => `
        <div class="timeline-phase-item">
          <div class="phase-icon">${phase.icon}</div>
          <div class="phase-content">
            <div class="phase-name">${phase.name}</div>
            <div class="phase-duration">${phase.days} day${
            phase.days !== 1 ? "s" : ""
          }</div>
            <div class="phase-bar">
              <div class="phase-progress" style="width: ${
                (phase.days / timelineData.totalDuration) * 100
              }%"></div>
            </div>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    <div class="timeline-summary">
      <div class="summary-item">
        <span class="summary-label">Total Project Duration:</span>
        <span class="summary-value">${timelineData.totalDuration} days</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Daily Progress:</span>
        <span class="summary-value">${Math.round(
          (1 / timelineData.totalDuration) * 100
        )}% per day</span>
      </div>
    </div>
  `;
}

// Calculate environmental impact
function calculateEnvironmentalImpact(
  interventionType,
  materialType,
  quantity,
  locationType,
  materialCost
) {
  const materialData = environmentalDatabase[materialType];
  if (!materialData) return null;

  // Calculate total material weight (simplified estimation)
  const materialWeight = calculateMaterialWeight(
    interventionType,
    quantity,
    materialCost
  );

  // Calculate carbon footprint components
  const materialProduction = materialWeight * materialData.carbonPerUnit;
  const transportation =
    materialWeight *
    materialData.transportation *
    getTransportDistance(locationType);
  const construction = materialWeight * 0.1; // Construction emissions
  const maintenance = materialWeight * materialData.maintenance * 5; // 5-year maintenance

  const totalCarbon =
    materialProduction + transportation + construction + maintenance;

  // Calculate water usage
  const waterUsage = materialWeight * materialData.waterPerUnit;

  // Calculate eco-score (0-100, higher is better)
  const ecoScore = calculateEcoScore(materialType, totalCarbon, waterUsage);

  // Get comparisons
  const carbonComparison = getCarbonComparison(totalCarbon);
  const waterComparison = getWaterComparison(waterUsage);

  return {
    totalCarbon: Math.round(totalCarbon),
    waterUsage: Math.round(waterUsage),
    ecoScore: ecoScore,
    carbonComparison: carbonComparison,
    waterComparison: waterComparison,
    breakdown: {
      materialProduction: Math.round(materialProduction),
      transportation: Math.round(transportation),
      construction: Math.round(construction),
      maintenance: Math.round(maintenance),
    },
    recommendation:
      environmentalRecommendations[interventionType]?.[locationType] ||
      "Consider sustainable materials and efficient construction practices.",
    alternatives: ecoAlternatives[materialType] || [],
  };
}

// Helper function to estimate material weight
function calculateMaterialWeight(interventionType, quantity, materialCost) {
  const weightFactors = {
    "Speed Breaker": 500, // kg per unit
    "Guard Rail": 200, // kg per meter
    "Road Signage": 50, // kg per sign
    "Street Light": 150, // kg per light
    "Zebra Crossing": 100, // kg per sqm
    "Traffic Signal": 300, // kg per signal
  };

  return (weightFactors[interventionType] || 100) * quantity;
}

// Helper function to get transportation distance based on location
function getTransportDistance(locationType) {
  const distances = {
    Urban: 50, // km
    Rural: 100, // km
    Highway: 200, // km
    Residential: 30, // km
  };
  return distances[locationType] || 50;
}

// Calculate eco-score (0-100)
function calculateEcoScore(materialType, totalCarbon, waterUsage) {
  let score = 100;

  // Deduct points based on carbon intensity
  const carbonIntensity = totalCarbon / 1000; // per ton
  score -= Math.min(carbonIntensity * 20, 40);

  // Deduct points based on water usage
  const waterIntensity = waterUsage / 1000; // per cubic meter
  score -= Math.min(waterIntensity * 15, 30);

  // Material-specific adjustments
  const materialScores = {
    Concrete: -5,
    Asphalt: -3,
    Metal: -15,
    Plastic: -20,
    Composite: -8,
  };
  score += materialScores[materialType] || 0;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// Get carbon footprint comparison
function getCarbonComparison(carbon) {
  const treesNeeded = Math.round(carbon / 25); // One tree absorbs ~25kg CO2 per year
  if (treesNeeded === 0) return "= minimal environmental impact";
  return `= ${treesNeeded} tree${
    treesNeeded !== 1 ? "s" : ""
  } needed to offset annually`;
}

// Get water usage comparison
function getWaterComparison(water) {
  const peopleEquivalent = Math.round(water / 150); // Average daily water usage per person
  if (peopleEquivalent === 0) return "= minimal water usage";
  return `= ${peopleEquivalent} person${
    peopleEquivalent !== 1 ? "'s" : "'"
  } daily water usage`;
}

// Update environmental impact display
// Update environmental impact display - UPDATED FOR NEW DESIGN
function updateEnvironmentalImpact(
  interventionType,
  materialType,
  quantity,
  locationType,
  materialCost
) {
  const impactData = calculateEnvironmentalImpact(
    interventionType,
    materialType,
    quantity,
    locationType,
    materialCost
  );

  if (!impactData) {
    // Hide environment section if no data
    const environmentSection = document.querySelector(".environment-section");
    if (environmentSection) {
      environmentSection.style.display = "none";
    }
    return;
  }

  // Show environment section
  const environmentSection = document.querySelector(".environment-section");
  if (environmentSection) {
    environmentSection.style.display = "block";
  }

  // ✅ UPDATE: Only update elements that exist in your new design
  // Update main impact cards
  const carbonFootprint = document.getElementById("carbonFootprint");
  const waterUsage = document.getElementById("waterUsage");
  const ecoScore = document.getElementById("ecoScore");

  if (carbonFootprint) {
    carbonFootprint.textContent = `${impactData.totalCarbon.toLocaleString()} kg CO₂`;
  }

  if (waterUsage) {
    waterUsage.textContent = `${impactData.waterUsage.toLocaleString()} L`;
  }

  if (ecoScore) {
    ecoScore.textContent = `${impactData.ecoScore}/100`;
  }

  // ✅ UPDATE: Only update comparisons if elements exist
  const carbonComparison = document.getElementById("carbonComparison");
  const waterComparison = document.getElementById("waterComparison");

  if (carbonComparison) {
    carbonComparison.textContent = impactData.carbonComparison;
  }

  if (waterComparison) {
    waterComparison.textContent = impactData.waterComparison;
  }

  // ✅ UPDATE: Only update progress bar if element exists
  const ecoScoreProgress = document.getElementById("ecoScoreProgress");
  if (ecoScoreProgress) {
    ecoScoreProgress.style.width = `${impactData.ecoScore}%`;
  }

  // ✅ UPDATE: Only update recommendation if element exists
  const environmentRecommendation = document.getElementById("environmentRecommendation");
  if (environmentRecommendation) {
    environmentRecommendation.textContent = impactData.recommendation;
  }

  // Update alternatives
  updateEcoAlternatives(impactData.alternatives);
}

// Update eco-friendly alternatives
// Update eco-friendly alternatives - UPDATED FOR NEW DESIGN
function updateEcoAlternatives(alternatives) {
  const alternativesList = document.getElementById("alternativesList");

  if (!alternativesList) {
    console.log("alternativesList element not found");
    return;
  }

  if (!alternatives || alternatives.length === 0) {
    alternativesList.innerHTML =
      '<div class="alternative-item"><p>No specific alternatives available for this material.</p></div>';
    return;
  }

  alternativesList.innerHTML = alternatives
    .map(
      (alt) => `
        <div class="alternative-item">
            <div class="alternative-icon">${alt.icon}</div>
            <div class="alternative-info">
                <div class="alternative-name">${alt.name}</div>
                <div class="alternative-benefit">${alt.benefit}</div>
            </div>
            <div class="alternative-impact">${alt.impact}</div>
        </div>
    `
    )
    .join("");
}

// Reset Form Function
function resetForm() {
  estimatorForm.reset();
  resultsSection.style.display = "none";

  // Hide additional sections
  const timelineSection = document.querySelector(".timeline-section");
  const environmentSection = document.querySelector(".environment-section");

  if (timelineSection) timelineSection.style.display = "none";
  if (environmentSection) environmentSection.style.display = "none";

  // Remove cost saving tips
  const existingTips = document.querySelector(".cost-saving-tips");
  if (existingTips) {
    existingTips.remove();
  }

  // Remove comparison section
  const comparisonSection = document.querySelector(".comparison-section");
  if (comparisonSection) {
    comparisonSection.remove();
  }

  if (costChart) {
    costChart.destroy();
    costChart = null;
  }

  // Hide material cost info
  hideMaterialCostInfo();

  // Scroll back to form
  document.getElementById("estimator").scrollIntoView({ behavior: "smooth" });
}

// PDF Download Function
function downloadPDF() {
  try {
    // Check if jsPDF is properly loaded
    if (typeof window.jspdf === "undefined") {
      alert(
        "❌ PDF library not loaded. Please check your internet connection and try again."
      );
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get all current values
    const interventionType = document.getElementById("interventionType").value;
    const materialType = document.getElementById("materialType").value;
    const quantity = document.getElementById("quantity").value;
    const locationType = document.getElementById("locationType").value;
    const laborCost = document.getElementById("laborCost").value;
    const materialCost = document.getElementById("materialCost").value;
    const totalMaterialCost =
      document.getElementById("totalMaterialCost").textContent;
    const totalLaborCost =
      document.getElementById("totalLaborCost").textContent;
    const grandTotal = document.getElementById("grandTotal").textContent;
    const recommendation =
      document.getElementById("recommendation").textContent;

    // Get timeline data
    const totalDuration = document.getElementById("totalDuration").textContent;
    const prepDuration = document.getElementById("prepDuration").textContent;
    const constructionDuration = document.getElementById(
      "constructionDuration"
    ).textContent;

    // Get environmental data
    const carbonFootprint =
      document.getElementById("carbonFootprint").textContent;
    const waterUsage = document.getElementById("waterUsage").textContent;
    const ecoScore = document.getElementById("ecoScore").textContent;

    // Validate that we have results to export
    if (!interventionType || grandTotal === "₹0") {
      alert(
        "❌ Please calculate an estimate first before downloading the PDF."
      );
      return;
    }

    // Current date
    const currentDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Set proper font
    doc.setFont("helvetica", "normal");

    // PDF Header
    doc.setFontSize(22);
    doc.setTextColor(46, 125, 50);
    doc.text("Smart Road Intervention Estimator", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Project Cost Report", 105, 30, { align: "center" });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Generated: ${currentDate}`, 105, 38, { align: "center" });

    // Divider line
    doc.setDrawColor(168, 230, 207);
    doc.setLineWidth(0.5);
    doc.line(20, 42, 190, 42);

    // Input Parameters Section
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50);
    doc.text("Input Parameters", 20, 52);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let yPos = 62;

    doc.text("Intervention Type: " + interventionType, 25, yPos);
    yPos += 8;
    doc.text("Material Type: " + materialType, 25, yPos);
    yPos += 8;
    doc.text("Quantity: " + quantity + " units", 25, yPos);
    yPos += 8;
    doc.text("Location Type: " + locationType, 25, yPos);
    yPos += 8;
    doc.text(
      "Labor Cost per Unit: ₹" + parseFloat(laborCost).toLocaleString("en-IN"),
      25,
      yPos
    );
    yPos += 8;
    doc.text(
      "Material Cost per Unit: ₹" +
        parseFloat(materialCost).toLocaleString("en-IN"),
      25,
      yPos
    );

    // Divider line
    yPos += 8;
    doc.setDrawColor(168, 230, 207);
    doc.line(20, yPos, 190, yPos);

    // Cost Breakdown Section
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50);
    doc.text("Cost Breakdown", 20, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Total Material Cost: " + totalMaterialCost, 25, yPos);
    yPos += 8;
    doc.text("Total Labor Cost: " + totalLaborCost, 25, yPos);
    yPos += 8;

    // Grand Total Box
    doc.setFillColor(46, 125, 50);
    doc.roundedRect(20, yPos, 170, 12, 2, 2, "F");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("GRAND TOTAL: " + grandTotal, 25, yPos + 8);

    // Timeline Section in PDF
    yPos += 18;
    doc.setDrawColor(168, 230, 207);
    doc.line(20, yPos, 190, yPos);

    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50);
    doc.text("Project Timeline", 20, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Total Duration: " + totalDuration, 25, yPos);
    yPos += 8;
    doc.text("Preparation Phase: " + prepDuration, 25, yPos);
    yPos += 8;
    doc.text("Construction Phase: " + constructionDuration, 25, yPos);

    // Environmental Impact Section in PDF
    yPos += 18;
    doc.setDrawColor(168, 230, 207);
    doc.line(20, yPos, 190, yPos);

    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50);
    doc.text("Environmental Impact", 20, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Carbon Footprint: " + carbonFootprint, 25, yPos);
    yPos += 8;
    doc.text("Water Usage: " + waterUsage, 25, yPos);
    yPos += 8;
    doc.text("Eco-Score: " + ecoScore, 25, yPos);

    // Divider line
    yPos += 8;
    doc.setDrawColor(168, 230, 207);
    doc.line(20, yPos, 190, yPos);

    // AI Recommendation Section
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(46, 125, 50);
    doc.text("AI Recommendation", 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Handle long recommendations by splitting text
    const maxWidth = 170;
    const splitRecommendation = doc.splitTextToSize(recommendation, maxWidth);
    doc.text(splitRecommendation, 20, yPos);

    // Footer Section
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "_______________________________________________________________",
      105,
      270,
      { align: "center" }
    );
    doc.setFontSize(10);
    doc.setTextColor(46, 125, 50);
    doc.text("✓ Verified by Smart Road Estimator", 105, 278, {
      align: "center",
    });
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Built by Subashis Palai for National Road Safety Hackathon 2025",
      105,
      285,
      { align: "center" }
    );

    // Generate safe filename
    const timestamp = new Date().getTime();
    const safeIntervention = interventionType.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `Road_Estimate_${safeIntervention}_${timestamp}.pdf`;

    // Save the PDF
    doc.save(filename);

    // Show success message
    showNotification("✅ PDF Report downloaded successfully!");
  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert(
      "❌ Failed to generate PDF. Please try again or check the console for details."
    );
  }
}

// Save current estimate to history
function saveEstimate() {
  const interventionType = document.getElementById("interventionType").value;
  const materialType = document.getElementById("materialType").value;
  const quantity = document.getElementById("quantity").value;
  const locationType = document.getElementById("locationType").value;
  const grandTotal = document.getElementById("grandTotal").textContent;
  const totalMaterialCost = document.getElementById("totalMaterialCost").textContent;
  const totalLaborCost = document.getElementById("totalLaborCost").textContent;
  const recommendation = document.getElementById("recommendation").textContent;

  // Get timeline data
  const totalDuration = document.getElementById("totalDuration").textContent;
  const prepDuration = document.getElementById("prepDuration").textContent;
  const constructionDuration = document.getElementById("constructionDuration").textContent;

  // Get environmental data
  const carbonFootprint = document.getElementById("carbonFootprint").textContent;
  const waterUsage = document.getElementById("waterUsage").textContent;
  const ecoScore = document.getElementById("ecoScore").textContent;

  // Validate that we have a calculated estimate
  if (grandTotal === "₹0" || !interventionType) {
    showNotification("❌ Please calculate an estimate first before saving!");
    return;
  }

  const estimateData = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    interventionType: interventionType,
    materialType: materialType,
    quantity: parseInt(quantity),
    locationType: locationType,
    laborCost: parseFloat(document.getElementById("laborCost").value),
    materialCost: parseFloat(document.getElementById("materialCost").value),
    totalCost: grandTotal,
    details: {
      materialCost: totalMaterialCost,
      laborCost: totalLaborCost,
    },
    timeline: {
      totalDuration: totalDuration,
      prepDuration: prepDuration,
      constructionDuration: constructionDuration,
    },
    environment: {
      carbonFootprint: carbonFootprint,
      waterUsage: waterUsage,
      ecoScore: ecoScore,
    },
    recommendation: recommendation,
  };

  // Use StorageManager for offline capability
  if (StorageManager.saveEstimate(estimateData)) {
    // Update local projectHistory array
    projectHistory = StorageManager.getSavedEstimates();
    
    // Update display
    updateHistoryDisplay();
    updateHistoryStats();

    // Show success message with offline indicator
    const offlineMsg = navigator.onLine ? '' : ' (Saved Offline)';
    showNotification("✅ Project saved to history!" + offlineMsg);

    // Scroll to history section
    setTimeout(() => scrollToSection("history"), 1000);
  } else {
    showNotification("❌ Failed to save estimate. Please try again.", 'error');
  }
}

// Update history display
function updateHistoryDisplay() {
  const historyList = document.getElementById("historyList");
  const emptyState = document.getElementById("emptyHistory");

  if (!historyList || !emptyState) return;

  if (projectHistory.length === 0) {
    historyList.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  historyList.style.display = "grid";

  // Generate history items HTML
  historyList.innerHTML = projectHistory
    .map(
      (project) => `
        <div class="history-item" data-id="${project.id}">
            <div class="history-item-header">
                <div class="history-item-title">
                    <div class="history-icon">${getInterventionIcon(
                      project.interventionType
                    )}</div>
                    <div class="history-item-info">
                        <h3>${project.interventionType} - ${
        project.materialType
      }</h3>
                        <div class="history-item-meta">
                            <span>📍 ${project.locationType}</span>
                            <span>🔢 ${project.quantity} units</span>
                            <span>📅 ${formatDate(project.timestamp)}</span>
                        </div>
                    </div>
                </div>
                <div class="history-item-cost">
                    <div class="history-total-cost">${project.totalCost}</div>
                    <div class="history-cost-label">Total Cost</div>
                </div>
            </div>
            
            <div class="history-item-details">
                <div class="detail-item">
                    <span class="detail-label">Material Cost</span>
                    <span class="detail-value">${
                      project.details.materialCost
                    }</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Labor Cost</span>
                    <span class="detail-value">${
                      project.details.laborCost
                    }</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Unit Labor Cost</span>
                    <span class="detail-value">₹${parseFloat(
                      project.laborCost
                    ).toLocaleString("en-IN")}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Unit Material Cost</span>
                    <span class="detail-value">₹${parseFloat(
                      project.materialCost
                    ).toLocaleString("en-IN")}</span>
                </div>
                ${
                  project.timeline
                    ? `
                <div class="detail-item">
                    <span class="detail-label">Project Duration</span>
                    <span class="detail-value">${project.timeline.totalDuration}</span>
                </div>
                `
                    : ""
                }
                ${
                  project.environment
                    ? `
                <div class="detail-item">
                    <span class="detail-label">Carbon Footprint</span>
                    <span class="detail-value">${project.environment.carbonFootprint}</span>
                </div>
                `
                    : ""
                }
            </div>
            
            ${
              project.recommendation
                ? `
            <div class="recommendation-box">
                <h4>💡 AI Recommendation</h4>
                <p>${project.recommendation}</p>
            </div>
            `
                : ""
            }
            
            <div class="history-item-actions">
                <button class="btn-history btn-view" onclick="loadProject(${
                  project.id
                })">
                    <span class="btn-icon">👁️</span>
                    View Details
                </button>
                <button class="btn-history btn-delete" onclick="deleteProject(${
                  project.id
                })">
                    <span class="btn-icon">🗑️</span>
                    Delete
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

// Update history statistics
function updateHistoryStats() {
  const totalProjects = document.getElementById("totalProjects");
  const totalInvestment = document.getElementById("totalInvestment");

  if (!totalProjects || !totalInvestment) return;

  totalProjects.textContent = projectHistory.length;

  // Calculate total investment
  const total = projectHistory.reduce((sum, project) => {
    const cost = parseFloat(project.totalCost.replace(/[₹,]/g, ""));
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  totalInvestment.textContent =
    "₹" +
    total.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
}

// Get icon for intervention type
function getInterventionIcon(type) {
  const icons = {
    "Speed Breaker": "🛑",
    "Guard Rail": "🚧",
    "Road Signage": "🪧",
    "Street Light": "💡",
    "Zebra Crossing": "🚶",
    "Traffic Signal": "🚦",
  };
  return icons[type] || "🏗️";
}

// Format date for display
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Load project into estimator
function loadProject(projectId) {
  const project = projectHistory.find((p) => p.id === projectId);
  if (!project) return;

  // Fill the form with project data
  document.getElementById("interventionType").value = project.interventionType;
  document.getElementById("materialType").value = project.materialType;
  document.getElementById("quantity").value = project.quantity;
  document.getElementById("locationType").value = project.locationType;
  document.getElementById("laborCost").value = project.laborCost;
  document.getElementById("materialCost").value = project.materialCost;

  // Calculate and show results
  calculateEstimate();

  // Scroll to estimator
  scrollToSection("estimator");

  showNotification("📋 Project loaded into estimator!");
}

// Delete individual project
function deleteProject(projectId) {
  if (confirm("Are you sure you want to delete this project?")) {
    // Get current estimates
    const estimates = StorageManager.getSavedEstimates();
    // Filter out the deleted project
    const updatedEstimates = estimates.filter((p) => p.id !== projectId);
    // Save back to localStorage with correct key
    localStorage.setItem("roadEstimates", JSON.stringify(updatedEstimates));
    // Update local projectHistory
    projectHistory = updatedEstimates;
    updateHistoryDisplay();
    updateHistoryStats();
    showNotification("🗑️ Project deleted!");
  }
}

// Clear all history
function clearAllHistory() {
  if (projectHistory.length === 0) {
    showNotification("ℹ️ History is already empty!");
    return;
  }

  if (
    confirm(
      "Are you sure you want to clear all project history? This action cannot be undone."
    )
  ) {
 if (StorageManager.clearAllHistory()) {
  projectHistory = [];
  showNotification("🗑️ All history cleared!");
  updateHistoryDisplay();
  updateHistoryStats();
} else {
  showNotification("❌ Failed to clear history.", 'error');
}
  }
}


// Export history as CSV
function exportHistory() {
  StorageManager.exportHistory();
}

// Show notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--dark-forest-green);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// ==================== PROJECT COMPARISON TOOL ====================
let currentComparison = null;

function saveForComparison() {
  const interventionType = document.getElementById("interventionType").value;
  const materialType = document.getElementById("materialType").value;
  const quantity = document.getElementById("quantity").value;
  const locationType = document.getElementById("locationType").value;

  // Get calculated values
  const totalMaterialCost =
    document.getElementById("totalMaterialCost").textContent;
  const totalLaborCost = document.getElementById("totalLaborCost").textContent;
  const grandTotal = document.getElementById("grandTotal").textContent;

  if (!interventionType || grandTotal === "₹0") {
    showNotification(
      "❌ Please calculate an estimate first before saving for comparison."
    );
    return;
  }

  currentComparison = {
    timestamp: new Date().toLocaleTimeString(),
    interventionType: interventionType,
    materialType: materialType,
    quantity: quantity,
    locationType: locationType,
    totalMaterialCost: totalMaterialCost,
    totalLaborCost: totalLaborCost,
    grandTotal: grandTotal,
    recommendation: document.getElementById("recommendation").textContent,
  };

  showNotification(
    "✅ Project saved for comparison! Change materials and calculate again to compare."
  );

  // Show comparison button
  document.getElementById("compareBtn").style.display = "flex";
}

function showComparison() {
  if (!currentComparison) {
    showNotification(
      "❌ No project saved for comparison. Calculate an estimate first."
    );
    return;
  }

  const currentMaterial = document.getElementById("materialType").value;
  const currentGrandTotal = document.getElementById("grandTotal").textContent;

  // Calculate savings percentage
  const oldCost = parseFloat(currentComparison.grandTotal.replace(/[₹,]/g, ""));
  const newCost = parseFloat(currentGrandTotal.replace(/[₹,]/g, ""));
  const savings = oldCost - newCost;
  const savingsPercent = ((savings / oldCost) * 100).toFixed(1);

  const comparisonHTML = `
        <div class="comparison-section">
            <h4>🔄 Cost Comparison</h4>
            <div class="comparison-grid">
                <div class="comparison-card">
                    <div class="comparison-header">
                        <h5>Original Project</h5>
                        <span class="comparison-badge">Saved</span>
                    </div>
                    <div class="comparison-content">
                        <div class="comparison-item">
                            <span class="comparison-label">Material:</span>
                            <span class="comparison-value">${
                              currentComparison.materialType
                            }</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-label">Total Cost:</span>
                            <span class="comparison-value">${
                              currentComparison.grandTotal
                            }</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-label">Material Cost:</span>
                            <span class="comparison-value">${
                              currentComparison.totalMaterialCost
                            }</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-label">Labor Cost:</span>
                            <span class="comparison-value">${
                              currentComparison.totalLaborCost
                            }</span>
                        </div>
                    </div>
                </div>
                
                <div class="comparison-card current">
                    <div class="comparison-header">
                        <h5>Current Project</h5>
                        <span class="comparison-badge current">Current</span>
                    </div>
                    <div class="comparison-content">
                        <div class="comparison-item">
                            <span class="comparison-label">Material:</span>
                            <span class="comparison-value">${currentMaterial}</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-label">Total Cost:</span>
                            <span class="comparison-value">${currentGrandTotal}</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-label">Material Cost:</span>
                            <span class="comparison-value">${
                              document.getElementById("totalMaterialCost")
                                .textContent
                            }</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-label">Labor Cost:</span>
                            <span class="comparison-value">${
                              document.getElementById("totalLaborCost")
                                .textContent
                            }</span>
                        </div>
                    </div>
                </div>
            </div>
            
            ${
              savings !== 0
                ? `
            <div class="savings-summary ${
              savings > 0 ? "savings-positive" : "savings-negative"
            }">
                <div class="savings-icon">${savings > 0 ? "💰" : "⚠️"}</div>
                <div class="savings-content">
                    <div class="savings-title">${
                      savings > 0 ? "Cost Savings" : "Cost Increase"
                    }</div>
                    <div class="savings-amount">${
                      savings > 0 ? "Save" : "Increase"
                    } ₹${Math.abs(savings).toLocaleString("en-IN")} (${Math.abs(
                    savingsPercent
                  )}%)</div>
                </div>
            </div>
            `
                : ""
            }
            
            <div class="comparison-actions">
                <button class="btn btn-secondary" onclick="clearComparison()">
                    <span class="btn-icon">🗑️</span>
                    Clear Comparison
                </button>
            </div>
        </div>
    `;

  // Remove existing comparison if any
  const existingComparison = document.querySelector(".comparison-section");
  if (existingComparison) {
    existingComparison.remove();
  }

  // Insert after cost saving tips
  const costSavingTips = document.querySelector(".cost-saving-tips");
  if (costSavingTips) {
    costSavingTips.insertAdjacentHTML("afterend", comparisonHTML);
  } else {
    // Fallback: insert before timeline
    const timelineSection = document.querySelector(".timeline-section");
    if (timelineSection) {
      timelineSection.insertAdjacentHTML("beforebegin", comparisonHTML);
    }
  }
}

function clearComparison() {
  currentComparison = null;
  document.querySelector(".comparison-section")?.remove();
  document.getElementById("compareBtn").style.display = "none";
  showNotification("🗑️ Comparison cleared");
}

// Navbar Scroll Effect
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
  } else {
    navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
  }
});

// Intersection Observer for Scroll Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe elements for animation
document
  .querySelectorAll(
    ".feature-card, .developer-card, .estimator-card, .history-item"
  )
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
    observer.observe(el);
  });

// Console welcome message
console.log(
  "%c🛣️ Smart Road Intervention Estimator",
  "color: #2E7D32; font-size: 20px; font-weight: bold;"
);
console.log(
  "%cBuilt by Subashis Palai for National Road Safety Hackathon 2025",
  "color: #A8E6CF; font-size: 12px;"
);

// Timeline Update Function


// Timeline Update Function
function updateTimeline(interventionType, quantity) {
    // Base durations for different intervention types
    const baseDurations = {
        'Speed Breaker': { planning: 1, procurement: 2, preparation: 1, construction: 1, quality: 1, approval: 1 },
        'Guard Rail': { planning: 2, procurement: 3, preparation: 2, construction: 2, quality: 1, approval: 1 },
        'Road Signage': { planning: 1, procurement: 2, preparation: 1, construction: 1, quality: 1, approval: 1 },
        'Street Light': { planning: 2, procurement: 4, preparation: 2, construction: 3, quality: 1, approval: 1 },
        'Zebra Crossing': { planning: 1, procurement: 2, preparation: 1, construction: 2, quality: 1, approval: 1 },
        'Traffic Signal': { planning: 3, procurement: 5, preparation: 3, construction: 4, quality: 2, approval: 2 }
    };

    // Get base durations for the intervention type
    const durations = baseDurations[interventionType] || baseDurations['Speed Breaker'];
    
    // Adjust durations based on quantity (more quantity = slightly more time)
    const quantityMultiplier = Math.min(1 + (quantity * 0.1), 2); // Max 2x time
    
    const adjustedDurations = {
        planning: Math.ceil(durations.planning * quantityMultiplier),
        procurement: Math.ceil(durations.procurement * quantityMultiplier),
        preparation: Math.ceil(durations.preparation * quantityMultiplier),
        construction: Math.ceil(durations.construction * quantityMultiplier),
        quality: Math.ceil(durations.quality * quantityMultiplier),
        approval: Math.ceil(durations.approval * quantityMultiplier)
    };

    // Update individual phase durations in the HTML
    document.getElementById('planningDuration').textContent = adjustedDurations.planning + ' day' + (adjustedDurations.planning !== 1 ? 's' : '');
    document.getElementById('procurementDuration').textContent = adjustedDurations.procurement + ' day' + (adjustedDurations.procurement !== 1 ? 's' : '');
    document.getElementById('prepDuration').textContent = adjustedDurations.preparation + ' day' + (adjustedDurations.preparation !== 1 ? 's' : '');
    document.getElementById('constructionDuration').textContent = adjustedDurations.construction + ' day' + (adjustedDurations.construction !== 1 ? 's' : '');
    document.getElementById('qualityDuration').textContent = adjustedDurations.quality + ' day' + (adjustedDurations.quality !== 1 ? 's' : '');
    document.getElementById('approvalDuration').textContent = adjustedDurations.approval + ' day' + (adjustedDurations.approval !== 1 ? 's' : '');
    
    // Calculate total duration
    const totalDays = adjustedDurations.planning + adjustedDurations.procurement + adjustedDurations.preparation + 
                     adjustedDurations.construction + adjustedDurations.quality + adjustedDurations.approval;
    
    // Update total duration display
    document.getElementById('totalDuration').textContent = totalDays + ' day' + (totalDays !== 1 ? 's' : '');
    
    // Calculate and update daily progress
    const dailyProgress = Math.round((1 / totalDays) * 100);
    document.querySelector('.progress-value').textContent = `~${dailyProgress}% per day`;
    
    // Show the timeline section
    document.querySelector('.timeline-section').style.display = 'block';
    
    return totalDays;
}

// Add this to your script.js file
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // If it's the comparison section and it's hidden, show it first
        if (sectionId === 'comparison' && section.style.display === 'none') {
            showComparison(); // This should be your function to show comparison
        }
        
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Fix comparison navigation
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Handle navigation clicks
document.addEventListener('DOMContentLoaded', function() {
    // Handle all navigation links
    const navLinks = document.querySelectorAll('.nav-links a, .footer-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal links
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                scrollToSection(targetId);
            }
            // External links will open normally
        });
    });
});