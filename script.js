// ===================================
// การจัดการ Theme
// ===================================
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// โหลด theme ที่บันทึกไว้
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// ===================================
// ฟังก์ชันคำนวณหลัก
// ===================================
function calculate() {
    // รับค่าจากฟอร์ม
    const inputs = getInputValues();
    
    // ตรวจสอบความถูกต้องของข้อมูล
    if (!validateInputs(inputs)) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
        return;
    }

    // คำนวณค่าไฟฟ้า
    const regularCost = calculateRegularCost(inputs);
    const touCost = calculateTOUCost(inputs);
    
    // แสดงผลลัพธ์
    displayResults(regularCost, touCost, inputs.units);
    
    // แสดงส่วนผลลัพธ์และเลื่อนหน้าจอ
    showResults();
}

// ===================================
// ฟังก์ชันรับค่าจากฟอร์ม
// ===================================
function getInputValues() {
    return {
        units: parseFloat(document.getElementById('units').value) || 0,
        peakUsage: parseFloat(document.getElementById('peakUsage').value) || 0,
        normalRate: parseFloat(document.getElementById('normalRate').value) || 0,
        peakRate: parseFloat(document.getElementById('peakRate').value) || 0,
        offPeakRate: parseFloat(document.getElementById('offPeakRate').value) || 0,
        ftRate: parseFloat(document.getElementById('ftRate').value) || 0
    };
}

// ===================================
// ฟังก์ชันตรวจสอบข้อมูล
// ===================================
function validateInputs(inputs) {
    return inputs.units > 0 && 
           inputs.normalRate > 0 && 
           inputs.peakRate > 0 && 
           inputs.offPeakRate > 0 &&
           inputs.peakUsage >= 0 && 
           inputs.peakUsage <= 100;
}

// ===================================
// คำนวณค่าไฟฟ้ามิเตอร์ปกติ
// ===================================
function calculateRegularCost(inputs) {
    const base = inputs.units * inputs.normalRate;
    const ft = inputs.units * inputs.ftRate;
    const total = base + ft;
    
    return {
        base: base,
        ft: ft,
        total: total,
        perUnit: total / inputs.units
    };
}

// ===================================
// คำนวณค่าไฟฟ้ามิเตอร์ TOU
// ===================================
function calculateTOUCost(inputs) {
    const peakUnits = inputs.units * (inputs.peakUsage / 100);
    const offPeakUnits = inputs.units * ((100 - inputs.peakUsage) / 100);
    
    const peakCost = peakUnits * inputs.peakRate;
    const offPeakCost = offPeakUnits * inputs.offPeakRate;
    const base = peakCost + offPeakCost;
    const ft = inputs.units * inputs.ftRate;
    const total = base + ft;
    
    return {
        peakCost: peakCost,
        offPeakCost: offPeakCost,
        peakUnits: peakUnits,
        offPeakUnits: offPeakUnits,
        ft: ft,
        total: total,
        perUnit: total / inputs.units
    };
}

// ===================================
// แสดงผลลัพธ์
// ===================================
function displayResults(regular, tou, units) {
    // แสดงผลมิเตอร์ปกติ
    updateRegularDisplay(regular);
    
    // แสดงผล TOU
    updateTOUDisplay(tou);
    
    // แสดงการเปรียบเทียบ
    updateComparison(regular.total, tou.total);
}

// ===================================
// อัปเดตการแสดงผลมิเตอร์ปกติ
// ===================================
function updateRegularDisplay(regular) {
    document.getElementById('regularCost').textContent = formatCurrency(regular.total);
    document.getElementById('regularBase').textContent = formatCurrency(regular.base);
    document.getElementById('regularFt').textContent = formatCurrency(regular.ft);
    document.getElementById('regularPerUnit').textContent = formatCurrency(regular.perUnit);
}

// ===================================
// อัปเดตการแสดงผล TOU
// ===================================
function updateTOUDisplay(tou) {
    document.getElementById('touCost').textContent = formatCurrency(tou.total);
    document.getElementById('touPeak').textContent = 
        `${formatCurrency(tou.peakCost)} (${tou.peakUnits.toFixed(0)} หน่วย)`;
    document.getElementById('touOffPeak').textContent = 
        `${formatCurrency(tou.offPeakCost)} (${tou.offPeakUnits.toFixed(0)} หน่วย)`;
    document.getElementById('touFt').textContent = formatCurrency(tou.ft);
    document.getElementById('touPerUnit').textContent = formatCurrency(tou.perUnit);
}

// ===================================
// อัปเดตการเปรียบเทียบ
// ===================================
function updateComparison(regularTotal, touTotal) {
    const savings = regularTotal - touTotal;
    const savingsPercent = (savings / regularTotal) * 100;
    
    // Reset styles
    const regularCard = document.getElementById('regularCard');
    const touCard = document.getElementById('touCard');
    const summary = document.getElementById('summary');
    
    regularCard.classList.remove('better');
    touCard.classList.remove('better');
    
    // Remove existing badges
    const existingBadges = document.querySelectorAll('.badge');
    existingBadges.forEach(badge => badge.remove());
    
    // Update comparison display
    if (savings > 0) {
        updateForTOUSavings(touCard, savings, savingsPercent, summary);
    } else if (savings < 0) {
        updateForRegularSavings(regularCard, savings, savingsPercent, summary);
    } else {
        updateForEqualCost(summary);
    }
}

// ===================================
// กรณี TOU ถูกกว่า
// ===================================
function updateForTOUSavings(touCard, savings, savingsPercent, summary) {
    touCard.classList.add('better');
    addBadge(touCard, 'คุ้มกว่า');
    
    document.getElementById('savingsAmount').textContent = 
        `ประหยัด ${formatCurrency(Math.abs(savings))}/เดือน`;
    document.getElementById('savingsPercent').textContent = 
        `ประหยัด ${Math.abs(savingsPercent).toFixed(1)}%`;
    document.getElementById('recommendation').textContent = 
        `✅ แนะนำใช้มิเตอร์ TOU - ประหยัดได้ ${formatCurrency(Math.abs(savings) * 12)}/ปี`;
    
    summary.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
}

// ===================================
// กรณีมิเตอร์ปกติถูกกว่า
// ===================================
function updateForRegularSavings(regularCard, savings, savingsPercent, summary) {
    regularCard.classList.add('better');
    addBadge(regularCard, 'คุ้มกว่า');
    
    document.getElementById('savingsAmount').textContent = 
        `แพงกว่า ${formatCurrency(Math.abs(savings))}/เดือน`;
    document.getElementById('savingsPercent').textContent = 
        `แพงกว่า ${Math.abs(savingsPercent).toFixed(1)}%`;
    document.getElementById('recommendation').textContent = 
        `⚠️ แนะนำใช้มิเตอร์ปกติ - ประหยัดได้ ${formatCurrency(Math.abs(savings) * 12)}/ปี`;
    
    summary.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
}

// ===================================
// กรณีราคาเท่ากัน
// ===================================
function updateForEqualCost(summary) {
    document.getElementById('savingsAmount').textContent = `฿0.00`;
    document.getElementById('savingsPercent').textContent = `เท่ากัน`;
    document.getElementById('recommendation').textContent = `ค่าไฟฟ้าเท่ากันทั้ง 2 แบบ`;
    
    summary.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
}

// ===================================
// ฟังก์ชันช่วยเหลือ
// ===================================
function formatCurrency(amount) {
    return `฿${amount.toFixed(2)}`;
}

function addBadge(card, text) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = text;
    card.querySelector('.result-header').appendChild(badge);
}

function showResults() {
    document.getElementById('results').classList.add('active');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// ===================================
// Event Listeners
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // โหลด theme ที่บันทึกไว้
    loadSavedTheme();
    
    // เพิ่ม Enter key support สำหรับทุก input
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculate();
            }
        });
    });
});